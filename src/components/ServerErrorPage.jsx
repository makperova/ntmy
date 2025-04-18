import React from 'react';
import { useRouter } from 'next/router';

const ServerErrorPage = ({ message, onRetry }) => {
  const router = useRouter();

  // Функция для перезагрузки страницы
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-red-100 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Ошибка подключения</h2>
        
        <p className="text-gray-600 mb-6">
          {message || 'Не удалось подключиться к серверу. Пожалуйста, проверьте ваше интернет-соединение и попробуйте снова.'}
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
          >
            Попробовать снова
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    </div>
  );
};

ServerErrorPage.defaultProps = {
  message: '',
  onRetry: null
};

export default ServerErrorPage; 