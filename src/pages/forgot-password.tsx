import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setMessage({
        text: 'Инструкции по восстановлению пароля отправлены на вашу электронную почту',
        type: 'success'
      });
    } catch (error: any) {
      setMessage({
        text: error.message || 'Ошибка при отправке запроса восстановления пароля',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Восстановление пароля | NTMY</title>
        <meta name="description" content="Восстановление пароля аккаунта NTMY" />
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold text-blue-500">NTMY</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-medium text-gray-800">
          Восстановление пароля
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-full max-w-md p-6 mx-auto bg-white rounded-xl shadow-sm">
          <p className="mb-6 text-center text-sm text-gray-500">
            Введите адрес электронной почты, связанный с вашим аккаунтом, и мы отправим вам ссылку для сброса пароля.
          </p>
          
          {message && (
            <div className={`p-3 mb-4 text-sm text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'} rounded-lg`}>
              {message.text}
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
            
            <button
              type="submit"
              disabled={loading}
              className="w-full p-3 text-white text-sm font-medium bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Отправка...' : 'Восстановить пароль'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/signin" className="text-blue-500 hover:underline">
                Вернуться на страницу входа
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 