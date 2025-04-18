import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
// Убираем импорт Supabase
// import { supabase } from '../lib/supabaseClient';
// Импортируем утилиту для подавления ошибок БД
import { mockDBConnection } from '../lib/db-mock';
// Импорты для Builder.io
import { builder, Builder } from '@builder.io/react';
// Импорт компонента ErrorBoundary
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider, useAuth } from '../lib/mongodb-auth-client';

// Инициализация Builder.io с API ключом
builder.init('81bfbddd');

// Подавляем ошибки подключения к БД в режиме разработки
if (process.env.NODE_ENV === 'development') {
  mockDBConnection();
}

// Определение компонента для ошибок Builder.io
if (typeof window !== 'undefined') {
  const ErrorComp = ({ message }: { message: string }) => (
    <div style={{ 
      padding: '20px', 
      margin: '20px 0', 
      background: '#ffebee', 
      color: '#c62828',
      border: '1px solid #ef9a9a', 
      borderRadius: '4px' 
    }}>
      <h2 style={{ margin: '0 0 10px 0' }}>Ошибка</h2>
      <div>{message || 'Произошла ошибка при загрузке компонента'}</div>
    </div>
  );

  try {
    // @ts-ignore
    Builder.components = Builder.components || {};
    // @ts-ignore
    Builder.components.error = ErrorComp;
  } catch (err) {
    console.warn('Could not register Builder.io error component', err);
  }
}

// Компонент для отображения ошибок
const CustomErrorComponent = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-lg w-full">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Что-то пошло не так</h1>
      <p className="text-gray-700 mb-2">Произошла ошибка при загрузке приложения:</p>
      <pre className="bg-red-50 p-4 rounded border border-red-200 text-sm overflow-auto">
        {error.message}
      </pre>
    </div>
  </div>
);

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user, loading: authLoading } = useAuth() as {
    user: {
      _id?: string;
      id?: string;
      email?: string;
      name?: string;
      [key: string]: any;
    } | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success?: boolean; error?: string }>;
    register: (email: string, password: string, userData?: object) => Promise<{ success?: boolean; error?: string }>;
    logout: () => Promise<{ success: boolean }>;
    isAuthenticated: boolean;
  };

  // Редиректы на основе авторизации
  useEffect(() => {
    if (!authLoading) {
      // Если пользователь не авторизован и находится в защищенной зоне, перенаправляем на главную
      if (!user && router.pathname.startsWith('/admin')) {
        router.push('/');
      }

      // Если пользователь авторизован и находится на странице входа/регистрации, перенаправляем в дашборд
      if (user && (router.pathname === '/signin' || router.pathname === '/signup')) {
        router.push('/admin/dashboard');
      }
    }
  }, [user, authLoading, router]);

  // Регистрация пользовательских данных в Builder.io
  useEffect(() => {
    if (user) {
      try {
        // Передаем данные о пользователе в Builder.io
        builder.setUserAttributes({
          userLoggedIn: true,
          userId: user._id || user.id || '',
          userEmail: user.email || '',
          userName: user.name || null,
        });
      } catch (err) {
        console.error('Error setting Builder.io user attributes:', err);
      }
    } else {
      try {
        builder.setUserAttributes({
          userLoggedIn: false,
        });
      } catch (err) {
        console.error('Error resetting Builder.io user attributes:', err);
      }
    }
  }, [user]);

  // Если возникла ошибка, перенаправляем на страницу ошибки
  useEffect(() => {
    if (error) {
      console.error('Application error:', error);
      router.push({
        pathname: '/500',
        query: { message: error.message || 'Unknown error' }
      });
    }
  }, [error, router]);

  // Инициализация завершена - показываем приложение
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const isAppLoading = isLoading || authLoading;

  return (
    <>
      <Head>
        <title>NTMY - Цифровая визитка нового поколения</title>
        <meta name="description" content="NTMY - создайте современную цифровую визитку и делитесь ею через NFC, QR-код или персональную страницу" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isAppLoading ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <Component {...pageProps} user={user} />
      )}
    </>
  );
}

export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <ErrorBoundary fallback={(error) => <CustomErrorComponent error={error as Error} />}>
        <AppContent {...props} />
      </ErrorBoundary>
    </AuthProvider>
  );
} 