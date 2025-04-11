import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Head>
        <title>Страница не найдена | NTMY</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-3 text-xl text-gray-600">Страница не найдена</p>
        <p className="mt-2 text-md text-gray-500">
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <div className="mt-6">
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Вернуться на главную
          </Link>
        </div>
      </div>
    </div>
  );
} 