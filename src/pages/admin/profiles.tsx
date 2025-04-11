import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import BuilderContent from '../../components/BuilderContent';

const ProfilesPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/signin');
        return;
      }
      
      setUser(session.user);
      await fetchProfiles(session.user.id);
      setLoading(false);
    };
    
    checkUser();
  }, [router]);

  const fetchProfiles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('Profile')
        .select('*')
        .eq('userId', userId);
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Head>
        <title>Управление профилями | NTMY</title>
        <meta name="description" content="Управление профилями визиток NTMY" />
      </Head>

      <main className="py-10">
        {/* Интеграция с Builder.io */}
        <BuilderContent modelName="profiles" />
        
        {/* Запасной UI, если Builder.io контент не загрузился */}
        <div className="builder-fallback max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Управление профилями</h1>
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors shadow-sm text-gray-700"
            >
              Назад в dashboard
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center shadow-md border border-gray-200">
              <h2 className="text-xl mb-4 text-gray-900">У вас пока нет профилей</h2>
              <button 
                onClick={() => router.push('/admin/create-profile')}
                className="px-6 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-white shadow-sm"
              >
                Создать профиль
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold mb-2 text-gray-900">{profile.name}</h2>
                    <p className="text-gray-600 mb-4">{profile.role || "Без должности"} {profile.company ? `в ${profile.company}` : ""}</p>
                    <div className="flex justify-between">
                      <button 
                        onClick={() => router.push(`/admin/edit-profile/${profile.id}`)}
                        className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors text-white shadow-sm"
                      >
                        Редактировать
                      </button>
                      <button 
                        onClick={() => router.push(`/${user.user_metadata?.username || user.id}`)}
                        className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 transition-colors text-white shadow-sm"
                      >
                        Просмотр
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProfilesPage; 