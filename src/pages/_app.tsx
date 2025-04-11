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

  // Проверка авторизации при загрузке приложения
  useEffect(() => {
    // Обрабатываем ошибки Supabase в режиме разработки
    const handleAuthError = (error: any) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth error in development mode (suppressed):', error.message);
        return null;
      }
      throw error;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      // Передаем данные о пользователе в Builder.io
      builder.setUserAttributes({
        userLoggedIn: true,
        userId: user.id,
        userEmail: user.email,
        userName: user.user_metadata?.name || null,
      });
    } else {
      builder.setUserAttributes({
        userLoggedIn: false,
      });
    }
  }, [user]);

  return (
    <ErrorBoundary>
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