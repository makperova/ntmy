import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { FiHome, FiBarChart2, FiSettings } from 'react-icons/fi';

const Analytics: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [viewsData, setViewsData] = useState<any[]>([]);
  
  useEffect(() => {
    checkUser();
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Загрузка данных аналитики
    fetchAnalyticsData();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push('/signin');
    } else {
      setLoading(false);
    }
  }
  
  async function fetchAnalyticsData() {
    try {
      const { data, error } = await supabase
        .from('profile_views')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setViewsData(data || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    }
  }
  
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/signin');
  }
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  // Мобильная версия
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>Analytics | NTMY</title>
          <meta name="description" content="View your profile analytics" />
        </Head>
        
        {/* Заголовок */}
        <div className="bg-white shadow-sm px-4 py-4">
          <h1 className="text-xl font-medium text-gray-800">Analytics</h1>
        </div>
        
        {/* Основной контент */}
        <div className="px-4 py-5 pb-24">
          <div className="space-y-5">
            
            {/* Блок просмотров профиля */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-3">Profile Views</h2>
              
              {viewsData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No profile views yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewsData.map((view) => (
                    <div key={view.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-800 font-medium">{view.visitor_ip || 'Unknown visitor'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(view.created_at).toLocaleDateString()} at {new Date(view.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Блок отчета об активности */}
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-3">Engagement Report</h2>
              
              <div className="text-center py-8">
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* Нижнее меню навигации */}
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 p-3">
          <div className="flex justify-around items-center">
            <Link href="/admin/dashboard" className="flex flex-col items-center text-gray-400">
              <FiHome className="h-6 w-6" />
              <span className="text-xs mt-1">Home</span>
            </Link>
            
            <Link href="/admin/analytics" className="flex flex-col items-center text-blue-500">
              <FiBarChart2 className="h-6 w-6" />
              <span className="text-xs mt-1">Analytics</span>
            </Link>
            
            <Link href="/admin/settings" className="flex flex-col items-center text-gray-400">
              <FiSettings className="h-6 w-6" />
              <span className="text-xs mt-1">Settings</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Десктопная версия
  return (
    <div className="min-h-screen flex bg-gray-50">
      <Head>
        <title>Analytics | NTMY</title>
        <meta name="description" content="View your profile analytics" />
      </Head>
      
      {/* Боковая панель */}
      <div className="w-16 bg-white shadow-sm min-h-screen fixed left-0 top-0 bottom-0">
        <div className="flex flex-col items-center py-8 h-full">
          <div className="mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              ntmy
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center space-y-6">
            <Link href="/admin/dashboard" className="p-2 text-gray-400 hover:text-blue-500">
              <FiHome className="h-6 w-6" />
            </Link>
            
            <Link href="/admin/analytics" className="p-2 text-blue-500">
              <FiBarChart2 className="h-6 w-6" />
            </Link>
            
            <Link href="/admin/settings" className="p-2 text-gray-400 hover:text-blue-500">
              <FiSettings className="h-6 w-6" />
            </Link>
          </div>
          
          <div className="mt-6 mb-8">
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Выйти"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Основной контент */}
      <div className="ml-16 w-full">
        <div className="max-w-3xl mx-auto py-10 px-6">
          <h1 className="text-2xl font-medium text-gray-800 mb-6">Analytics</h1>
          
          <div className="space-y-6">
            {/* Блок просмотров профиля */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Profile Views</h2>
              
              {viewsData.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">No profile views yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {viewsData.map((view) => (
                    <div key={view.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-gray-800 font-medium">{view.visitor_ip || 'Unknown visitor'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(view.created_at).toLocaleDateString()} at {new Date(view.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Блок отчета об активности */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Engagement Report</h2>
              
              <div className="text-center py-10">
                <p className="text-gray-500">Coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 