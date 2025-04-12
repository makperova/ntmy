import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import InputDesign from '../../components/InputDesign';
import SquareImage from '../../components/SquareImage';
import { FiHome, FiSettings, FiBarChart2 } from 'react-icons/fi';

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

  // Функция для получения корректного URL карточки
  const getCardUrl = (item) => {
    // Определяем базовый URL (предпочтительно из окружения или конфигурации)
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_BASE_URL || 'https://ntmy.com';
    
    try {
      // Формируем URL в зависимости от типа элемента
      if (item.type === 'card') {
        // Для карточки формируем URL вида /card/ID
        return `${baseUrl}/card/${item.id}`;
      } else if (item.username) {
        // Для профиля формируем URL вида /имя_пользователя
        return `${baseUrl}/${item.username}`;
      } else {
        console.warn('Item without username or type card:', item);
        return baseUrl;
      }
    } catch (err) {
      console.error('Error generating card URL:', err, item);
      return baseUrl;
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/signin');
          return;
        }
        
        console.log('Текущий пользователь:', session.user.id);
        setUser(session.user);
        
        // Загружаем профиль пользователя
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (profileError) {
          console.error('Ошибка при загрузке профиля:', profileError);
        } else {
          console.log('Профили пользователя:', profileData);
          // Используем первый профиль из списка (самый новый)
          const activeProfile = profileData && profileData.length > 0 ? profileData[0] : null;
          console.log('Активный профиль:', activeProfile);
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
          
          // Получаем информацию о структуре таблицы cards
          console.log('Получаем информацию о структуре таблицы cards');
          const { data: tableInfo, error: tableError } = await supabase
            .from('cards')
            .select('*')
            .limit(1);
          
          if (tableError) {
            console.error('Ошибка при получении структуры таблицы cards:', tableError);
          } else {
            console.log('Структура таблицы cards:', tableInfo);
            if (tableInfo && tableInfo.length > 0) {
              console.log('Поля таблицы cards:', Object.keys(tableInfo[0]));
              console.log('Пример ID карточки:', tableInfo[0].id);
              console.log('Тип ID:', typeof tableInfo[0].id);
            }
          }
          
          // Загружаем карточки пользователя НАПРЯМУЮ по user_id
          console.log('Запрос карточек для пользователя:', session.user.id);
          const { data: cards, error: cardsError } = await supabase
            .from('cards')
            .select('*');
          
          console.log('Все карточки в системе:', cards);
          
          // Теперь отдельный запрос по user_id
          const { data: userCards, error: userCardsError } = await supabase
            .from('cards')
            .select('*')
            .eq('user_id', session.user.id);
          
          if (userCardsError) {
            console.error('Ошибка при загрузке карточек пользователя:', userCardsError);
            console.error('Детали ошибки:', userCardsError.message, userCardsError.details);
          } else {
            console.log('Карточки пользователя по user_id:', userCards);
            
            // Логируем ID карточек для проверки формата
            if (userCards && userCards.length > 0) {
              console.log('ID карточек пользователя:');
              userCards.forEach((card, index) => {
                console.log(`Карточка ${index + 1}:`, card.id, 'UUID формат:', /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(card.id));
              });
            }
            
            // Форматируем карточки для совместимости с интерфейсом
            const formattedCards = userCards ? userCards.map(card => ({
              ...card,
              full_name: card.name || 'Без имени',
              avatar_url: card.image_url,
              type: 'card',
              // Добавляем значения по умолчанию для совместимости с интерфейсом страниц
              username: card.username || `card-${card.id}`,
              title: card.job_title || '',
              company: card.company || ''
            })) : [];
            
            console.log('Карточки после форматирования:', formattedCards);
            setUserCards(formattedCards);
          }
        }
        
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
      return new Date(b.created_at || Date.now()).getTime() - new Date(a.created_at || Date.now()).getTime();
    });
    
    console.log('Общее количество элементов:', combined.length);
    console.log('Страницы:', userPages.length);
    console.log('Карточки:', userCards.length);
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
                          <a 
                            href={getCardUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {item.type === 'card' ? 
                              `ntmy.com/card/${item.id}` : 
                              `ntmy.com/${item.username || ''}`}
                          </a>
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
                          
                          <a 
                            href={getCardUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${actionButtonClass} text-green-600`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Open
                          </a>
                          
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
          <Link href="/admin/dashboard" className="flex flex-col items-center text-blue-500">
            <FiHome className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link href="/admin/analytics" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
            <FiBarChart2 className="h-6 w-6" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <Link href="/admin/settings" className="flex flex-col items-center text-gray-400 hover:text-blue-500">
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
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>Dashboard | NTMY</title>
        <meta name="description" content="Manage your NTMY digital business cards" />
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
            <Link href="/admin/dashboard" className="p-2 text-blue-500">
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
        <div className="max-w-3xl mx-auto py-10 px-6">
          {/* Приветствие вместо профиля */}
          <div className="bg-white rounded-xl shadow-sm mb-8 p-6 border border-gray-200">
            <h1 className="text-2xl font-medium text-gray-800 mb-2">Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your digital business cards and profiles.</p>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h2 className="font-medium text-blue-800">Привет, {profile?.full_name || user?.email?.split('@')[0] || 'пользователь'}!</h2>
              <p className="text-blue-600 text-sm mt-1">Добро пожаловать в ваш личный кабинет NTMY.</p>
            </div>
          </div>

          {/* My Pages - Десктопная/мобильная версия */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800">My Pages & Cards</h2>
              <Link href="/admin/edit-card" className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                + Create new
              </Link>
            </div>
            
            {combinedItems.length > 0 ? (
              <div className="border-t border-gray-100 mt-4">
                {combinedItems.map((item) => (
                  <div key={item.id} className="py-6 border-b border-gray-100">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                        {item.avatar_url ? (
                          <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center flex-wrap">
                              <h3 className="text-lg font-medium text-gray-800">{item.full_name}</h3>
                              {item.type === 'card' && (
                                <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">Card</span>
                              )}
                            </div>
                            {item.title && <p className="text-gray-500">{item.title} {item.company ? `at ${item.company}` : ''}</p>}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{item.view_count || 0} views</span>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <a 
                            href={getCardUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {item.type === 'card' ? 
                              `ntmy.com/card/${item.id}` : 
                              `ntmy.com/${item.username || ''}`}
                          </a>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button 
                            onClick={() => router.push(`/admin/edit-card?id=${item.id}`)}
                            className={`${actionButtonClass} text-blue-600`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          
                          <a 
                            href={getCardUrl(item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${actionButtonClass} text-green-600`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Open
                          </a>
                          
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
      </div>
    </div>
  );
};

export default Dashboard;