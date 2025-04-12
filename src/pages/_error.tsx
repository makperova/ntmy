import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

interface ErrorProps {
  statusCode?: number;
  message?: string;
  hasError?: boolean;
}

const Error: NextPage<ErrorProps> = ({ statusCode, message, hasError }) => {
  // Логируем ошибку для диагностики
  useEffect(() => {
    if (hasError) {
      console.error(`Ошибка ${statusCode}: ${message || 'Неизвестная ошибка'}`);
    }
  }, [statusCode, message, hasError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>{statusCode ? `Ошибка ${statusCode}` : 'Ошибка'} | NTMY</title>
        <meta name="description" content="Произошла ошибка при загрузке страницы" />
      </Head>
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900">
          {statusCode ? statusCode : 'Ошибка'}
        </h1>
        <p className="mt-3 text-xl text-gray-600">
          {message || (statusCode === 404
            ? 'Страница не найдена'
            : 'Произошла ошибка при загрузке страницы')}
        </p>
        
        {/* Дополнительные инструкции в зависимости от кода ошибки */}
        {statusCode === 404 && (
          <p className="mt-2 text-sm text-gray-500">
            Убедитесь, что URL введен правильно или перейдите на главную страницу.
          </p>
        )}
        
        {statusCode === 500 && (
          <p className="mt-2 text-sm text-gray-500">
            Наши серверы испытывают технические трудности. Пожалуйста, попробуйте снова через несколько минут.
          </p>
        )}
        
        <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
          >
            Обновить страницу
          </button>
          <Link href="/" className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  const message = err ? err.message : '';
  return { statusCode, message, hasError: !!err };
};

export default Error; 