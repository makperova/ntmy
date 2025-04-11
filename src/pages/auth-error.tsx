import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

const AuthError: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Ошибка авторизации | NTMY</title>
        <meta name="description" content="Ошибка авторизации в NTMY" />
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold text-blue-500">NTMY</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-medium text-gray-800">
          Ошибка авторизации
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="w-full max-w-md p-6 mx-auto bg-white rounded-xl shadow-sm">
          <div className="p-3 mb-4 text-sm text-white bg-red-500 rounded-lg">
            Произошла ошибка при авторизации. Пожалуйста, попробуйте снова.
          </div>
          
          <p className="mb-6 text-center text-sm text-gray-500">
            Возможные причины ошибки:
            <ul className="list-disc list-inside mt-2 text-left">
              <li>Истекло время сессии</li>
              <li>Проблемы с настройками авторизации</li>
              <li>Технические неполадки сервера</li>
            </ul>
          </p>
          
          <div className="flex flex-col space-y-3">
            <Link href="/signin" className="w-full p-3 text-center text-sm text-white font-medium bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
              Вернуться на страницу входа
            </Link>
            
            <Link href="/" className="w-full p-3 text-center text-sm text-gray-700 font-medium bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors">
              На главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthError; 