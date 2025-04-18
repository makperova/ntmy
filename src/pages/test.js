import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function TestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Head>
        <title>Тестовая страница | NTMY</title>
      </Head>
      
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Тестовая страница</h1>
        <p className="mb-6">
          Эта страница работает правильно! Если вы можете видеть эту страницу, значит маршрутизация Next.js работает.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link href="/">
            <a className="w-full py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors inline-block">
              На главную
            </a>
          </Link>
          
          <Link href="/signin">
            <a className="w-full py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors inline-block">
              Страница входа
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
} 