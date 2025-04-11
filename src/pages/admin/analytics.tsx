import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import { FiHome, FiSettings, FiBarChart2 } from 'react-icons/fi';

const Analytics: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profileViews, setProfileViews] = useState({
    today: 0,
    week: 0,
    total: 0
  });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
        setUser(session.user);
        
        // Здесь можно добавить загрузку данных аналитики для профиля
        // Но пока оставим заглушку
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        setLoading(false);
      }
    };
    
    checkUser();
    
    // Определение мобильного устройства
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Мобильная версия
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Analytics | NTMY</title>
          <meta name="description" content="Track your profile analytics and statistics" />
        </Head>

        <header className="bg-white shadow-sm py-4 px-4 fixed top-0 left-0 right-0 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Analytics</h1>
        </header>

        <main className="pt-16 pb-20 px-4">
          <div className="space-y-6">
            {/* Profile Views Block */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium mb-4 text-gray-800">Profile Views</h2>
              <p className="text-gray-500 mb-6">Monitor engagement with your digital business cards.</p>

              <div className="bg-gray-50 py-16 flex justify-center items-center rounded-xl mb-6">
                <div className="text-center">
                  <div className="text-6xl font-light text-gray-400">0</div>
                  <p className="text-gray-400 mt-2 text-sm px-4">No view data yet. Analytics will appear here as your profiles get viewed.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Today</h3>
                  <p className="text-2xl font-medium">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Week</h3>
                  <p className="text-2xl font-medium">0</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-xs font-medium text-gray-500 mb-1">Total</h3>
                  <p className="text-2xl font-medium">0</p>
                </div>
              </div>
            </div>

            {/* Engagement Report Block */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium mb-4 text-gray-800">Engagement Report</h2>
              <p className="text-gray-500 mb-6">Track how users interact with your profile.</p>

              <div className="bg-gray-50 py-12 flex justify-center items-center rounded-xl">
                <p className="text-gray-400 text-sm px-4">Detailed engagement reports will be available soon.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Bottom Navigation Menu */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white shadow-lg z-10">
          <div className="flex justify-around items-center h-16">
            <Link href="/admin/dashboard">
              <a className="flex flex-col items-center justify-center w-full py-2">
                <FiHome className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1 text-gray-500">Home</span>
              </a>
            </Link>
            <Link href="/admin/analytics">
              <a className="flex flex-col items-center justify-center w-full py-2">
                <FiBarChart2 className="h-6 w-6 text-blue-600" />
                <span className="text-xs mt-1 text-blue-600 font-medium">Analytics</span>
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className="flex flex-col items-center justify-center w-full py-2">
                <FiSettings className="h-6 w-6 text-gray-500" />
                <span className="text-xs mt-1 text-gray-500">Settings</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>Analytics | NTMY</title>
        <meta name="description" content="Analytics and statistics for your NTMY profile" />
      </Head>

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:block">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800">NTMY Admin</h2>
        </div>
        <nav className="mt-6">
          <Link href="/admin/dashboard">
            <a className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
              <FiHome className="h-5 w-5 mr-3" />
              Dashboard
            </a>
          </Link>
          <Link href="/admin/analytics">
            <a className="flex items-center px-6 py-3 bg-blue-50 text-blue-600 border-r-4 border-blue-600">
              <FiBarChart2 className="h-5 w-5 mr-3" />
              Analytics
            </a>
          </Link>
          <Link href="/admin/settings">
            <a className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
              <FiSettings className="h-5 w-5 mr-3" />
              Settings
            </a>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 hover:text-blue-600 w-full text-left"
          >
            <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 ml-64">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Analytics</h1>
          
          <div className="space-y-8">
            {/* Profile Views Block */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium mb-4 text-gray-800">Profile Views</h2>
              <p className="text-gray-500 mb-6">Monitor engagement with your digital business cards.</p>

              <div className="bg-gray-50 py-24 flex justify-center items-center rounded-xl mb-8">
                <div className="text-center">
                  <div className="text-7xl font-light text-gray-400">0</div>
                  <p className="text-gray-400 mt-3 text-base px-4">No view data yet. Analytics will appear here as your profiles get viewed.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Today</h3>
                  <p className="text-3xl font-medium">0</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Week</h3>
                  <p className="text-3xl font-medium">0</p>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 text-center">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
                  <p className="text-3xl font-medium">0</p>
                </div>
              </div>
            </div>

            {/* Engagement Report Block */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium mb-4 text-gray-800">Engagement Report</h2>
              <p className="text-gray-500 mb-6">Track how users interact with your profile.</p>

              <div className="bg-gray-50 py-16 flex justify-center items-center rounded-xl">
                <p className="text-gray-400 text-base px-4">Detailed engagement reports will be available soon.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics; 