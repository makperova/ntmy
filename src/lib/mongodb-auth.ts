// Модуль для аутентификации через MongoDB
import { MongoClient, ObjectId } from 'mongodb';
import { compare, hash } from 'bcrypt';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Определяем типы
interface User {
  _id?: string | ObjectId;
  email: string;
  password?: string;
  createdAt: Date;
  [key: string]: any;
}

interface Session {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  email: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
  register: (email: string, password: string, userData?: object) => Promise<{ success?: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean }>;
  isAuthenticated: boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

// MongoDB URI из переменных окружения
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ntmy';

// Singleton для подключения к MongoDB
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Отсутствует MongoDB URI в переменных окружения');
}

if (process.env.NODE_ENV === 'development') {
  // В режиме разработки используем глобальную переменную
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // В продакшене создаем новое подключение
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Функция для получения подключения к MongoDB
export const getMongoClient = async (): Promise<MongoClient> => {
  return await clientPromise;
};

// Функция для регистрации пользователя
export const registerUser = async (email: string, password: string, userData: object = {}): Promise<{ user?: Omit<User, 'password'>; error?: string }> => {
  try {
    const client = await getMongoClient();
    const db = client.db();
    const users = db.collection('users');

    // Проверяем, существует ли пользователь
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return { error: 'Пользователь с таким email уже существует' };
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);

    // Создаем пользователя
    const user: User = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
      ...userData
    };

    const result = await users.insertOne(user);
    
    // Возвращаем созданного пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return { error: 'Не удалось зарегистрировать пользователя' };
  }
};

// Функция для входа пользователя
export const loginUser = async (email: string, password: string): Promise<{ session?: Session; error?: string }> => {
  try {
    const client = await getMongoClient();
    const db = client.db();
    const users = db.collection('users');

    // Ищем пользователя по email
    const user = await users.findOne({ email }) as User | null;
    if (!user) {
      return { error: 'Пользователь не найден' };
    }

    // Проверяем пароль
    const isPasswordValid = await compare(password, user.password || '');
    if (!isPasswordValid) {
      return { error: 'Неверный пароль' };
    }

    // Создаем сессию
    const session: Session = {
      userId: user._id as string | ObjectId,
      email: user.email,
      createdAt: new Date()
    };

    const result = await db.collection('sessions').insertOne(session);
    
    // Добавляем _id к сессии
    session._id = result.insertedId;

    // Возвращаем данные сессии
    return { session };
  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    return { error: 'Не удалось выполнить вход' };
  }
};

// Контекст аутентификации
const AuthContext = createContext<AuthContextType | null>(null);

// Провайдер аутентификации для React
export const AuthProvider = ({ children }: AuthProviderProps): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Загружаем пользователя из сессии при монтировании компонента
    const loadUserFromSession = async (): Promise<void> => {
      try {
        // Здесь можно получить сессию из localStorage или cookies
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setLoading(false);
          return;
        }

        const client = await getMongoClient();
        const db = client.db();
        
        let objId: ObjectId;
        try {
          objId = new ObjectId(sessionId);
        } catch (error) {
          console.error('Некорректный формат sessionId:', error);
          localStorage.removeItem('sessionId');
          setLoading(false);
          return;
        }
        
        const session = await db.collection('sessions').findOne({ _id: objId }) as Session | null;
        if (!session) {
          localStorage.removeItem('sessionId');
          setLoading(false);
          return;
        }

        const userData = await db.collection('users').findOne({ _id: session.userId }) as User | null;
        if (userData) {
          // Удаляем пароль из данных пользователя
          const { password, ...userWithoutPassword } = userData;
          setUser(userWithoutPassword);
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserFromSession();
  }, []);

  const login = async (email: string, password: string): Promise<{ success?: boolean; error?: string }> => {
    const result = await loginUser(email, password);
    if (result.session && result.session._id) {
      localStorage.setItem('sessionId', result.session._id.toString());
      setUser({
        _id: result.session.userId.toString(),
        email: result.session.email,
        createdAt: new Date()
      });
      return { success: true };
    }
    return { error: result.error };
  };

  const register = async (email: string, password: string, userData = {}): Promise<{ success?: boolean; error?: string }> => {
    const result = await registerUser(email, password, userData);
    if (result.user) {
      // После регистрации выполняем вход
      return await login(email, password);
    }
    return { error: result.error };
  };

  const logout = async (): Promise<{ success: boolean }> => {
    localStorage.removeItem('sessionId');
    setUser(null);
    return { success: true };
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Экспортируем MongoClient для других модулей
export { MongoClient }; 