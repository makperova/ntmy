import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import InputMask from 'react-input-mask';
import AvatarEditor from 'react-avatar-editor';
import Link from 'next/link';
import ErrorBoundary from '../../components/ErrorBoundary';

// Определение типов для формы
interface PageFormData {
  username: string;
  fullName: string;
  title: string;
  company: string;
  bio: string;
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

const CreatePage: React.FC = () => {
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

  const { register, handleSubmit, control, watch, formState: { errors, isDirty, dirtyFields }, setValue, setError } = useForm<PageFormData>({
    defaultValues: {
      username: '',
      fullName: '',
      title: '',
      company: '',
      bio: '',
      contacts: [{ type: 'phone', value: '' }],
      social: [{ platform: 'linkedin', url: '' }],
      image: ''
    },
    mode: 'onChange',
    shouldFocusError: false
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

      setIsCheckingUsername(true);
      
      try {
        // Проверяем, существует ли пользователь с таким именем
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', watchUsername)
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
  }, [watchUsername]);

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

  // Проверяем пользователя и загружаем данные при монтировании
  useEffect(() => {
    let isMounted = true;
    
    const checkUser = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
        if (!isMounted) return;
        
        setUser(session.user);
        
        // Загружаем email из данных сессии пользователя
        if (session.user.email) {
          console.log('Установка email:', session.user.email);
          // Можно добавить поле email в форму при необходимости
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Ошибка при проверке пользователя:', error);
        setErrorMessage('Произошла ошибка при загрузке данных. Пожалуйста, обновите страницу.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkUser();
    
    return () => {
      isMounted = false;
    };
  }, [router, setValue]);

  // Обработчик отправки формы
  const onSubmit = async (data: PageFormData) => {
    try {
      setSaving(true);
      setErrorMessage(null);
      
      // Проверка наличия ID пользователя
      if (!user || !user.id) {
        setErrorMessage('Пользователь не авторизован. Пожалуйста, войдите снова.');
        setSaving(false);
        return;
      }
      
      // Проверяем доступность username перед отправкой
      let finalUsername = data.username;
      let isUsernameTaken = false;
      
      try {
        // Проверяем, существует ли пользователь с таким именем
        const { data: usernameCheck, error: usernameError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', finalUsername)
          .maybeSingle();
          
        if (!usernameError && usernameCheck) {
          isUsernameTaken = true;
          
          // Генерируем уникальное имя пользователя
          const generateUniqueUsername = async () => {
            let uniqueFound = false;
            let counter = 1;
            let candidateUsername = '';
            
            while (!uniqueFound && counter < 100) {
              candidateUsername = `${finalUsername}${counter}`;
              counter++;
              
              // Проверяем, доступно ли сгенерированное имя
              const { data: checkResult, error: checkError } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', candidateUsername)
                .maybeSingle();
              
              if (!checkError && !checkResult) {
                uniqueFound = true;
              }
            }
            
            return uniqueFound ? candidateUsername : `${finalUsername}${Math.floor(Math.random() * 1000)}`;
          };
          
          finalUsername = await generateUniqueUsername();
        }
      } catch (error) {
        console.error('Ошибка при проверке имени пользователя:', error);
        // Продолжаем с указанным именем пользователя в случае ошибки
      }
      
      // Проверяем и обрабатываем загрузку изображения
      let avatarUrl = null;
      if (data.image && data.image instanceof File) {
        try {
          // Проверяем размер файла
          const fileSizeInMB = data.image.size / (1024 * 1024);
          console.log(`Размер файла: ${fileSizeInMB.toFixed(2)} MB`);
          
          if (fileSizeInMB > 5) {
            throw new Error('Размер файла превышает 5MB');
          }
          
          // Вместо загрузки в storage, преобразуем изображение в base64
          console.log('Преобразуем изображение в base64...');
          const reader = new FileReader();
          
          // Используем Promise для асинхронной работы с FileReader
          avatarUrl = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              if (typeof reader.result === 'string') {
                resolve(reader.result);
              } else {
                reject(new Error('Ошибка преобразования изображения'));
              }
            };
            reader.onerror = () => {
              reject(new Error('Ошибка чтения файла'));
            };
            reader.readAsDataURL(data.image as File);
          });
          
          console.log('Изображение успешно преобразовано в base64');
          
        } catch (error: any) {
          console.error('Ошибка при обработке изображения:', error);
          setErrorMessage(`Не удалось обработать изображение: ${error.message || 'Пожалуйста, попробуйте еще раз.'}`);
          setSaving(false);
          return;
        }
      }
      
      // Получаем ID шаблона по умолчанию
      let templateId = null;
      try {
        const { data: templatesData, error: templatesError } = await supabase
          .from('templates')
          .select('id')
          .eq('isDefault', true)
          .maybeSingle();
        
        if (!templatesError && templatesData) {
          templateId = templatesData.id;
        } else {
          // Если шаблон по умолчанию не найден, попробуем получить любой шаблон
          const { data: anyTemplates, error } = await supabase
            .from('templates')
            .select('id')
            .limit(1);
          
          if (!error && anyTemplates && anyTemplates.length > 0) {
            templateId = anyTemplates[0].id;
          } else {
            console.log('Шаблоны не найдены, продолжаем без шаблона');
          }
        }
      } catch (error) {
        console.error('Ошибка при поиске шаблонов:', error);
        // Продолжаем без шаблона
      }

      // Шаг 1: Получить профиль пользователя, или создать его, если не существует
      let profileId;
      
      try {
        // Проверяем, есть ли уже профиль для этого пользователя
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Ошибка при проверке профиля:', profileError);
          throw profileError;
        }
        
        if (existingProfile) {
          // Профиль уже существует, используем его ID
          profileId = existingProfile.id;
        } else {
          // Профиль не существует, создаем новый
          const profileData = {
            user_id: user.id,
            username: finalUsername,
            full_name: data.fullName,
            title: data.title,
            company: data.company,
            bio: data.bio,
            avatar_url: avatarUrl
          };
          
          const { data: newProfile, error } = await supabase
            .from('profiles')
            .insert([profileData])
            .select()
            .maybeSingle();
          
          if (error) {
            console.error('Ошибка создания профиля:', error);
            throw error;
          }
          
          if (!newProfile) {
            throw new Error('Не удалось создать профиль: пустой результат');
          }
          
          profileId = newProfile.id;
          console.log('Профиль успешно создан:', newProfile);
        }
      } catch (error: any) {
        console.error('Ошибка при работе с профилем:', error);
        setErrorMessage(error.message || 'Ошибка при создании профиля');
        setSaving(false);
        return;
      }
      
      // Шаг 2: Создаем страницу
      try {
        const pageData: {
          profile_id: any;
          title: string;
          is_published: boolean;
          custom_styles: {};
          view_count: number;
          template_id?: string | null;
        } = {
          profile_id: profileId,
          title: data.fullName,
          is_published: true,
          custom_styles: {},
          view_count: 0
        };
        
        // Добавляем template_id только если он существует
        if (templateId) {
          pageData.template_id = templateId;
        }
        
        console.log('Отправляемые данные для страницы:', pageData);
        
        const { data: newPage, error } = await supabase
          .from('pages')
          .insert([pageData])
          .select()
          .maybeSingle();
        
        if (error) {
          console.error('Ошибка создания страницы:', error);
          throw error;
        }
        
        console.log('Страница успешно создана:', newPage);
        
        // Шаг 3: Сохраняем контакты (если есть)
        if (data.contacts && data.contacts.length > 0) {
          const validContacts = data.contacts.filter(c => c.value.trim() !== '');
          
          if (validContacts.length > 0) {
            const contactsData = validContacts.map(contact => ({
              profile_id: profileId,
              type: contact.type,
              value: contact.value,
              is_primary: contact.type === 'email'
            }));
            
            const { error: contactsError } = await supabase
              .from('contacts')
              .insert(contactsData);
            
            if (contactsError) {
              console.error('Ошибка при сохранении контактов:', contactsError);
              // Продолжаем выполнение, даже если есть ошибка с контактами
            }
          }
        }
        
        // Шаг 4: Сохраняем ссылки на социальные сети (если есть)
        if (data.social && data.social.length > 0) {
          const validSocial = data.social.filter(s => s.url.trim() !== '');
          
          if (validSocial.length > 0) {
            const socialData = validSocial.map(social => ({
              profile_id: profileId,
              platform: social.platform,
              url: social.url
            }));
            
            const { error: socialError } = await supabase
              .from('social_links')
              .insert(socialData);
            
            if (socialError) {
              console.error('Ошибка при сохранении социальных ссылок:', socialError);
              // Продолжаем выполнение, даже если есть ошибка с социальными ссылками
            }
          }
        }
        
        // Информируем пользователя, если имя было изменено
        if (isUsernameTaken) {
          setSuccessMessage(`Page created successfully with username "${finalUsername}" because "${data.username}" was already taken. Redirecting...`);
        } else {
          setSuccessMessage('Page created successfully! Redirecting...');
        }
        
        // Возвращаемся на страницу dashboard
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 2500); // Увеличиваем задержку, чтобы пользователь успел прочитать сообщение
      } catch (error: any) {
        console.error('Error creating page:', error);
        setErrorMessage(error.message || 'Ошибка при создании страницы');
      }
    } catch (error: any) {
      console.error('Error in form submission:', error);
      setErrorMessage('Произошла ошибка при сохранении данных. Пожалуйста, проверьте поля формы.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 flex">
        <Head>
          <title>Create Page | NTMY</title>
          <meta name="description" content="Create a new page on NTMY" />
        </Head>

        {/* Боковая панель */}
        <div className="w-16 bg-white shadow-md min-h-screen fixed left-0 top-0 bottom-0">
          <div className="flex flex-col items-center py-8 h-full">
            <div className="mb-12">
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white">
                ntmy
              </div>
            </div>
            
            <div className="flex-1 flex flex-col items-center space-y-6">
              <Link href="/admin/dashboard" className="p-2 text-gray-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </Link>
              
              <Link href="/admin/edit-profile" className="p-2 text-gray-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              
              <Link href="/admin/settings" className="p-2 text-gray-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="ml-16 w-full">
          {/* Верхняя панель */}
          <div className="bg-white h-16 shadow-sm flex items-center justify-between px-6">
            <button 
              onClick={() => router.push('/admin/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              disabled={saving}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative z-10"
              tabIndex={-1}
              autoFocus={false}
            >
              {saving ? 'Creating...' : 'Create Page'}
            </button>
          </div>

          <div className="max-w-3xl mx-auto py-10 px-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-2xl font-bold mb-8">Create New Page</h1>
              
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                  {errorMessage}
                </div>
              )}
              
              {successMessage && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                  {successMessage}
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Загрузка фото */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo
                  </label>
                  
                  {showEditor && temporaryImage ? (
                    <div className="mb-4 relative z-0">
                      <div className="flex justify-center mb-4">
                        <AvatarEditor
                          ref={editorRef}
                          image={temporaryImage}
                          width={400}
                          height={400}
                          border={50}
                          borderRadius={200}
                          color={[255, 255, 255, 0.6]} // RGBA
                          scale={scale}
                          className="mx-auto border rounded-lg shadow-sm"
                          crossOrigin="anonymous"
                          onImageReady={() => console.log('Изображение загружено в редактор')}
                          onPositionChange={() => console.log('Позиция изображения изменена')}
                        />
                      </div>
                      
                      <div className="flex justify-center mb-4">
                        <div className="w-[350px]">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zoom
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.01"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => {
                            setShowEditor(false);
                            setTemporaryImage(null);
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            console.log('Кнопка Save нажата');
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
                          }}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                        {previewImage ? (
                          <img 
                            src={previewImage} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          id="image-upload"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              setTemporaryImage(file);
                              setShowEditor(true);
                            }
                          }}
                        />
                        <label
                          htmlFor="image-upload"
                          className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                        >
                          Upload Photo
                        </label>
                        <p className="text-sm text-gray-500 mt-1">
                          JPG, PNG or GIF, max 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Basic Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="flex items-center">
                      <div className="flex-grow flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          ntmy.pro/
                        </span>
                        <Controller
                          control={control}
                          name="username"
                          rules={{ 
                            required: 'Username is required',
                            minLength: {
                              value: 4,
                              message: 'Username should be at least 4 characters'
                            },
                            pattern: {
                              value: /^[a-z0-9_-]{4,16}$/,
                              message: 'Username should contain only Latin letters, numbers, underscores and hyphens (4-16 characters)'
                            },
                            validate: {
                              available: () => isUsernameAvailable === null || isUsernameAvailable === true || 'This username is already taken'
                            }
                          }}
                          render={({ field }) => (
                            <InputMask
                              {...field}
                              mask="aaaaaaaaaaaaaaa" // Маска до 15 символов
                              maskChar=""
                              formatChars={{
                                'a': '[a-z0-9_-]'
                              }}
                              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500"
                            />
                          )}
                        />
                      </div>
                      
                      <div className="ml-3 flex items-center h-10">
                        {isCheckingUsername && (
                          <div className="text-gray-500">
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        
                        {!isCheckingUsername && isUsernameAvailable === true && watchUsername && watchUsername.length >= 4 && (
                          <div className="text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        
                        {!isCheckingUsername && isUsernameAvailable === false && watchUsername && watchUsername.length >= 4 && (
                          <div className="text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {errors.username && (
                      <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      ref={fullNameRef}
                      {...register('fullName', { 
                        required: 'Full name is required',
                        minLength: {
                          value: 2,
                          message: 'Name should be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Name should not exceed 50 characters'
                        }
                      })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title (Position)
                    </label>
                    <input
                      type="text"
                      id="title"
                      {...register('title')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Developer, Designer, Manager, etc."
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      {...register('company')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Company name"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows={4}
                      {...register('bio')}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell about yourself or your company"
                    ></textarea>
                  </div>
                </div>
                
                {/* Contacts */}
                <div className="mb-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1">Contacts</h2>
                    <p className="text-sm text-gray-500">Add contacts that will be saved to the phone book</p>
                  </div>
                  
                  <div className="space-y-4">
                    {contactFields.map((field, index) => (
                      <div key={field.id} className="flex space-x-2">
                        <Controller
                          control={control}
                          name={`contacts.${index}.type`}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="block w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {CONTACT_TYPES.map(type => (
                                <option key={type.id} value={type.id}>
                                  {type.name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        
                        {watch(`contacts.${index}.type`) === 'phone' ? (
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`contacts.${index}.value`}
                              rules={{
                                minLength: {
                                  value: 9,
                                  message: 'Phone number is too short'
                                }
                              }}
                              render={({ field: { value, onChange, onBlur } }) => {
                                // Определяем маску без использования хука
                                let phoneMask = '+9 999 999-99-99';
                                if (value) {
                                  const digits = value.replace(/\D/g, '');
                                  
                                  if (digits.startsWith('7') || digits.startsWith('8')) {
                                    // Российский формат
                                    phoneMask = '+7 (999) 999-99-99';
                                  } else if (digits.startsWith('1')) {
                                    // Североамериканский формат
                                    phoneMask = '+1 (999) 999-9999';
                                  } else if (digits.startsWith('49')) {
                                    // Германия
                                    phoneMask = '+49 999 9999999';
                                  } else if (digits.startsWith('44')) {
                                    // Великобритания
                                    phoneMask = '+44 99 9999 9999';
                                  } else if (digits.startsWith('33')) {
                                    // Франция
                                    phoneMask = '+33 9 99 99 99 99';
                                  } else {
                                    // Универсальный формат
                                    phoneMask = '+999 999 999-99-99';
                                  }
                                }
                                
                                return (
                                  <InputMask
                                    mask={phoneMask}
                                    value={value}
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="+_ ___ ___-__-__"
                                    alwaysShowMask={false}
                                  />
                                );
                              }}
                            />
                            {errors.contacts?.[index]?.value && (
                              <p className="mt-1 text-sm text-red-600">{errors.contacts[index]?.value?.message}</p>
                            )}
                          </div>
                        ) : watch(`contacts.${index}.type`) === 'email' ? (
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`contacts.${index}.value`}
                              rules={{
                                required: 'Email is required',
                                pattern: {
                                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                                  message: 'Invalid email format. Use only Latin letters, digits, and special characters'
                                }
                              }}
                              render={({ field }) => (
                                <InputMask
                                  {...field}
                                  mask=""
                                  maskChar=""
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="name@example.com"
                                />
                              )}
                            />
                            {errors.contacts?.[index]?.value && (
                              <p className="mt-1 text-sm text-red-600">{errors.contacts[index]?.value?.message}</p>
                            )}
                          </div>
                        ) : watch(`contacts.${index}.type`) === 'website' ? (
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`contacts.${index}.value`}
                              rules={{
                                required: 'Website is required',
                                validate: (value) => {
                                  try {
                                    const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
                                    return pattern.test(value) || 'Please enter a valid URL';
                                  } catch (e) {
                                    return false;
                                  }
                                }
                              }}
                              render={({ field }) => (
                                <InputMask
                                  {...field}
                                  mask=""
                                  maskChar=""
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="https://example.com"
                                />
                              )}
                            />
                            {errors.contacts?.[index]?.value && (
                              <p className="mt-1 text-sm text-red-600">{errors.contacts[index]?.value?.message}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1">
                            <Controller
                              control={control}
                              name={`contacts.${index}.value`}
                              render={({ field }) => (
                                <InputMask
                                  {...field}
                                  mask=""
                                  maskChar=""
                                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Telegram username"
                                />
                              )}
                            />
                            {errors.contacts?.[index]?.value && (
                              <p className="mt-1 text-sm text-red-600">{errors.contacts[index]?.value?.message}</p>
                            )}
                          </div>
                        )}
                        
                        {/* Кнопка удаления контакта только если их больше одного */}
                        {contactFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeContact(index)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => appendContact({ type: 'phone', value: '' })}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    tabIndex={-1}
                    autoFocus={false}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Contact
                  </button>
                </div>
                
                {/* Social Links */}
                <div className="mb-8">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold mb-1">Social Links</h2>
                    <p className="text-sm text-gray-500">Add links and social networks that will appear as icons</p>
                  </div>
                  
                  <div className="space-y-4">
                    {socialFields.map((field, index) => (
                      <div key={field.id} className="flex space-x-2">
                        <Controller
                          control={control}
                          name={`social.${index}.platform`}
                          render={({ field }) => (
                            <select
                              {...field}
                              className="block w-1/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                              {SOCIAL_PLATFORMS.map(platform => (
                                <option key={platform.id} value={platform.id}>
                                  {platform.name}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        
                        <div className="flex-1">
                          <Controller
                            control={control}
                            name={`social.${index}.url`}
                            rules={{
                              validate: value => !value || (value && /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) || 'Please enter a valid URL'
                            }}
                            render={({ field }) => (
                              <InputMask
                                {...field}
                                mask=""
                                maskChar=""
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://example.com"
                              />
                            )}
                          />
                          {errors.social?.[index]?.url && (
                            <p className="mt-1 text-sm text-red-600">{errors.social[index]?.url?.message}</p>
                          )}
                        </div>
                        
                        {/* Кнопка удаления социальных ссылок только если их больше одной */}
                        {socialFields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSocial(index)}
                            className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => appendSocial({ platform: 'linkedin', url: '' })}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    tabIndex={-1}
                    autoFocus={false}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Social Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CreatePage; 