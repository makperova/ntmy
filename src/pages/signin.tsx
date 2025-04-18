import { useEffect, useState } from 'react';
import Head from 'next/head';
import MongoLoginForm from '../components/auth/MongoLoginForm';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../lib/mongodb-auth-client';
import { useRouter } from 'next/router';
import ServerErrorPage from '../components/ServerErrorPage';

export default function SignInPage() {
  const router = useRouter();
  const { user, loading, error } = useAuth();
  const [authMode, setAuthMode] = useState<'mongo' | 'supabase'>('mongo');
  const [connectionError, setConnectionError] = useState(false);
  
  // Проверка на ошибки соединения с сервером
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        // Проверяем доступность сервера
        const timeout = 5000; // 5 секунд таймаут
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        const response = await fetch('/api/health', { 
          signal: controller.signal 
        });
        
        clearTimeout(id);
        
        if (!response.ok) {
          setConnectionError(true);
        }
      } catch (err: any) {
        console.error('Ошибка проверки соединения:', err);
        // Если это ошибка AbortController, значит был таймаут
        if (err.name === 'AbortError') {
          setConnectionError(true);
        }
      }
    };
    
    checkServerConnection();
  }, []);
  
  // Если пользователь уже авторизован, перенаправляем на главную
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Переключатель между Supabase и MongoDB авторизацией
  const toggleAuthMode = () => {
    setAuthMode(authMode === 'mongo' ? 'supabase' : 'mongo');
  };
  
  // Функция для повторной проверки соединения при нажатии кнопки "Попробовать снова"
  const handleRetryConnection = () => {
    setConnectionError(false);
    router.reload();
  };

  // Если есть ошибка подключения к серверу, показываем страницу ошибки
  if (connectionError) {
    return <ServerErrorPage onRetry={handleRetryConnection} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Вход | NTMY</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}
          
          {authMode === 'mongo' ? (
            <MongoLoginForm />
          ) : (
            <LoginForm />
          )}
          
          <div className="mt-6 text-center">
            <button 
              onClick={toggleAuthMode}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Переключиться на {authMode === 'mongo' ? 'Supabase' : 'MongoDB'} авторизацию
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 