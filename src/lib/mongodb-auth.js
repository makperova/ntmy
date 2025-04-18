'use server';
// Модуль для аутентификации через MongoDB
import { MongoClient } from 'mongodb';
import { compare, hash } from 'bcrypt';
import { createContext, useContext, useState, useEffect } from 'react';

// MongoDB URI из переменных окружения
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ntmy';

// Singleton для подключения к MongoDB
let client;
let clientPromise;

if (!uri) {
  throw new Error('Отсутствует MongoDB URI в переменных окружения');
}

if (process.env.NODE_ENV === 'development') {
  // В режиме разработки используем глобальную переменную
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // В продакшене создаем новое подключение
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

// Функция для получения подключения к MongoDB
export const getMongoClient = async () => {
  return await clientPromise;
};

// Функция для регистрации пользователя
export const registerUser = async (email, password, userData = {}) => {
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
    const user = {
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
export const loginUser = async (email, password) => {
  try {
    const client = await getMongoClient();
    const db = client.db();
    const users = db.collection('users');

    // Ищем пользователя по email
    const user = await users.findOne({ email });
    if (!user) {
      return { error: 'Пользователь не найден' };
    }

    // Проверяем пароль
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return { error: 'Неверный пароль' };
    }

    // Создаем сессию
    const session = {
      userId: user._id,
      email: user.email,
      createdAt: new Date()
    };

    await db.collection('sessions').insertOne(session);

    // Возвращаем данные сессии
    return { session };
  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    return { error: 'Не удалось выполнить вход' };
  }
};

// Контекст аутентификации
const AuthContext = createContext(null);

// Провайдер аутентификации для React
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Загружаем пользователя из сессии при монтировании компонента
    const loadUserFromSession = async () => {
      try {
        // Здесь можно получить сессию из localStorage или cookies
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          setLoading(false);
          return;
        }

        const client = await getMongoClient();
        const db = client.db();
        
        const session = await db.collection('sessions').findOne({ _id: sessionId });
        if (!session) {
          localStorage.removeItem('sessionId');
          setLoading(false);
          return;
        }

        const userData = await db.collection('users').findOne({ _id: session.userId });
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

  const login = async (email, password) => {
    const result = await loginUser(email, password);
    if (result.session) {
      localStorage.setItem('sessionId', result.session._id.toString());
      setUser({
        id: result.session.userId,
        email: result.session.email
      });
      return { success: true };
    }
    return { error: result.error };
  };

  const register = async (email, password, userData) => {
    const result = await registerUser(email, password, userData);
    if (result.user) {
      // После регистрации выполняем вход
      return await login(email, password);
    }
    return { error: result.error };
  };

  const logout = async () => {
    localStorage.removeItem('sessionId');
    setUser(null);
    return { success: true };
  };

  const value = {
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
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Экспортируем MongoClient для других модулей
export { MongoClient }; 