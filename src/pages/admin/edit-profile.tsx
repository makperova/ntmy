import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isValidPhoneNumber } from 'react-phone-number-input';
import InputMask from 'react-input-mask';
import AvatarEditor from 'react-avatar-editor';
import Link from 'next/link';
import { FiHome, FiSettings, FiBarChart2 } from 'react-icons/fi';

// Добавляю ErrorBoundary для перехвата ошибок
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Profile editor error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          <h3 className="font-bold">Что-то пошло не так.</h3>
          <p>Пожалуйста, попробуйте перезагрузить страницу или вернитесь на Dashboard.</p>
          <button 
            onClick={() => window.location.href = '/admin/dashboard'}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Вернуться на Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Определение типов для формы
interface ProfileFormData {
  username: string;
  fullName: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  contacts: {
    type: string;
    value: string;
  }[];
  social: {
    platform: string;
    url: string;
  }[];
  image?: File | string;
}

// Доступные типы контактов
const CONTACT_TYPES = [
  { id: 'phone', name: 'Phone' },
  { id: 'email', name: 'Email' },
  { id: 'website', name: 'Website' },
  { id: 'telegram', name: 'Telegram' }
];

// Доступные социальные платформы
const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'twitter', name: 'Twitter' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'github', name: 'GitHub' },
  { id: 'youtube', name: 'YouTube' }
];

