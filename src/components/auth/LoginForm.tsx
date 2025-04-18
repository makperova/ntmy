import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Получаем ключ Supabase для проверки
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

type LoginFormData = {
  email: string;
  password: string;
};

const LoginForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [migrationMode, setMigrationMode] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Проверяем, если это известный email для миграции
      if (data.email === 'makperova@gmail.com') {
        console.log('Перенаправление на dashboard с режимом миграции');
        router.push(`/admin/dashboard?migrate_email=${encodeURIComponent(data.email)}`);
        return;
      }

      // Проверяем, инициализирован ли клиент Supabase должным образом
      if (!supabaseAnonKey || supabaseAnonKey.trim() === '') {
        console.warn('Supabase Anon Key отсутствует, автоматическое переключение на MongoDB аутентификацию');
        setMigrationMode(true);
        setErrorMessage('Supabase недоступен. Пожалуйста, используйте MongoDB аутентификацию.');
        setLoading(false);
        return;
      }

      // Пробуем стандартную авторизацию через Supabase
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          // Если ошибка связана с отсутствием Supabase, переключаем на MongoDB
          if (error.message && error.message.includes('Supabase аутентификация отключена')) {
            setMigrationMode(true);
            setErrorMessage('Supabase недоступен. Пожалуйста, используйте MongoDB аутентификацию.');
            return;
          }
          throw error;
        }

        // После успешного входа перенаправляем на дашборд
        router.push('/admin/dashboard');
      } catch (supabaseError: any) {
        console.error('Ошибка авторизации через Supabase:', supabaseError);
        
        // Если Supabase недоступен или произошла ошибка, показываем режим миграции
        if (supabaseError.message && (
          supabaseError.message.includes('Failed to fetch') || 
          supabaseError.message.includes('Network Error') ||
          supabaseError.message.includes('cannot contact server') ||
          supabaseError.message.includes('not initialized properly') ||
          supabaseError.message.includes('supabaseKey is required') ||
          supabaseError.message.includes('Supabase аутентификация отключена')
        )) {
          setMigrationMode(true);
          setErrorMessage('Supabase недоступен. Пожалуйста, используйте режим миграции.');
        } else {
          setErrorMessage(supabaseError.message || 'Ошибка авторизации');
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setSocialLoading(provider);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=/admin/dashboard`,
        },
      });

      if (error) {
        throw error;
      }
      // Редирект выполнит Supabase
    } catch (error: any) {
      setErrorMessage(error.message || `Ошибка авторизации через ${provider}`);
      setSocialLoading(null);
      
      // Показываем режим миграции если соц.авторизация недоступна
      setMigrationMode(true);
    }
  };

  // Функция для перехода в режим миграции
  const handleMigrationMode = (email: string) => {
    router.push(`/admin/dashboard?migrate_email=${encodeURIComponent(email)}`);
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto bg-white rounded-xl shadow-sm">
      <h1 className="mb-6 text-2xl font-medium text-center text-gray-800">Войти в NTMY</h1>
      
      {errorMessage && (
        <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-lg">
          {errorMessage}
        </div>
      )}
      
      {migrationMode && (
        <div className="p-4 mb-6 text-sm text-yellow-800 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-medium mb-2">Режим миграции</h3>
          <p>Система аутентификации Supabase отключена. Используйте прямой доступ:</p>
          <button
            onClick={() => handleMigrationMode('makperova@gmail.com')}
            className="mt-3 w-full p-2 text-white text-sm font-medium bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
          >
            Войти как makperova@gmail.com
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-3 border rounded-lg bg-white border-gray-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            {...register('email', { 
              required: 'Email обязателен',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'Неверный формат email'
              }
            })}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">
            Пароль
          </label>
          <input
            id="password"
            type="password"
            className="w-full p-3 border rounded-lg bg-white border-gray-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            {...register('password', { 
              required: 'Пароль обязателен',
              minLength: {
                value: 6,
                message: 'Пароль должен содержать минимум 6 символов'
              }
            })}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full p-3 text-white text-sm font-medium bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      
      <div className="flex items-center my-5">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="mx-4 text-xs text-gray-400">или войти через</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialLogin('google')}
          disabled={!!socialLoading}
          className="flex items-center justify-center p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
        >
          {socialLoading === 'google' ? (
            <span>Вход...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#4285F4"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                />
              </svg>
              <span>Google</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => handleSocialLogin('apple')}
          disabled={!!socialLoading}
          className="flex items-center justify-center p-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
        >
          {socialLoading === 'apple' ? (
            <span>Вход...</span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  fill="#000000"
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701z"
                />
              </svg>
              <span>Apple</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Нет аккаунта?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Зарегистрироваться
          </Link>
        </p>
        <p className="mt-2 text-sm text-gray-500">
          <Link href="/forgot-password" className="text-blue-500 hover:underline">
            Забыли пароль?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm; 