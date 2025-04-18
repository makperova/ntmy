import React from 'react';
import Link from 'next/link';
import { FiHome, FiSettings, FiBarChart2, FiLogOut } from 'react-icons/fi';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

const Sidebar: React.FC = () => {
  const router = useRouter();
  
  // Функция выхода из системы
  const handleLogout = async () => {
    try {
      // Пробуем выйти через Supabase
      const { error } = await supabase.auth.signOut().catch(e => {
        console.error('Ошибка при выходе из Supabase:', e);
        return { error: e };
      });
      
      if (error) {
        console.error('Ошибка при выходе из системы:', error);
      }
      
      // В любом случае перенаправляем на страницу входа
      router.push('/signin');
    } catch (error) {
      console.error('Непредвиденная ошибка при выходе:', error);
      router.push('/signin');
    }
  };
  
  return (
    <div className="w-16 bg-white shadow-sm min-h-screen fixed left-0 top-0 bottom-0">
      <div className="flex flex-col items-center py-8 h-full">
        <div className="mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            ntmy
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center space-y-6">
          <Link
            href="/admin/dashboard"
            className={`p-2 ${router.pathname === '/admin/dashboard' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <FiHome className="h-6 w-6" />
          </Link>
          
          <Link
            href="/admin/analytics"
            className={`p-2 ${router.pathname === '/admin/analytics' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <FiBarChart2 className="h-6 w-6" />
          </Link>
          
          <Link
            href="/admin/settings"
            className={`p-2 ${router.pathname === '/admin/settings' ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
          >
            <FiSettings className="h-6 w-6" />
          </Link>
        </div>

        <div className="mt-6 mb-8">
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            title="Выйти"
          >
            <FiLogOut className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 