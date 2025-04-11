import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
  message?: string;
}

const Error: NextPage<ErrorProps> = ({ statusCode, message }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>{statusCode ? `Ошибка ${statusCode}` : 'Ошибка'} | NTMY</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">
          {statusCode ? statusCode : 'Ошибка'}
        </h1>
        <p className="mt-3 text-xl text-gray-600">
          {message || (statusCode === 404
            ? 'Страница не найдена'
            : 'Произошла ошибка при загрузке страницы')}
        </p>
        <div className="mt-6">
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
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
  return { statusCode, message };
};

export default Error; 