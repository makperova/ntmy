import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import '../styles/globals.css';
// Импортируем утилиту для подавления ошибок БД
import { mockDBConnection } from '../lib/db-mock';
// Импорты для Builder.io
import { builder, Builder } from '@builder.io/react';
// Импорт компонента ErrorBoundary
import ErrorBoundary from '../components/ErrorBoundary';

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

function NtmyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState<any>(null);

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    // Обрабатываем ошибки Supabase в режиме разработки
    const handleAuthError = (error: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth error in development mode (suppressed):', error.message);
        return null;
      }
      setError(error);
      throw error;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        setUser(session?.user || null);
        setIsLoading(false);
        
        // Если пользователь вышел из системы и находится в защищенной зоне, перенаправляем на главную
        if (event === 'SIGNED_OUT' && router.pathname.startsWith('/admin')) {
          router.push('/');
        }

        // Если пользователь вошел в систему и находится на странице входа/регистрации, перенаправляем в дашборд
        if (event === 'SIGNED_IN' && (router.pathname === '/signin' || router.pathname === '/signup')) {
          router.push('/admin/dashboard');
        }
      } catch (err) {
        console.error('Error during auth state change:', err);
        setError(err);
      }
    });

    // Проверка текущего пользователя
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (error) {
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [router]);

  // Регистрация пользовательских данных в Builder.io
  useEffect(() => {
    if (user) {
      try {
        // Передаем данные о пользователе в Builder.io
        builder.setUserAttributes({
          userLoggedIn: true,
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.name || null,
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

  // Создаем компонент для пользовательской страницы ошибки
  const CustomErrorComponent = (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="text-red-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ошибка в приложении
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          Произошла ошибка в React-компоненте. Возможно, отсутствуют необходимые компоненты ошибок.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Обновить страницу
          </button>
          <a href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={CustomErrorComponent}>
      <>
        <Head>
          <title>NTMY - Цифровая визитка нового поколения</title>
          <meta name="description" content="NTMY - создайте современную цифровую визитку и делитесь ею через NFC, QR-код или персональную страницу" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <Component {...pageProps} user={user} />
        )}
      </>
    </ErrorBoundary>
  );
}

export default NtmyApp; 