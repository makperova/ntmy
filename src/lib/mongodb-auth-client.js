// Клиентская версия модуля аутентификации (без bcrypt)
import { createContext, useContext, useState, useEffect } from 'react';

// Определяем типы для TypeScript
/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} email
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} user
 * @property {boolean} loading
 * @property {Function} login
 * @property {Function} register
 * @property {Function} logout
 * @property {boolean} isAuthenticated
 */

// Контекст аутентификации
const AuthContext = createContext(null);

// Провайдер аутентификации для React
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Загружаем пользователя из localStorage при монтировании компонента
    const loadUserFromSession = async () => {
      try {
        setLoading(true);
        const sessionId = localStorage.getItem('sessionId');
        const storedUser = localStorage.getItem('user');
        
        if (sessionId && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        setError('Ошибка при загрузке пользователя');
      } finally {
        setLoading(false);
      }
    };

    loadUserFromSession();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null); // Сбрасываем ошибку перед новой попыткой

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Если MongoDB недоступна, предоставляем резервный вариант для тестирования
        if (data.error && data.error.includes('connect to MongoDB')) {
          console.warn('MongoDB недоступна. Используем резервный режим для тестирования.');
          if (email === 'test@example.com' && password === 'password') {
            const testUser = {
              _id: 'test-user-id',
              email: email,
              name: 'Test User',
              createdAt: new Date()
            };
            localStorage.setItem('user', JSON.stringify(testUser));
            localStorage.setItem('sessionId', 'test-session-id');
            setUser(testUser);
            return { success: true };
          }
        }
        
        setError(data.error || 'Ошибка при входе');
        return { error: data.error || 'Ошибка при входе' };
      }

      // Сохраняем в localStorage
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Обновляем состояние
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Ошибка при входе:', error);
      setError('Не удалось выполнить вход. Возможно, сервер недоступен.');
      return { error: 'Не удалось выполнить вход' };
    }
  };

  const register = async (email, password, userData = {}) => {
    try {
      setError(null); // Сбрасываем ошибку перед новой попыткой
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, ...userData })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Ошибка при регистрации');
        return { error: data.error || 'Ошибка при регистрации' };
      }

      // После регистрации выполняем вход
      return await login(email, password);
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      setError('Не удалось зарегистрировать пользователя. Возможно, сервер недоступен.');
      return { error: 'Не удалось зарегистрировать пользователя' };
    }
  };

  const logout = async () => {
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
    setUser(null);
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    error
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