import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import LoginForm from '../components/auth/LoginForm';

const SignIn: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Войти | NTMY</title>
        <meta name="description" content="Войдите в свой аккаунт NTMY" />
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <span className="text-3xl font-bold text-blue-500">NTMY</span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm />
      </div>
    </div>
  );
};

export default SignIn; 