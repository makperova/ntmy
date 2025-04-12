import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

interface CustomErrorProps {
  statusCode?: number;
  message?: string;
  missingComponents?: string[];
}

const CustomError: NextPage<CustomErrorProps> = ({ statusCode, message, missingComponents = [] }) => {
  useEffect(() => {
    // Логируем ошибку в консоль для диагностики
    console.error(`Ошибка ${statusCode || 'неизвестная'}: ${message || 'Не указано сообщение об ошибке'}`);
    if (missingComponents?.length > 0) {
      console.error('Отсутствующие компоненты:', missingComponents);
    }
  }, [statusCode, message, missingComponents]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>{statusCode ? `Ошибка ${statusCode}` : 'Ошибка'} | NTMY</title>
      </Head>
      <div className="text-center max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
        <div className="text-red-500 text-5xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ошибка при загрузке страницы
        </h1>
        <p className="text-lg text-gray-600 mb-4">
          {message || 'Произошла непредвиденная ошибка при загрузке страницы.'}
        </p>

        {missingComponents && missingComponents.length > 0 && (
          <div className="mb-6 text-left bg-gray-50 p-4 rounded-md">
            <h2 className="text-md font-semibold text-gray-700 mb-2">Отсутствующие компоненты:</h2>
            <ul className="list-disc list-inside text-sm text-gray-600">
              {missingComponents.map((component, index) => (
                <li key={index}>{component}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-6">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Обновить страницу
          </button>
          <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

CustomError.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err ? err.message : '';
  
  // Проверяем, есть ли информация об отсутствующих компонентах
  const missingComponents = err && err.missingComponents 
    ? err.missingComponents 
    : message && message.includes('missing required error components') 
      ? ['ErrorComponents'] 
      : [];
  
  return { statusCode, message, missingComponents };
};

export default CustomError;