const EditProfile: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [temporaryImage, setTemporaryImage] = useState<File | string | null>(null);
  const [skipEditorOpen, setSkipEditorOpen] = useState(false); // Флаг для предотвращения открытия редактора
  const editorRef = useRef<AvatarEditor | null>(null);
  const fullNameRef = useRef<HTMLInputElement>(null); // Реф для поля Full Name
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  const { register, handleSubmit, control, watch, formState: { errors, isDirty, dirtyFields }, setValue, setError } = useForm<ProfileFormData>({
    defaultValues: {
      username: '',
      fullName: '',
      title: '',
      company: '',
      bio: '',
      email: '',
      contacts: [{ type: 'phone', value: '' }],
      social: [{ platform: 'linkedin', url: '' }],
      image: ''
    },
    mode: 'onChange',
    shouldFocusError: false // Отключаем автофокус на элементах с ошибками
  });

  const { fields: contactFields, append: appendContact, remove: removeContact } = useFieldArray({
    control,
    name: 'contacts'
  });

  const { fields: socialFields, append: appendSocial, remove: removeSocial } = useFieldArray({
    control,
    name: 'social'
  });

  // Отслеживаем изменение изображения
  const watchImage = watch('image');
  const watchUsername = watch('username');
  
  // Проверка доступности имени пользователя
  useEffect(() => {
    const checkUsernameAvailability = async () => {
      // Если поле пустое или слишком короткое, не делаем проверку
      if (!watchUsername || watchUsername.length < 4) {
        setIsUsernameAvailable(null);
        return;
      }

      // Получаем текущий профиль из формы
      const currentProfileUsername = watch('username');
      
      // Если текущее имя пользователя совпадает с тем, что уже есть в профиле, считаем его доступным
      if (currentProfileUsername && watchUsername === currentProfileUsername) {
        setIsUsernameAvailable(true);
        return;
      }
      
      setIsCheckingUsername(true);
      
      try {
        // Проверяем, существует ли пользователь с таким именем
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', watchUsername)
          .not('user_id', 'eq', user?.id) // Исключаем текущего пользователя
          .maybeSingle();
        
        if (error) {
          console.error('Ошибка при проверке имени пользователя:', error);
          setIsUsernameAvailable(null);
        } else {
          // Если запрос вернул данные, значит имя занято
          setIsUsernameAvailable(!data);
        }
      } catch (error) {
        console.error('Ошибка при проверке имени пользователя:', error);
        setIsUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    
    const debounce = setTimeout(checkUsernameAvailability, 500);
    return () => clearTimeout(debounce);
  }, [watchUsername, user, watch]);

  // Мемоизируем функции для работы с массивами, чтобы избежать лишних ререндеров
  const memoizedHandlers = React.useMemo(() => ({
    appendContact: (contact: any) => appendContact(contact),
    removeContact: (index: number) => removeContact(index),
    appendSocial: (social: any) => appendSocial(social),
    removeSocial: (index: number) => removeSocial(index)
  }), [appendContact, removeContact, appendSocial, removeSocial]);

  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения обновления состояния после размонтирования
    
    const checkUser = async () => {
      try {
        setLoading(true);
        console.log('Загрузка сессии пользователя...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('Сессия не найдена, перенаправление на страницу входа');
          router.push('/signin');
          return;
        }
        
        if (!isMounted) return;
        
        console.log('Сессия пользователя получена:', session.user.email);
        setUser(session.user);
        
        // Загружаем данные профиля
        console.log('Загрузка профиля пользователя...', session.user.id);
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        if (!isMounted) return;
        
        console.log('Результат запроса профиля:', { profile, error });
        
        if (error) {
          console.error('Ошибка при загрузке профиля:', error);
          
          // Проверяем, является ли ошибка отсутствием записи (код ошибки может различаться)
          if (error.code === 'PGRST116' || error.message?.includes('No rows') || error.details?.includes('Results contain 0 rows')) {
            console.log('Профиль не найден, создаем новый профиль...');
            
            try {
              // Создаем базовую структуру профиля
              const newProfileData = {
                user_id: session.user.id,
                username: session.user.email?.split('@')[0] || 'user',
                full_name: session.user.user_metadata?.full_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
              
              console.log('Создание нового профиля с данными:', newProfileData);
              
              // Создаем новый профиль для пользователя
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert(newProfileData)
                .select()
                .single();
              
              console.log('Результат создания профиля:', { newProfile, createError });
              
              if (createError) {
                console.error('Ошибка при создании профиля:', createError);
                setErrorMessage(`Не удалось создать профиль. Ошибка: ${createError.message || createError.details || 'Неизвестная ошибка'}`);
              } else if (newProfile) {
                console.log('Профиль успешно создан:', newProfile);
                // Заполняем форму данными из нового профиля
                setValue('username', newProfile.username || '');
                setValue('fullName', newProfile.full_name || '');
                
                // Загружаем email из данных сессии пользователя
                if (session.user.email) {
                  console.log('Установка email:', session.user.email);
                  setValue('email', session.user.email);
                }
                
                // Показываем успешное сообщение
                setSuccessMessage('Профиль успешно создан. Пожалуйста, заполните дополнительную информацию.');
              } else {
                console.error('Профиль не создан, но ошибки нет');
                setErrorMessage('Не удалось создать профиль. Пожалуйста, попробуйте позже.');
              }
            } catch (createCatchError) {
              console.error('Исключение при создании профиля:', createCatchError);
              setErrorMessage('Произошла ошибка при создании профиля. Пожалуйста, попробуйте позже.');
            }
          } else {
            setErrorMessage(`Не удалось загрузить данные профиля: ${error.message || error.details || 'Неизвестная ошибка'}`);
          }
        } else if (profile) {
          console.log('Профиль успешно загружен:', profile);
          
          // Парсим контакты и социальные сети из профиля
          let contacts = [];
          try {
            contacts = profile.contacts ? JSON.parse(profile.contacts) : [];
            console.log('Загружены контакты:', contacts);
          } catch (e) {
            console.error('Ошибка при парсинге контактов:', e);
            contacts = [];
          }
          
          let social = [];
          try {
            social = profile.social_links ? JSON.parse(profile.social_links) : [];
            console.log('Загружены социальные сети:', social);
          } catch (e) {
            console.error('Ошибка при парсинге социальных сетей:', e);
            social = [];
          }
          
          // Заполняем форму данными из профиля
          console.log('Заполнение формы данными профиля...');
          setValue('username', profile.username || '');
          setValue('fullName', profile.full_name || '');
          setValue('title', profile.title || '');
          setValue('company', profile.company || '');
          setValue('bio', profile.bio || '');
          
          // Загружаем email из данных сессии пользователя
          if (session.user.email) {
            console.log('Установка email:', session.user.email);
            setValue('email', session.user.email);
          }
          
          // Устанавливаем контакты
          if (contacts.length > 0) {
            console.log('Устанавливаем контакты в форму...');
            // Сначала удаляем дефолтные поля
            for (let i = contactFields.length - 1; i >= 0; i--) {
              memoizedHandlers.removeContact(i);
            }
            // Затем добавляем загруженные контакты
            contacts.forEach((contact: any) => {
              memoizedHandlers.appendContact(contact);
            });
          }
          
          // Устанавливаем социальные сети
          if (social.length > 0) {
            console.log('Устанавливаем социальные сети в форму...');
            // Сначала удаляем дефолтные поля
            for (let i = socialFields.length - 1; i >= 0; i--) {
              memoizedHandlers.removeSocial(i);
            }
            // Затем добавляем загруженные социальные сети
            social.forEach((socialItem: any) => {
              memoizedHandlers.appendSocial(socialItem);
            });
          }
          
          // Устанавливаем превью изображения
          if (profile.avatar_url) {
            console.log('Установка аватара:', profile.avatar_url);
            setPreviewImage(profile.avatar_url);
            setValue('image', profile.avatar_url);
          }
          
          console.log('Данные профиля успешно загружены');
        } else {
          console.log('Профиль не найден, используем пустые поля формы');
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Ошибка при проверке пользователя или загрузке профиля:', error);
        setErrorMessage('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();
    
    // Функция очистки для предотвращения обновления состояния после размонтирования
    return () => {
      isMounted = false;
    };
  }, [router, setValue, memoizedHandlers, contactFields.length, socialFields.length]);

  // Добавляем эффект для скролла страницы в верх при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Добавляем эффект для снятия фокуса при загрузке страницы
  useEffect(() => {
    // Используем setTimeout, чтобы выполнить снятие фокуса после рендеринга
    const timer = setTimeout(() => {
      // Снимаем фокус с активного элемента
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Убираем фокус с документа как таковой
      document.body.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Модифицируем эффект для фокуса на поле Full Name после загрузки
  useEffect(() => {
    // Используем setTimeout, чтобы выполнить установку фокуса после полного рендеринга
    if (!loading) {
      const timer = setTimeout(() => {
        if (fullNameRef.current) {
          fullNameRef.current.focus();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Отслеживаем изменение изображения
  useEffect(() => {
    console.log('watchImage изменился:', typeof watchImage, watchImage instanceof File, 'skipEditorOpen:', skipEditorOpen);
    
    // Открываем редактор только если не установлен флаг пропуска открытия
    if (watchImage && watchImage instanceof File && !skipEditorOpen) {
      setTemporaryImage(watchImage);
      setShowEditor(true);
    } else if (typeof watchImage === 'string' && watchImage) {
      setPreviewImage(watchImage);
    }
    
    // Сбрасываем флаг после каждого срабатывания эффекта
    if (skipEditorOpen) {
      setSkipEditorOpen(false);
    }
  }, [watchImage, skipEditorOpen]);

  // Обработчик загрузки изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setTemporaryImage(file);
      setShowEditor(true);
    }
  };

  // Сохранение отредактированного изображения
  const handleSaveImage = () => {
    if (editorRef.current && temporaryImage) {
      try {
        // Используем оригинальный canvas для лучшего качества
        const canvas = editorRef.current.getImage();
        
        // Создаем новый canvas большего размера
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = 800; // Больший размер для лучшего качества
        finalCanvas.height = 800;
        
        const ctx = finalCanvas.getContext('2d');
        if (ctx) {
          // Отрисовываем изображение на новом canvas с масштабированием
          ctx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
          
          // Преобразуем canvas в Blob с высоким качеством
          finalCanvas.toBlob((blob) => {
            if (blob) {
              // Создаем File из Blob для загрузки на сервер
              const file = new File([blob], 'avatar.png', { type: 'image/png' });
              
              // Устанавливаем превью изображения через URL.createObjectURL
              const objectUrl = URL.createObjectURL(blob);
              setPreviewImage(objectUrl);
              
              // Устанавливаем флаг для пропуска открытия редактора
              setSkipEditorOpen(true);
              
              // Закрываем редактор перед установкой нового значения
              setShowEditor(false);
              setTemporaryImage(null);
              
              // Устанавливаем файл в значение формы
              setValue('image', file, { shouldValidate: true, shouldDirty: true });
              
              console.log('Изображение успешно обновлено');
            } else {
              console.error('Ошибка: не удалось создать blob из canvas');
              // Закрываем редактор даже при ошибке создания blob
              setShowEditor(false);
              setTemporaryImage(null);
            }
          }, 'image/png'); // PNG сохраняет полное качество
        }
      } catch (error) {
        console.error('Произошла ошибка при обработке изображения:', error);
        // Закрываем редактор при любой ошибке
        setShowEditor(false);
        setTemporaryImage(null);
      }
    } else {
      console.error('Редактор не инициализирован или изображение отсутствует');
      // Закрываем редактор, если редактор не инициализирован
      setShowEditor(false);
      setTemporaryImage(null);
    }
  };

  // Отмена редактирования изображения
  const handleCancelEdit = () => {
    setShowEditor(false);
    setTemporaryImage(null);
  };

  // Добавляем валидацию для URL
  const isValidUrl = (url: string) => {
    try {
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return pattern.test(url) || 'Please enter a valid URL';
    } catch (e) {
      return false;
    }
  };

  // Обработчик отправки формы
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSaving(true);
      setErrorMessage(null);
      
      // Проверка наличия ID пользователя
      if (!user || !user.id) {
        setErrorMessage('Пользователь не авторизован. Пожалуйста, войдите снова.');
        setSaving(false);
        return;
      }
      
      let avatarUrl = previewImage;
      
      // Загрузка изображения если оно было изменено
      if (data.image && data.image instanceof File) {
        console.log('Начинаем загрузку изображения в Storage...');
        const fileExt = data.image.name.split('.').pop() || 'png';
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        // Убедимся, что путь файла включает ID пользователя для соответствия RLS политикам
        const filePath = `public/${user.id}/${fileName}`;
        
        try {
          // Проверяем размер файла
          const fileSizeInMB = data.image.size / (1024 * 1024);
          console.log(`Размер файла: ${fileSizeInMB.toFixed(2)} MB`);
          
          if (fileSizeInMB > 5) {
            throw new Error('Размер файла превышает 5MB');
          }
          
          // Попробуем получить информацию о бакете, чтобы проверить существует ли он
          console.log('Проверяем существование бакета avatars...');
          const { error: bucketError } = await supabase.storage
            .getBucket('avatars');
          
          console.log('Результат проверки бакета:', bucketError ? 'Бакет не существует' : 'Бакет существует');
            
          // Если бакет не существует, создаем его
          if (bucketError) {
            console.log('Создаем бакет avatars...');
            const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
              public: true,
              fileSizeLimit: 5242880 // 5MB в байтах
            });
            
            if (createBucketError) {
              console.error('Ошибка при создании бакета:', createBucketError);
              throw createBucketError;
            }
            
            console.log('Бакет avatars успешно создан');
          }
          
          // Теперь загружаем файл в бакет 'avatars'
          console.log(`Загружаем файл ${fileName} в бакет avatars по пути ${filePath}...`);
          const { error: uploadError, data: uploadData } = await supabase.storage
            .from('avatars')
            .upload(filePath, data.image, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (uploadError) {
            console.error('Ошибка при загрузке файла:', uploadError);
            
            // Проверяем на ошибки безопасности
            if (uploadError.message?.includes('security') || 
                uploadError.message?.includes('policy') || 
                uploadError.message?.includes('permission')) {
              throw new Error(`Ошибка доступа при загрузке файла: ${uploadError.message}`);
            }
            
            throw uploadError;
          }
          
          console.log('Файл успешно загружен:', uploadData?.path);
          
          // Получаем публичный URL загруженного изображения
          console.log('Получаем публичный URL...');
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          
          if (!urlData?.publicUrl) {
            console.error('Не удалось получить публичный URL');
            throw new Error('Не удалось получить публичный URL');
          }
          
          console.log('Получен публичный URL:', urlData.publicUrl);
          avatarUrl = urlData.publicUrl;
        } catch (error: any) {
          console.error('Ошибка при загрузке изображения:', error);
          setErrorMessage(`Не удалось загрузить изображение: ${error.message || 'Пожалуйста, попробуйте еще раз.'}`);
          setSaving(false);
          return;
        }
      }
      
      // Обновление профиля пользователя
      try {
        console.log('Отправляемые данные:', {
          username: data.username,
          full_name: data.fullName,
          title: data.title,
          company: data.company,
          bio: data.bio,
          contacts: JSON.stringify(data.contacts),
          social_links: JSON.stringify(data.social),
          avatar_url: avatarUrl,
          updated_at: new Date()
        });
        
        const { error } = await supabase
          .from('profiles')
          .update({
            username: data.username,
            full_name: data.fullName,
            title: data.title,
            company: data.company,
            bio: data.bio,
            contacts: JSON.stringify(data.contacts),
            social_links: JSON.stringify(data.social),
            avatar_url: avatarUrl,
            updated_at: new Date()
          })
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Ошибка Supabase:', error);
          throw error;
        }
        
        console.log('Профиль успешно обновлен');
        setSuccessMessage('Profile updated successfully! Redirecting...');
        
        // Возвращаемся на страницу dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 1500);
      } catch (error: any) {
        console.error('Error updating profile:', error);
        setErrorMessage(error.message || 'Ошибка при обновлении профиля');
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      setErrorMessage('Произошла ошибка при сохранении данных. Пожалуйста, проверьте поля формы.');
    } finally {
      setSaving(false);
    }
  };

  // Выводим отладочную информацию при изменении значений формы
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      console.log(`Форма изменена: ${name}, тип: ${type}, значение:`, value[name as keyof ProfileFormData]);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Добавляем функцию для выхода из системы
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Редактирование профиля | NTMY</title>
        <meta name="description" content="Редактирование профиля NTMY" />
      </Head>

      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-medium text-gray-800">Редактирование профиля</h1>
          <button 
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
          >
            Назад в dashboard
          </button>
        </div>

        <ErrorBoundary>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Обработка сообщений об ошибках и успехе */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                {successMessage}
              </div>
            )}

            {/* Блок с изображением */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Изображение профиля</h2>
              
              <div className="flex flex-col sm:flex-row items-center">
                <div className="mb-4 sm:mb-0 sm:mr-6">
                  {showEditor && temporaryImage ? (
                    <div className="relative">
                      <AvatarEditor
                        ref={editorRef}
                        image={temporaryImage}
                        width={200}
                        height={200}
                        border={50}
                        borderRadius={100}
                        color={[255, 255, 255, 0.6]}
                        scale={scale}
                        rotate={0}
                      />
                    </div>
                  ) : (
                    <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      {previewImage || (user && user.profile && user.profile.avatar_url) ? (
                        <img
                          src={previewImage || (user && user.profile && user.profile.avatar_url)}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  {showEditor && temporaryImage ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="scale" className="block text-sm font-medium text-gray-500">
                          Масштаб
                        </label>
                        <input
                          type="range"
                          id="scale"
                          min="1"
                          max="2"
                          step="0.01"
                          value={scale}
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="w-full mt-1"
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleSaveImage}
                          className="px-4 py-2 bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-600 transition-colors"
                        >
                          Сохранить
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        Загрузите изображение профиля. Рекомендуемый размер: 200x200 пикселей.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <label className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700 cursor-pointer">
                          Загрузить
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        {(previewImage || (user && user.profile && user.profile.avatar_url)) && (
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewImage(null);
                              setValue('image', '');
                            }}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Основная информация профиля */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Основная информация</h2>
              
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-500 mb-1">
                    Имя пользователя
                  </label>
                  <div className="relative">
                    <input
                      {...register('username', {
                        required: 'Имя пользователя обязательно',
                        minLength: {
                          value: 3,
                          message: 'Имя пользователя должно содержать не менее 3 символов'
                        },
                        pattern: {
                          value: /^[a-zA-Z0-9_]+$/,
                          message: 'Только буквы, цифры и символ подчеркивания'
                        }
                      })}
                      id="username"
                      placeholder="username"
                      className={`block w-full px-3 py-3 bg-white border ${
                        errors.username ? 'border-red-300' : 'border-gray-200'
                      } rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    
                    {/* Индикатор проверки доступности имени пользователя */}
                    {watchUsername && watchUsername.length >= 3 && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {isCheckingUsername ? (
                          <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : isUsernameAvailable === true ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        ) : isUsernameAvailable === false ? (
                          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        ) : null}
                      </div>
                    )}
                  </div>
                  
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                  )}
                  
                  {isUsernameAvailable === false && !errors.username && (
                    <p className="mt-1 text-sm text-red-600">Это имя пользователя уже занято</p>
                  )}
                  
                  <p className="mt-1 text-sm text-gray-500">
                    Уникальный идентификатор для вашего профиля
                  </p>
                </div>
                
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-500 mb-1">
                    Полное имя
                  </label>
                  <input
                    {...register('fullName', {
                      required: 'Имя обязательно'
                    })}
                    id="fullName"
                    ref={fullNameRef}
                    placeholder="Иван Иванов"
                    className={`block w-full px-3 py-3 bg-white border ${
                      errors.fullName ? 'border-red-300' : 'border-gray-200'
                    } rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                  )}
                </div>
                
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-500 mb-1">
                    Должность
                  </label>
                  <input
                    {...register('title')}
                    id="title"
                    placeholder="Маркетолог"
                    className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ваша профессиональная должность
                  </p>
                </div>
                
                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-500 mb-1">
                    Компания
                  </label>
                  <input
                    {...register('company')}
                    id="company"
                    placeholder="ООО «Компания»"
                    className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-500 mb-1">
                    О себе
                  </label>
                  <textarea
                    {...register('bio')}
                    id="bio"
                    rows={4}
                    placeholder="Расскажите немного о себе..."
                    className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Краткое описание для вашего профиля
                  </p>
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-500 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    disabled
                    className="block w-full px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl shadow-sm text-gray-400"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Ваш email не отображается на вашей странице
                  </p>
                </div>
              </div>
            </div>

            {/* Контактные данные */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Контактные данные</h2>
              
              <div className="space-y-6">
                {contactFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                    <div className="w-full md:w-1/3">
                      <Controller
                        control={control}
                        name={`contacts.${index}.type`}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {CONTACT_TYPES.map(type => (
                              <option key={type.id} value={type.id}>
                                {type.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <Controller
                        control={control}
                        name={`contacts.${index}.value`}
                        render={({ field }) => {
                          const contactType = watch(`contacts.${index}.type`);
                          
                          if (contactType === 'phone') {
                            return (
                              <PhoneInput
                                {...field}
                                international
                                placeholder="Номер телефона"
                                className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            );
                          }
                          
                          if (contactType === 'email') {
                            return (
                              <input
                                {...field}
                                type="email"
                                placeholder="Email"
                                className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            );
                          }
                          
                          if (contactType === 'website') {
                            return (
                              <input
                                {...field}
                                type="url"
                                placeholder="https://example.com"
                                className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            );
                          }
                          
                          if (contactType === 'telegram') {
                            return (
                              <InputMask
                                {...field}
                                mask="@************************"
                                placeholder="@username"
                                className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                            );
                          }
                          
                          return (
                            <input
                              {...field}
                              placeholder="Значение"
                              className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          );
                        }}
                      />
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => memoizedHandlers.removeContact(index)}
                        disabled={contactFields.length === 1}
                        className={`px-3 py-3 border rounded-xl ${
                          contactFields.length === 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div>
                  <button
                    type="button"
                    onClick={() => memoizedHandlers.appendContact({ type: 'phone', value: '' })}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    + Добавить контакт
                  </button>
                </div>
              </div>
            </div>

            {/* Социальные сети */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Социальные сети</h2>
              
              <div className="space-y-6">
                {socialFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row md:items-start space-y-3 md:space-y-0 md:space-x-3">
                    <div className="w-full md:w-1/3">
                      <Controller
                        control={control}
                        name={`social.${index}.platform`}
                        render={({ field }) => (
                          <select
                            {...field}
                            className="block w-full px-3 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {SOCIAL_PLATFORMS.map(platform => (
                              <option key={platform.id} value={platform.id}>
                                {platform.name}
                              </option>
                            ))}
                          </select>
                        )}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <input
                        {...register(`social.${index}.url`, {
                          validate: value => {
                            if (!value) return true;
                            return isValidUrl(value) || 'Пожалуйста, введите корректный URL';
                          }
                        })}
                        placeholder="https://example.com/profile"
                        className={`block w-full px-3 py-3 bg-white border ${
                          errors.social?.[index]?.url ? 'border-red-300' : 'border-gray-200'
                        } rounded-xl shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                      />
                      {errors.social?.[index]?.url && (
                        <p className="mt-1 text-sm text-red-600">{errors.social[index].url.message}</p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => memoizedHandlers.removeSocial(index)}
                        disabled={socialFields.length === 1}
                        className={`px-3 py-3 border rounded-xl ${
                          socialFields.length === 1
                            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                            : 'border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors'
                        }`}
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
                
                <div>
                  <button
                    type="button"
                    onClick={() => memoizedHandlers.appendSocial({ platform: 'linkedin', url: '' })}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    + Добавить социальную сеть
                  </button>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={saving || (isUsernameAvailable === false && watchUsername !== user?.profile?.username)}
                className={`px-6 py-3 bg-blue-500 text-white rounded-xl shadow-sm hover:bg-blue-600 transition-colors ${
                  saving || (isUsernameAvailable === false && watchUsername !== user?.profile?.username)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          </form>
        </ErrorBoundary>
      </main>

      {/* Боковая панель навигации */}
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
    </div>
  );
};

export default EditProfile;