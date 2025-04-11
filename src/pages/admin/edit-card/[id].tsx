import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FiHome, FiSettings, FiBarChart2 } from 'react-icons/fi';

const EditCardById = () => {
  const router = useRouter();
  const { id } = router.query; // Получаем ID карточки из URL
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    jobTitle: '',
    company: '',
    bio: '',
    username: '',
    email: '',
    phone: '',
    linkedin: '',
    whatsapp: '',
    telegram: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Для обработки изображения
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Проверка авторизации и загрузка данных карточки при загрузке страницы
  useEffect(() => {
    const checkUserAndLoadCard = async () => {
      // Проверяем авторизацию
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }
      setUser(session.user);
      setLoading(false);
      
      // Если есть ID карточки, загружаем данные
      if (id) {
        try {
          setCardLoading(true);
          
          // Запрос данных карточки из Supabase
          const { data: cardData, error: cardError } = await supabase
            .from('cards')
            .select('*')
            .eq('id', id)
            .single();
            
          if (cardError) throw cardError;
          
          // Устанавливаем полученные данные в состояние
          setFormData({
            name: cardData.name || '',
            jobTitle: cardData.job_title || '',
            company: cardData.company || '',
            bio: cardData.bio || '',
            username: cardData.username || '',
            email: cardData.email || '',
            phone: cardData.phone || '',
            linkedin: cardData.linkedin_url || '',
            whatsapp: cardData.whatsapp_url || '',
            telegram: cardData.telegram_url || '',
          });
          
          // Устанавливаем шаблон
          setSelectedTemplate(cardData.template || 'minimal');
          
          // Загружаем изображение, если оно есть
          if (cardData.image_url) {
            setPreviewImage(cardData.image_url);
          }
          
          setCardLoading(false);
        } catch (error) {
          console.error('Error loading card data:', error);
          setError('Не удалось загрузить данные карточки');
          setCardLoading(false);
        }
      } else {
        // Если ID не передан, значит это ошибка
        setError('ID карточки не указан');
        setCardLoading(false);
      }
    };
    
    if (router.isReady) {
      checkUserAndLoadCard();
    }
  }, [router.isReady, id, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || cardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>Редактировать карточку | NTMY</title>
        <meta name="description" content="Редактирование цифровой визитной карточки" />
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
            
            <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-blue-500">
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
        <div className="max-w-5xl mx-auto py-10 px-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              {success}
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-medium text-gray-800">Редактирование карточки</h1>
            <div className="flex space-x-4">
              <button 
                onClick={() => router.push('/admin/edit-card')}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <p className="text-gray-700 mb-4">
              ID карточки: <span className="font-medium">{id}</span>
            </p>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Информация о карточке</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                    <div className="text-gray-900 font-medium">{formData.name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Должность</label>
                    <div className="text-gray-900">{formData.jobTitle || 'Не указана'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Компания</label>
                    <div className="text-gray-900">{formData.company || 'Не указана'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="text-gray-900 flex items-center">
                      <span className="text-gray-500 mr-1">ntmy.com/</span>
                      <span>{formData.username}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <h2 className="text-lg font-medium text-gray-800 mb-4">Контактная информация</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-900">{formData.email || 'Не указан'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                    <div className="text-gray-900">{formData.phone || 'Не указан'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                    <div className="text-gray-900">{formData.linkedin || 'Не указан'}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Шаблон</label>
                    <div className="text-gray-900 capitalize">{selectedTemplate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <Link 
                  href={`/admin/edit-card?id=${id}`}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Редактировать
                </Link>
                
                <a 
                  href={`https://ntmy.com/${formData.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Открыть
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCardById; 