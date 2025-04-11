import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';
import { FiHome, FiSettings, FiBarChart2, FiEdit2, FiShare2, FiDownload, FiExternalLink } from 'react-icons/fi';
import QRCode from 'qrcode.react';

const ViewCard = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState<any>(null);
  const [error, setError] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  
  useEffect(() => {
    const fetchCardData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Получаем данные карточки из Supabase
        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error('Карточка не найдена');
        }
        
        setCard(data);
      } catch (err) {
        console.error('Ошибка при загрузке карточки:', err);
        setError('Не удалось загрузить данные карточки');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchCardData();
    }
  }, [id]);
  
  const getCardUrl = () => {
    if (!card?.username) return '';
    return `${window.location.origin}/${card.username}`;
  };
  
  const handleShare = async () => {
    const url = getCardUrl();
    if (!url) return;
    
    // Используем Web Share API, если он доступен
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${card.name} - NTMY Карточка`,
          text: 'Ознакомьтесь с моей цифровой визиткой',
          url
        });
      } catch (err) {
        console.error('Ошибка при попытке поделиться:', err);
        setShowShareModal(true);
      }
    } else {
      setShowShareModal(true);
    }
  };
  
  const handleCopyLink = () => {
    const url = getCardUrl();
    if (!url) return;
    
    navigator.clipboard.writeText(url)
      .then(() => {
        alert('Ссылка скопирована в буфер обмена');
      })
      .catch(err => {
        console.error('Не удалось скопировать ссылку:', err);
      });
  };
  
  const handleDownloadQR = () => {
    const canvas = document.getElementById('card-qr-code') as HTMLCanvasElement;
    if (!canvas) return;
    
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `${card.username || 'card'}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };
  
  // Определяем стили для предпросмотра в зависимости от шаблона
  const getTemplateStyles = () => {
    if (!card) return {};
    
    switch (card.template) {
      case 'gradient':
        return {
          background: 'bg-gradient-to-b from-blue-500 to-purple-600',
          text: 'text-white',
          nameText: 'text-white',
          subtitleText: 'text-white/80',
          bioText: 'text-white/80',
          contactBg: 'bg-white/10',
          contactText: 'text-white/80',
          contactValueText: 'text-white',
          avatarBg: 'bg-white/20',
          avatarRing: 'ring-4 ring-white/30',
          socialBg: 'bg-white/20',
          socialText: 'text-white'
        };
      case 'dark':
        return {
          background: 'bg-gray-900',
          text: 'text-gray-100',
          nameText: 'text-white',
          subtitleText: 'text-gray-400',
          bioText: 'text-gray-400',
          contactBg: 'bg-gray-800',
          contactText: 'text-gray-400',
          contactValueText: 'text-gray-200',
          avatarBg: 'bg-gray-800',
          avatarRing: 'ring-2 ring-gray-700',
          socialBg: 'bg-gray-800',
          socialText: 'text-blue-400'
        };
      default: // minimal
        return {
          background: 'bg-white',
          text: 'text-gray-900',
          nameText: 'text-gray-900',
          subtitleText: 'text-gray-600',
          bioText: 'text-gray-600',
          contactBg: 'bg-gray-50',
          contactText: 'text-gray-600',
          contactValueText: 'text-gray-900',
          avatarBg: 'bg-gray-100',
          avatarRing: '',
          socialBg: 'bg-blue-100',
          socialText: 'text-blue-800'
        };
    }
  };
  
  const styles = getTemplateStyles();
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>{card ? `${card.name} - Просмотр карточки` : 'Просмотр карточки'} | NTMY</title>
      </Head>
      
      {/* Боковая панель */}
      <div className="w-16 bg-white shadow-sm min-h-screen fixed left-0 top-0 bottom-0">
        <div className="flex flex-col items-center py-8 h-full">
          <div className="mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              <span className="text-sm">N</span>
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
          {loading ? (
            <div className="flex justify-center items-center bg-white rounded-xl shadow-sm border border-gray-200 p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-6">
              <h2 className="text-lg font-medium mb-2">Ошибка</h2>
              <p>{error}</p>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Вернуться на главную
              </button>
            </div>
          ) : card ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-medium text-gray-800">{card.name}</h1>
                  <p className="text-gray-500 mt-1">Просмотр карточки и управление доступом</p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    href={`/admin/edit-card/${id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FiEdit2 className="mr-2 h-4 w-4" />
                    Редактировать
                  </Link>
                  
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
                  >
                    <FiShare2 className="mr-2 h-4 w-4" />
                    Поделиться
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Мобильный просмотр */}
                <div className="lg:col-span-2 mx-auto">
                  <div className="rounded-[40px] bg-gray-900 p-3 shadow-xl">
                    {/* Phone Frame */}
                    <div className={`relative rounded-[32px] overflow-hidden ${styles.background}`}>
                      {/* Status Bar */}
                      <div className="h-12 bg-gray-900 flex items-center justify-between px-6">
                        <div className="text-white text-sm">9:41</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4">
                            <svg viewBox="0 0 24 24" className="text-white">
                              <path fill="currentColor" d="M12 21.5c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10z"/>
                            </svg>
                          </div>
                          <div className="w-4 h-4">
                            <svg viewBox="0 0 24 24" className="text-white">
                              <path fill="currentColor" d="M2 22h20V2H2v20zm2-2V4h16v16H4z"/>
                            </svg>
                          </div>
                          <div className="text-white">100%</div>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-6 space-y-6 min-h-[500px]">
                        {/* Profile Image */}
                        <div className="flex justify-center">
                          <div className={`w-24 h-24 rounded-full overflow-hidden ${styles.avatarBg} ${styles.avatarRing}`}>
                            {card.image_url ? (
                              <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${card.template === 'minimal' ? 'text-gray-400' : 'text-white/60'} text-4xl`}>
                                {card.name ? card.name.charAt(0).toUpperCase() : '?'}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Profile Info */}
                        <div className="text-center space-y-2">
                          <h1 className={`text-2xl font-bold ${styles.nameText}`}>{card.name}</h1>
                          {card.job_title && <p className={styles.subtitleText}>{card.job_title}</p>}
                          {card.company && <p className={styles.subtitleText}>{card.company}</p>}
                        </div>

                        {/* Bio */}
                        {card.bio && (
                          <p className={`${styles.bioText} text-center`}>{card.bio}</p>
                        )}

                        {/* Contact Links */}
                        <div className="space-y-3">
                          {card.email && (
                            <a 
                              href={`mailto:${card.email}`} 
                              className={`flex items-center p-3 ${styles.contactBg} rounded-lg`}
                            >
                              <span className={styles.contactText}>Email</span>
                              <span className={`ml-auto ${styles.contactValueText}`}>{card.email}</span>
                            </a>
                          )}
                          {card.phone && (
                            <a 
                              href={`tel:${card.phone}`} 
                              className={`flex items-center p-3 ${styles.contactBg} rounded-lg`}
                            >
                              <span className={styles.contactText}>Phone</span>
                              <span className={`ml-auto ${styles.contactValueText}`}>{card.phone}</span>
                            </a>
                          )}
                        </div>

                        {/* Social Links */}
                        <div className="flex justify-center space-x-4">
                          {card.linkedin_url && (
                            <a 
                              href={card.linkedin_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`w-10 h-10 ${styles.socialBg} rounded-full flex items-center justify-center`}
                            >
                              <span className={`${styles.socialText} font-bold`}>in</span>
                            </a>
                          )}
                          {card.telegram_url && (
                            <a 
                              href={card.telegram_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`w-10 h-10 ${styles.socialBg} rounded-full flex items-center justify-center`}
                            >
                              <span className={`${styles.socialText} font-bold`}>T</span>
                            </a>
                          )}
                          {card.whatsapp_url && (
                            <a 
                              href={card.whatsapp_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`w-10 h-10 ${card.template === 'minimal' ? 'bg-green-100' : styles.socialBg} rounded-full flex items-center justify-center`}
                            >
                              <span className={`${card.template === 'minimal' ? 'text-green-800' : styles.socialText} font-bold`}>W</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Информация и статистика */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Карточка с информацией */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Информация о карточке</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Имя</h3>
                        <p className="text-gray-900">{card.name}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Должность</h3>
                        <p className="text-gray-900">{card.job_title || 'Не указана'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Компания</h3>
                        <p className="text-gray-900">{card.company || 'Не указана'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Шаблон</h3>
                        <p className="text-gray-900 capitalize">{card.template || 'minimal'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Дата создания</h3>
                        <p className="text-gray-900">{new Date(card.created_at).toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Последнее обновление</h3>
                        <p className="text-gray-900">{new Date(card.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ссылка и QR-код */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Публичная ссылка</h2>
                    
                    {card.username ? (
                      <>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex-1 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                            <span className="text-gray-900">{`${typeof window !== 'undefined' ? window.location.origin : 'https://ntmy.com'}/${card.username}`}</span>
                          </div>
                          <button
                            onClick={handleCopyLink}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                          >
                            Копировать
                          </button>
                          <a
                            href={`/${card.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm inline-flex items-center"
                          >
                            <FiExternalLink className="mr-2 h-4 w-4" />
                            Открыть
                          </a>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
                          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 w-40 h-40 mx-auto md:mx-0">
                            <QRCode
                              id="card-qr-code"
                              value={getCardUrl()}
                              size={152}
                              level="H"
                              renderAs="canvas"
                            />
                          </div>
                          
                          <div className="flex-1 space-y-4">
                            <p className="text-gray-600">
                              Этот QR-код предоставляет прямой доступ к вашей цифровой визитке. Разместите его на печатных материалах или визитках для быстрого доступа.
                            </p>
                            
                            <button
                              onClick={handleDownloadQR}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <FiDownload className="mr-2 h-4 w-4" />
                              Скачать QR-код
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="bg-yellow-50 p-4 rounded-lg text-yellow-800 border border-yellow-200">
                        <p>
                          Для этой карточки не задан username. Отредактируйте карточку, чтобы добавить уникальное имя пользователя и получить публичную ссылку.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* Статистика просмотров */}
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Статистика просмотров</h2>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-semibold text-gray-900">{card.view_count || 0}</span>
                        <p className="text-gray-500 mt-1">всего просмотров</p>
                      </div>
                      
                      <div className="text-right">
                        <Link
                          href={`/admin/analytics?card=${card.id}`}
                          className="text-blue-500 font-medium hover:text-blue-600"
                        >
                          Подробная статистика
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
      
      {/* Модальное окно для шаринга */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Поделиться карточкой</h3>
            
            <p className="text-gray-600 mb-6">
              Выберите способ, которым вы хотите поделиться своей цифровой визиткой:
            </p>
            
            <div className="space-y-4">
              {card.username && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex-1 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm">
                      <span className="text-gray-900">{getCardUrl()}</span>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                    >
                      Копировать
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=${getCardUrl()}&text=Ознакомьтесь с моей цифровой визиткой`, '_blank');
                  }}
                >
                  <span className="mr-2 text-blue-500 font-bold">T</span>
                  Telegram
                </button>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {
                    window.open(`https://wa.me/?text=Ознакомьтесь с моей цифровой визиткой: ${getCardUrl()}`, '_blank');
                  }}
                >
                  <span className="mr-2 text-green-500 font-bold">W</span>
                  WhatsApp
                </button>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => {
                    window.open(`mailto:?subject=Моя цифровая визитка&body=Ознакомьтесь с моей цифровой визиткой: ${getCardUrl()}`, '_blank');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </button>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 text-sm"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCard; 