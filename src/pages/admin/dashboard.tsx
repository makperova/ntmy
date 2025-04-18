import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import InputDesign from '../../components/InputDesign';
import SquareImage from '../../components/SquareImage';
import { FiHome, FiSettings, FiBarChart2 } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';

// Убедиться, что мы используем правильный URL Supabase
console.log('Using Supabase URL:', 'https://phfdwwehrkajvlsihqgj.supabase.co');

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [userPages, setUserPages] = useState<any[]>([]);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [combinedItems, setCombinedItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [migrationEnabled, setMigrationEnabled] = useState(false);

  // Функция для получения корректного URL карточки
  const getCardUrl = (item) => {
    // Определяем базовый URL (предпочтительно из окружения или конфигурации)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://ntmy.com';
    
    try {
      // Формируем URL в зависимости от типа элемента
      if (item.type === 'card') {
        // !!! ИСПРАВЛЕНО !!! Для карточки используем username
        if (item.username) {
           return `${baseUrl}/card/${item.username}`; // Теперь используем username
        } else {
           console.warn('Card item is missing username:', item);
           // Возвращаем заглушку или URL дашборда, если username отсутствует
           return `${baseUrl}/admin/dashboard`; 
        }
      } else if (item.type === 'page' && item.username) { // Проверяем тип 'page' и наличие username
        // Для страницы профиля формируем URL вида /имя_пользователя
        return `${baseUrl}/${item.username}`;
      } else {
        console.warn('Item without username or unknown type:', item);
        return baseUrl;
      }
    } catch (err) {
      console.error('Error generating item URL:', err, item);
      return baseUrl;
    }
  };

  // Функция для безопасного открытия карточки
  const handleOpenCard = (item) => {
    // Проверяем необходимые данные перед открытием
    if (!item) {
      alert('Ошибка: Данные карточки недоступны');
      return;
    }
    
    if (item.type === 'card' && !item.username) {
      alert('Ошибка: В настоящий момент публичный доступ к карточке невозможен.\n\nВозможно, карточка еще не синхронизирована с базой данных или требуется обновить страницу.');
      return;
    }
    
    // Если все проверки прошли успешно, открываем URL
    const url = getCardUrl(item);
    window.open(url, '_blank');
  };

  // Новая функция для загрузки карточек без Supabase
  const loadCardsDirectly = async (userId: string, userEmail: string) => {
    try {
      console.log('Загружаем карточки напрямую из MongoDB');
      
      // Пробуем загрузить карточки по ID пользователя или email
      const headers: Record<string, string> = {};
      
      // Если это специальный пользователь makperova@gmail.com, добавляем специальный токен
      if (userEmail === 'makperova@gmail.com') {
        headers['special-access-token'] = 'ntmy-temp-migration-token';
        setMigrationEnabled(true);
      }
      
      // Определяем параметр запроса (ID или email)
      const queryParam = userEmail ? userEmail : userId;
      
      const response = await fetch(`/api/cards/user/${queryParam}`, { headers });
      
      if (!response.ok) {
        console.error('Ошибка при загрузке карточек:', response.status);
        throw new Error(`Ошибка при загрузке карточек: ${response.status}`);
      }
      
      const cards = await response.json();
      console.log('Карточки пользователя из MongoDB:', cards);
      
      // Форматируем карточки для совместимости с интерфейсом
      const formattedCards = cards ? cards.map(card => ({
        ...card,
        id: card._id || card.id, // MongoDB использует _id
        full_name: card.name || 'Без имени',
        avatar_url: card.image_url,
        type: 'card',
        // Добавляем значения по умолчанию для совместимости с интерфейсом страниц
        username: card.username || `card-${card._id || card.id}`,
        title: card.job_title || '',
        company: card.company || ''
      })) : [];
      
      console.log('Карточки после форматирования:', formattedCards);
      setUserCards(formattedCards);
      
      // Если у пользователя makperova@gmail.com нет карточек, добавляем специальные
      if (userEmail === 'makperova@gmail.com' && (!formattedCards || formattedCards.length === 0)) {
        const specialCards = [
          {
            id: 'special-carter',
            name: 'Carter',
            username: 'carter',
            full_name: 'Carter',
            job_title: 'Developer',
            company: 'NTMY',
            type: 'card',
            image_url: null
          },
          {
            id: 'special-osho',
            name: 'Osho',
            username: 'osho',
            full_name: 'Osho',
            job_title: 'Spiritual Teacher',
            company: 'Osho International',
            type: 'card',
            image_url: 'https://randomuser.me/api/portraits/men/29.jpg'
          },
          {
            id: 'special-marina',
            name: 'Marina',
            username: 'marina',
            full_name: 'Marina',
            job_title: 'Designer',
            company: 'Design Studio',
            type: 'card',
            image_url: null
          }
        ];
        
        console.log('Добавляем специальные карточки:', specialCards);
        setUserCards(specialCards);
      }
      
      return true;
    } catch (error) {
      console.error('Ошибка при загрузке карточек пользователя:', error);
      setError('Не удалось загрузить карточки. Пожалуйста, обновите страницу или обратитесь к администратору.');
      setUserCards([]);
      return false;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Пытаемся получить сессию из Supabase
        const { data: { session } } = await supabase.auth.getSession().catch(e => {
          console.error('Ошибка при получении сессии Supabase:', e);
          return { data: { session: null } };
        });
        
        // Если есть параметр для миграции в URL, пытаемся использовать его
        const { migrate_email } = router.query;
        
        if (session) {
          // Supabase работает, используем стандартный путь
          console.log('Текущий пользователь (Supabase):', session.user.id);
          setUser(session.user);
          
          // Загружаем профиль пользователя через Supabase
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (profileError) {
              console.error('Ошибка при загрузке профиля:', profileError);
            } else {
              const activeProfile = profileData && profileData.length > 0 ? profileData[0] : null;
              setProfile(activeProfile);
              
              // Загружаем страницы пользователя, используя profile_id
              if (activeProfile && activeProfile.id) {
                const { data: pages, error: pagesError } = await supabase
                  .from('pages')
                  .select(`
                    *,
                    profiles:profile_id (username, full_name, avatar_url)
                  `)
                  .eq('profile_id', activeProfile.id);
                
                if (pagesError) {
                  console.error('Ошибка при загрузке страниц:', pagesError);
                } else {
                  // Преобразуем результаты запроса для совместимости с существующим кодом
                  const formattedPages = pages ? pages.map(page => ({
                    ...page,
                    username: page.profiles?.username || '',
                    full_name: page.profiles?.full_name || page.title || '',
                    avatar_url: page.profiles?.avatar_url || null,
                    type: 'page'
                  })) : [];
                  
                  console.log('Загруженные страницы:', formattedPages);
                  setUserPages(formattedPages);
                }
              } else {
                setUserPages([]);
              }
              
              // Загружаем карточки напрямую
              await loadCardsDirectly(session.user.id, session.user.email);
            }
          } catch (error) {
            console.error('Ошибка при загрузке данных профиля:', error);
            // Пробуем загрузить карточки напрямую
            await loadCardsDirectly(session.user.id, session.user.email);
          }
        } else if (migrate_email) {
          // Для миграции: эмулируем пользователя по email из URL
          console.log('Используем email для миграции:', migrate_email);
          
          const mockUser = {
            id: `migration-${Date.now()}`,
            email: Array.isArray(migrate_email) ? migrate_email[0] : migrate_email as string
          };
          
          setUser(mockUser);
          setProfile({ id: mockUser.id, email: mockUser.email });
          
          // Загружаем карточки напрямую по email
          await loadCardsDirectly(mockUser.id, mockUser.email);
        } else {
          // Если нет сессии и нет параметра миграции, перенаправляем на страницу входа
          // Но перед этим пробуем специальный случай для makperova@gmail.com
          const mockUser = {
            id: 'migration-makperova',
            email: 'makperova@gmail.com'
          };
          
          console.log('Пробуем загрузить карточки для makperova@gmail.com');
          const cardsLoaded = await loadCardsDirectly(mockUser.id, mockUser.email);
          
          if (cardsLoaded) {
            setUser(mockUser);
            setProfile({ id: mockUser.id, email: mockUser.email });
          } else {
            router.push('/signin');
            return;
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка при проверке пользователя:', error);
        setError('Произошла ошибка при входе. Пожалуйста, обновите страницу или обратитесь к администратору.');
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

  // Объединяем страницы и карточки для отображения
  useEffect(() => {
    console.log('userPages:', userPages);
    console.log('userCards:', userCards);
    
    // Объединяем реальные данные
    let combined = [...userPages, ...userCards];
    
    // Если данных нет, используем пустой массив вместо моковых данных
    if (combined.length === 0) {
      combined = [];
    }
    
    // Сортировка по дате создания (более новые показываются первыми)
    combined.sort((a, b) => {
      return new Date(b.createdAt || b.created_at || Date.now()).getTime() - 
             new Date(a.createdAt || a.created_at || Date.now()).getTime();
    });
    
    console.log('Общее количество элементов:', combined.length);
    console.log('Страницы:', userPages.length);
    console.log('Карточки из базы данных:', userCards.length);
    console.log('Объединенные элементы:', combined);
    
    setCombinedItems(combined);
  }, [userPages, userCards, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
          <title>Dashboard | NTMY</title>
          <meta name="description" content="Manage your NTMY digital business cards" />
      </Head>

        {/* Верхняя часть с заголовком */}
        <div className="pt-7 px-4">
          <div className="flex items-center">
            <div className="text-blue-500 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h1 className="text-lg font-medium">Dashboard</h1>
          </div>
        </div>

        {/* Основной контент с паддингом для скролла */}
        <div className="pb-24">
          {/* Приветствие вместо профиля */}
          <div className="mt-8 px-4">
            <h1 className="text-2xl font-medium text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your digital business cards and profiles.</p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h2 className="font-medium text-blue-800">Привет, {profile?.full_name || user?.email?.split('@')[0] || 'пользователь'}!</h2>
              <p className="text-blue-600 text-sm mt-1">Добро пожаловать в ваш личный кабинет NTMY.</p>
            </div>
          </div>

          {/* My Pages & Cards - Мобильная версия */}
          <div className="mt-10 px-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-800">My Pages & Cards</h2>
              <button 
                onClick={() => router.push('/admin/edit-card')}
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                + Create new
              </button>
            </div>
            
            {combinedItems.length > 0 ? (
              <div className="space-y-4">
                {combinedItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium">{item.full_name}</h3>
                          <div className="flex items-center text-xs text-gray-500">
                            {item.type === 'card' && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mr-2">Card</span>}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{item.view_count || 0} views</span>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <button 
                            onClick={() => handleOpenCard(item)}
                            className="hover:underline text-blue-600"
                          >
                            {item.type === 'card' && item.username ? 
                              `ntmy.com/card/${item.username}` : 
                              (item.type === 'page' && item.username ? 
                                `ntmy.com/${item.username}` : 
                                'Link unavailable')
                            }
                          </button>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                          <button 
                            onClick={() => router.push(`/admin/edit-card?id=${item.id}`)}
                            className="text-xs text-blue-500 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <button 
                            onClick={() => handleOpenCard(item)}
                            className="text-xs text-green-500 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Open
                          </button>
                          
                          <button 
                            onClick={() => {
                              const shareUrl = getCardUrl(item);
                              
                              if (navigator.share) {
                                navigator.share({
                                  title: item.full_name,
                                  url: shareUrl
                                }).catch(err => console.error('Error sharing:', err));
                              } else {
                                navigator.clipboard.writeText(shareUrl)
                                  .then(() => alert('Link copied to clipboard!'))
                                  .catch(err => console.error('Error copying link:', err));
                              }
                            }}
                            className={`${actionButtonClass} text-purple-600`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 py-16 flex flex-col justify-center items-center rounded-xl mt-4">
                <InputDesign />
                <button 
                  onClick={() => router.push('/admin/edit-card')}
                  className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
                >
                  Create New Card
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Нижняя навигационная панель */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center py-3 px-4">
          <Link 
            href="/admin/dashboard" 
            className="flex flex-col items-center text-blue-500"
          >
            <FiHome className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            href="/admin/analytics" 
            className="flex flex-col items-center text-gray-400 hover:text-blue-500"
          >
            <FiBarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <Link 
            href="/admin/settings" 
            className="flex flex-col items-center text-gray-400 hover:text-blue-500"
          >
            <FiSettings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>
    );
  }

  // Update styles for a modern, light theme
  const buttonClass = "px-4 py-3 rounded-xl text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors w-full";
  const accentBlockClass = "bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-200";
  const profileHeaderClass = "text-2xl font-medium text-gray-800";
  const profileSubHeaderClass = "text-sm text-gray-500";
  const profileTextClass = "text-lg font-medium text-gray-800";

  // Определяем стили для кнопок действий
  const actionButtonClass = "inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-colors";

  // Apply updated styles
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard | NTMY</title>
        <meta name="description" content="Manage your digital business cards" />
      </Head>

      {!isMobile && <Sidebar />}

      <div className={`${isMobile ? 'w-full pb-16' : 'ml-16 w-full'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
              {error}
            </div>
          )}
          
          {migrationEnabled && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-700">
              <h3 className="font-medium">Режим миграции</h3>
              <p className="mt-1">Вы работаете в режиме миграции после отключения Supabase.</p>
              <p className="mt-1">Для доступа к карточкам используйте следующий URL: <code className="bg-yellow-100 px-1 py-0.5 rounded">/admin/dashboard?migrate_email=makperova@gmail.com</code></p>
              <div className="mt-3 pt-3 border-t border-yellow-200">
                <p className="font-medium">Инструкции по полной миграции:</p>
                <ol className="list-decimal pl-5 mt-1">
                  <li>Запустите скрипт миграции: <code className="bg-yellow-100 px-1 py-0.5 rounded">node scripts/prepare-for-migration.js</code></li>
                  <li>Добавьте переменные окружения из вывода скрипта в .env.local</li>
                  <li>Перезапустите приложение с новыми переменными</li>
                </ol>
              </div>
            </div>
          )}

          {/* Верхняя часть с заголовком и кнопкой */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">Your Digital Business Cards</h1>
            <Link 
              href="/admin/edit-card"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Create New Card
            </Link>
          </div>

          {/* Остальной контент */}
          {/* ... существующий код ... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;