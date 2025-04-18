import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import AvatarEditor from 'react-avatar-editor';
import { FiHome, FiBarChart2, FiSettings } from 'react-icons/fi';
import TemplateSelector from '../../components/TemplateSelector';
import dynamic from 'next/dynamic';
import { supabase } from '../../lib/supabase';

// Import AvatarEditor dynamically to avoid SSR issues
const DynamicAvatarEditor = dynamic(() => import('react-avatar-editor'), {
  ssr: false,
});

// Simple Sidebar component
const Sidebar = () => {
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
            className="p-2 text-gray-400 hover:text-blue-500"
          >
            <FiHome size={24} />
          </Link>
          
          <Link 
            href="/admin/analytics"
            className="p-2 text-gray-400 hover:text-blue-500"
          >
            <FiBarChart2 size={24} />
          </Link>
          
          <Link 
            href="/admin/settings"
            className="p-2 text-gray-400 hover:text-blue-500"
          >
            <FiSettings size={24} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const EditCard = () => {
  const router = useRouter();
  const { id } = router.query; // Получаем ID карточки из URL
  // Состояние для отслеживания активной вкладки
  type TabType = 'profile' | 'template' | 'share';
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoading] = useState(true);
  
  interface FormData {
    name: string;
    jobTitle: string;
    company: string;
    bio: string;
    username: string;
    email: string;
    phone: string;
    linkedin: string;
    whatsapp: string;
    telegram: string;
  }
  
  const [formData, setFormData] = useState<FormData>({
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bioKeywords, setBioKeywords] = useState('');
  const [generatingBio, setGeneratingBio] = useState(false);
  
  // Для обработки изображения
  const [previewImage, setPreviewImage] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [temporaryImage, setTemporaryImage] = useState<File | null>(null);
  const [scale, setScale] = useState(1.2);
  const editorRef = useRef<AvatarEditor>(null);
  const [imageData, setImageData] = useState(null);
  
  const [isMobile, setIsMobile] = useState(false);
  
  // Функция выхода из системы
  const handleLogout = async () => {
    // Заглушка для выхода из системы
    router.push('/signin');
  };
  
  // Проверка авторизации и загрузка данных карточки при загрузке страницы
  useEffect(() => {
    const checkUserAndLoadCard = async () => {
      try {
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
            
            // Загружаем данные карточки из Supabase
            const { data: cardData, error: cardError } = await supabase
              .from('cards')
              .select('*')
              .eq('id', id)
              .single();
            
            if (cardError) {
              throw cardError;
            }
            
            if (cardData) {
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
              
              setSelectedTemplate(cardData.template || 'minimal');
              
              if (cardData.image_url) {
                setPreviewImage(cardData.image_url);
              }
            }
            
            setCardLoading(false);
          } catch (error) {
            console.error('Error loading card data:', error);
            setError('Не удалось загрузить данные карточки');
            setCardLoading(false);
          }
        } else {
          // Если ID не передан, значит мы создаем новую карточку
          setCardLoading(false);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setLoading(false);
      }
    };
    
    if (router.isReady) {
      checkUserAndLoadCard();
    }
  }, [router.isReady, id, router]);
  
  useEffect(() => {
    // Check if user is on mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };
  
  const handlePreview = () => {
    // Логика для предпросмотра карточки
    console.log('Preview card');
  };
  
  // Обработчик загрузки изображения
  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > 5) {
        setError('Размер файла превышает 5MB');
        return;
      }

      setTemporaryImage(file);
      setShowEditor(true);
    }
  };
  
  // Сохранение отредактированного изображения
  const handleSaveImage = () => {
    if (editorRef.current && temporaryImage) {
      try {
        // Получаем canvas с отредактированным изображением
        const canvas = editorRef.current.getImage();
        
        // Создаем новый canvas большего размера для лучшего качества
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800;
        finalCanvas.height = 800;
        
        const ctx = finalCanvas.getContext('2d');
        if (ctx) {
          // Отрисовываем изображение на новом canvas с масштабированием
          ctx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
          
          // Преобразуем canvas в Blob
          finalCanvas.toBlob((blob) => {
            if (blob) {
              // Создаем File из Blob для загрузки на сервер
              const file = new File([blob], 'card-image.png', { type: 'image/png' });
              
              // Создаем превью URL
              const objectUrl = URL.createObjectURL(blob);
              setPreviewImage(objectUrl);
              
              // Сохраняем файл для дальнейшей загрузки
              setImageData(file);
              
              // Закрываем редактор
              setShowEditor(false);
              setTemporaryImage(null);
            }
          }, 'image/png', 0.9); // PNG с высоким качеством
        }
      } catch (error) {
        console.error('Ошибка при обработке изображения:', error);
        setError('Не удалось обработать изображение');
        setShowEditor(false);
        setTemporaryImage(null);
      }
    }
  };
  
  // Отмена редактирования изображения
  const handleCancelEdit = () => {
    setShowEditor(false);
    setTemporaryImage(null);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Проверяем обязательные поля
      if (!formData.name.trim()) {
        setError('Имя обязательно для заполнения');
        setSaving(false);
        return;
      }
      
      // Проверяем username
      if (!formData.username || formData.username.trim() === '') {
        setError('Link (username) обязателен для заполнения');
        setSaving(false);
        return;
      }

      // Если указан username, проверяем, что он содержит только допустимые символы
      if (!/^[a-z0-9_-]+$/.test(formData.username)) {
        setError('Username может содержать только латинские буквы в нижнем регистре, цифры, дефисы и подчеркивания');
        setSaving(false);
        return;
      }

      // Проверяем, существует ли карточка с таким username в MongoDB (только для новых карточек)
      if (!id) {
        console.log('Проверяем наличие карточки с username:', formData.username);
        try {
          const checkResponse = await fetch(`/api/cards/username/${formData.username}`);
          
          if (checkResponse.ok) {
            const existingCard = await checkResponse.json();
            if (existingCard && existingCard.user_id !== user.id) {
              setError(`Username "${formData.username}" уже используется. Пожалуйста, выберите другой.`);
              setSaving(false);
              return;
            }
          }
        } catch (checkError) {
          console.warn('Ошибка при проверке существующего username:', checkError);
          // Продолжаем выполнение, так как это некритичная ошибка
        }
      }

      // Подготавливаем данные для MongoDB
      const cardData: {
        user_id: any;
        name: string;
        username: string;
        displayName: string;
        job_title: string;
        company: string;
        bio: string;
        email: string;
        phone: string;
        linkedin_url: string;
        whatsapp_url: string;
        telegram_url: string;
        image_url: any;
        template: string;
        isPublic: boolean;
        updatedAt: Date;
        createdAt?: Date;
      } = {
        user_id: user.id,
        name: formData.name,
        username: formData.username.toLowerCase().trim(),
        displayName: formData.name,
        job_title: formData.jobTitle || '',
        company: formData.company || '',
        bio: formData.bio || '',
        email: formData.email || '',
        phone: formData.phone || '',
        linkedin_url: formData.linkedin || '',
        whatsapp_url: formData.whatsapp || '',
        telegram_url: formData.telegram || '',
        image_url: previewImage,
        template: selectedTemplate,
        isPublic: true,
        updatedAt: new Date()
      };
      
      // Если создаем новую карточку, добавляем дату создания
      if (!id) {
        cardData.createdAt = new Date();
      }
      
      console.log('Отправляем запрос на сохранение карточки в MongoDB');
      
      // Определяем URL API для MongoDB
      const mongoApiUrl = `/api/cards/${id ? `username/${formData.username}` : ''}`;
      const method = id ? 'PUT' : 'POST';
      
      // Устанавливаем заголовок с user-id для API
      const headers = {
        'Content-Type': 'application/json',
        'user-id': user.id
      };
      
      // Отправляем запрос к MongoDB API
      const response = await fetch(mongoApiUrl, {
        method: method,
        headers: headers,
        body: JSON.stringify(cardData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MongoDB API запрос не удался: ${response.status} ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Карточка успешно сохранена в MongoDB:', result);

      // Если это новая карточка и есть данные в ответе, получаем username
      if (!id && result) {
        const newCardUsername = result.username;
        console.log('Новая карточка создана с username:', newCardUsername);
        
        // Всегда перенаправляем на Dashboard после короткой задержки
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else if (id) {
        // Если обновляли существующую карточку, также редирект на дашборд
        const currentUsername = formData.username; // Получаем текущий username из формы
        console.log(`Обновлена карточка с ID ${id}, username: ${currentUsername}`);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } else {
         // На всякий случай, если что-то пошло не так
         console.warn('Не удалось определить, создана или обновлена карточка, редирект на дашборд');
         setTimeout(() => {
           router.push('/admin/dashboard');
         }, 1500);
      }
      
      setSuccess('Карточка успешно сохранена!'); // Обновляем сообщение
      setSaving(false);
      
    } catch (error: any) {
      console.error('Error saving card:', error);
      setError(`Ошибка при сохранении карточки: ${error.message || 'Неизвестная ошибка'}`);
      setSaving(false);
    }
  };
  
  // Функция для удаления карточки
  const handleDelete = async () => {
    try {
      if (!id) {
        setError('ID карточки не указан');
        return;
      }
      
      setSaving(true);
      setError('');
      setSuccess('');
      
      // Удаляем карточку из Supabase
      const { error: deleteError } = await supabase
        .from('cards')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        throw deleteError;
      }
      
      setSuccess('Карточка успешно удалена');
      setSaving(false);
      
      // Перенаправляем на Dashboard после короткой задержки
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
      
    } catch (error: any) {
      console.error('Ошибка при удалении карточки:', error);
      setError(`Ошибка при удалении карточки: ${error.message}`);
      setSaving(false);
    }
  };

  // Отмена удаления
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };
  
  // Функция для генерации описания с использованием AI
  const generateBioDescription = async () => {
    if (!bioKeywords || bioKeywords.trim() === '') {
      setError('Пожалуйста, введите ключевые слова для генерации описания');
      return;
    }
    
    try {
      setGeneratingBio(true);
      
      // Заглушка для генерации описания
      setTimeout(() => {
        const keywords = bioKeywords.split(',').map(kw => kw.trim());
        
        // Простая логика генерации описания для демонстрации
        let generatedBio = `Опытный профессионал в области ${keywords[0]}`;
        
        if (keywords.length > 1) {
          generatedBio += `, специализирующийся на ${keywords.slice(1, -1).join(', ')}`;
          if (keywords.length > 2) {
            generatedBio += ` и ${keywords[keywords.length - 1]}`;
          }
        }
        
        generatedBio += `. Имею большой опыт работы в ${keywords[Math.floor(Math.random() * keywords.length)]}. Стремлюсь к достижению высоких результатов и постоянному профессиональному росту.`;
        
        // Обновляем поле bio с сгенерированным описанием
        setFormData({ ...formData, bio: generatedBio });
        setGeneratingBio(false);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при генерации описания:', error);
      setError('Не удалось сгенерировать описание. Попробуйте еще раз.');
      setGeneratingBio(false);
    }
  };
  
  // Функция для удаления изображения профиля
  const handleDeleteImage = () => {
    setPreviewImage(null);
    setImageData(null);
  };
  
  // Загрузка данных карточки при наличии ID
  useEffect(() => {
    const fetchCardData = async () => {
      if (!id) return;
      
      try {
        setError('');
        console.log('Loading card with ID:', id);
        console.log('Type of ID:', typeof id);
        
        // Получаем строковое представление ID для работы
        const idStr = Array.isArray(id) ? id[0] : String(id);
        console.log('ID length:', idStr.length);
        console.log('Is valid UUID format:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idStr));
        
        // Проверка на неправильный формат ID
        const normalizedId = idStr.replace(/[^a-f0-9-]/gi, '');
        if (normalizedId !== idStr) {
          console.warn('ID was normalized from', idStr, 'to', normalizedId);
        }
        
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', normalizedId)
          .single();
        
        if (error) {
          console.error('Error loading card data:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
          
          // Попробуем получить все карточки без использования single()
          const { data: allCards } = await supabase
            .from('cards')
            .select('id')
            .limit(10);
          
          console.log('Available card IDs (sample):', allCards);
          
          setError('Failed to load card data');
          return;
        }
        
        if (data) {
          console.log('Loaded card data:', data);
          console.log('Card ID from database:', data.id);
          console.log('ID type from database:', typeof data.id);
          
          const newFormData: FormData = {
            name: data.name || '',
            username: data.username || '',
            jobTitle: data.job_title || '',
            company: data.company || '',
            bio: data.bio || '',
            email: data.email || '',
            phone: data.phone || '',
            linkedin: data.linkedin_url || '',
            telegram: data.telegram_url || '',
            whatsapp: data.whatsapp_url || '',
          };
          
          setFormData(newFormData);
          setSelectedTemplate(data.template || 'minimal');
          
          // If there's an image URL, set it
          if (data.image_url) {
            setPreviewImage(data.image_url);
          }
        }
      } catch (err) {
        console.error('Error loading card:', err);
        setError('An error occurred while loading card data');
      }
    };

    if (id) {
      fetchCardData();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Head>
        <title>{id ? 'Edit Card' : 'Create Card'} | NTMY</title>
        <meta name="description" content="Create or edit your digital business card" />
      </Head>

      {!isMobile && <Sidebar />}

      {/* Основной контент */}
      <div className={`${isMobile ? 'w-full pb-16' : 'ml-16 w-full'}`}>
        <div className={`${isMobile ? 'mx-auto py-6 px-4' : 'max-w-3xl mx-auto py-10 px-6'}`}>
          <div className="mb-6">
            <h1 className="text-2xl font-medium text-gray-800">{id ? 'Edit Card' : 'Create New Card'}</h1>
            <p className="text-gray-500 mt-1">Customize your digital business card, add photo and contact information.</p>
          </div>
          
          {loading || cardLoading ? (
            <div className="flex justify-center items-center bg-white rounded-xl shadow-sm border border-gray-200 p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
          <div className="bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-200">
              <div className="sticky top-0 bg-white z-10">
                <div className="border-b border-gray-200">
                  <div className={`${isMobile ? 'flex-col' : 'flex items-center justify-between'}`}>
                    <div className="flex overflow-x-auto hide-scrollbar">
                  <button
                        className={`py-3 px-4 text-sm font-medium ${activeTab === 'profile' ? 'text-blue-500 bg-blue-50 rounded-t-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('profile')}
                  >
                    Profile
                  </button>
                  <button
                        className={`py-3 px-4 text-sm font-medium ${activeTab === 'template' ? 'text-blue-500 bg-blue-50 rounded-t-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('template')}
                  >
                    Template
                  </button>
                  <button
                        className={`py-3 px-4 text-sm font-medium ${activeTab === 'share' ? 'text-blue-500 bg-blue-50 rounded-t-lg' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => handleTabChange('share')}
                  >
                    Share
                  </button>
                </div>
                    <div className={`flex items-center space-x-3 ${isMobile ? 'py-3 flex-wrap' : 'py-2'}`}>
                  {id && (
                    <button 
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm mb-2 sm:mb-0"
                      disabled={saving}
                    >
                      Delete
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm mb-2 sm:mb-0"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm mb-2 sm:mb-0"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
              </div>
              <div className="mt-6">
              {activeTab === 'profile' && (
                <div className="space-y-6">
                    {/* Profile Form */}
                    <div>
                      <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                      
                      {/* User Photo */}
                      <div className="mb-6">
                        <label className="mb-2 block text-sm font-medium text-gray-700">Profile photo</label>
                    <div className="flex items-center">
                          <div className="relative mr-6">
                            <div className="w-24 h-24 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                        {previewImage ? (
                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-gray-400 text-4xl">
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <label className="cursor-pointer inline-flex px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mb-2">
                              Upload photo
                        <input
                          type="file"
                          className="hidden"
                                accept="image/*" 
                                onChange={handleImageChange}
                        />
                        </label>
                            {previewImage && (
                              <button
                                type="button"
                                onClick={handleDeleteImage}
                                className="text-red-600 text-sm hover:underline mb-2"
                              >
                                Delete
                              </button>
                            )}
                            <p className="mt-1 text-xs text-gray-500">JPG, PNG or GIF, up to 5MB</p>
                      </div>
                    </div>
                  </div>
                  
                      {/* Основные поля формы */}
                      <div className="space-y-4 mb-6">
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name *
                      </label>
                      <input
                        type="text"
                            name="name"
                        value={formData.name}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter your name"
                        required
                      />
                    </div>

                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Link (username) *
                      </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500">ntmy.com/</span>
                            </div>
                      <input
                        type="text"
                              name="username"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                              className="w-full pl-[85px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="your-username"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Only lowercase latin letters, numbers, hyphens and underscores</p>
                    </div>

                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                      </label>
                      <input
                        type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="E.g., Frontend Developer"
                      />
                    </div>

                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                      </label>
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="E.g., NTMY"
                          />
                    </div>
                    
                    <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            About
                      </label>
                          <div className="relative">
                            <textarea
                              name="bio"
                              value={formData.bio}
                              onChange={handleInputChange}
                              placeholder="Describe your experience and specialization..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              rows={4}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const keywords = window.prompt('Enter keywords separated by commas (e.g., marketing, SMM, design)');
                                if (keywords && keywords.trim()) {
                                  setBioKeywords(keywords);
                                  generateBioDescription();
                                }
                              }}
                              className="absolute right-2 bottom-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors flex items-center"
                              title="Generate description using AI"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              {generatingBio ? 'Generating...' : 'AI Assistant'}
                            </button>
                      </div>
                          <p className="text-xs text-gray-500 mt-1">Brief description to be displayed on your card</p>
                    </div>
                  </div>
                  
                  {/* Контактная информация */}
                      <div className="mt-8 mb-6">
                        <h2 className="text-xl font-bold mb-4">Contact Information</h2>
                    
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                              name="email"
                          value={formData.email}
                              onChange={handleInputChange}
                              placeholder="your@email.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                              name="phone"
                          value={formData.phone}
                              onChange={handleInputChange}
                              placeholder="+7 (123) 456-7890"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Социальные сети */}
                      <div className="mt-8">
                        <h2 className="text-xl font-bold mb-4">Social Networks</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-800 font-bold">in</span>
                        </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                                type="text"
                                name="linkedin"
                          value={formData.linkedin}
                                onChange={handleInputChange}
                                placeholder="https://linkedin.com/in/username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                            </div>
                      </div>
                      
                      <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                              <span className="text-green-800 font-bold">W</span>
                        </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                                type="text"
                                name="whatsapp"
                          value={formData.whatsapp}
                                onChange={handleInputChange}
                                placeholder="https://wa.me/79123456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                            </div>
                      </div>
                      
                      <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-800 font-bold">T</span>
                        </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                        <input
                                type="text"
                                name="telegram"
                          value={formData.telegram}
                                onChange={handleInputChange}
                                placeholder="https://t.me/username"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'template' && (
                  <TemplateSelector 
                    selectedTemplate={selectedTemplate}
                    onTemplateSelect={handleTemplateSelect}
                    formData={formData}
                    previewImage={previewImage}
                  />
                )}
                
                {activeTab === 'share' && (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-6">Share Your Card</h2>
                    
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <span className="text-blue-800 font-bold">URL</span>
                        </div>
                          <div>
                            <h3 className="font-medium">Ссылка на карточку</h3>
                            <p className="text-sm text-gray-500">Поделитесь ссылкой на вашу карточку</p>
                      </div>
                    </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(`https://ntmy.com/${formData.username}`)
                              .then(() => alert('Link copied to clipboard!'))
                              .catch(err => console.error('Error copying link:', err));
                          }}
                          className="px-4 py-2 bg-gray-100 rounded-md text-gray-700 hover:bg-gray-200"
                        >
                          Copy
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md text-gray-700 font-mono text-sm break-all">
                        https://ntmy.com/{formData.username}
                    </div>
                  </div>
                  
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-800 font-bold">QR</span>
                        </div>
                        <div>
                          <h3 className="font-medium">QR-код</h3>
                          <p className="text-sm text-gray-500">Скачайте QR-код для вашей карточки</p>
                      </div>
                      </div>
                      
                      <div className="flex justify-center mb-4">
                        <div className="w-48 h-48 bg-gray-100 border border-gray-200 rounded-md flex items-center justify-center">
                          <svg viewBox="0 0 100 100" width="100" height="100" className="text-gray-400">
                            <rect x="20" y="20" width="60" height="60" fill="currentColor" />
                          </svg>
                    </div>
                  </div>
                  
                      <div className="flex justify-center">
                        <button className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm mr-3">
                          Download PNG
                      </button>
                        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md shadow-sm">
                          Download SVG
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
      
          {/* Модальное окно для редактирования изображения */}
      {showEditor && temporaryImage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-lg font-medium mb-4">Edit Image</h3>
            
                <div className="flex justify-center mb-6">
              <AvatarEditor
                ref={editorRef}
                image={temporaryImage}
                    width={280}
                    height={280}
                border={50}
                    borderRadius={140}
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={0}
              />
            </div>
            
            <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                Scale
              </label>
              <input
                type="range"
                min="1"
                    max="3"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
                <div className="flex justify-end space-x-2">
              <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                    onClick={handleSaveImage}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600"
                  >
                    Save
              </button>
            </div>
          </div>
        </div>
      )}
      
          {/* Подтверждение удаления - модальное окно */}
      {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Confirmation</h3>
            <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this card? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                    onClick={cancelDelete}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-50">
          <div className="flex justify-around items-center">
            <Link 
              href="/admin/dashboard" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs">Home</span>
            </Link>
            <Link 
              href="/admin/analytics" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs">Analytics</span>
            </Link>
            <Link 
              href="/admin/settings" 
              className="flex flex-col items-center text-gray-600 hover:text-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs">Settings</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCard;