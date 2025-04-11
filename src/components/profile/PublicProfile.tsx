import React, { useState } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Profile, SocialLink } from '../../types/profile';

interface PublicProfileProps {
  profile: Profile;
  socialLinks: SocialLink[];
  isOwner: boolean;
  username: string;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ profile, socialLinks, isOwner, username }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const [followEmailInput, setFollowEmailInput] = useState('');
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followSubmitted, setFollowSubmitted] = useState(false);
  
  const pageUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${username}`;
  
  // Функция для создания и скачивания vCard контакта
  const downloadContact = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${profile.name}`,
      profile.role ? `TITLE:${profile.role}` : '',
      profile.company ? `ORG:${profile.company}` : '',
      profile.email ? `EMAIL:${profile.email}` : '',
      profile.phone ? `TEL:${profile.phone}` : '',
      `URL:${pageUrl}`,
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Функция для подписки на обновления профиля
  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // В реальном приложении здесь будет отправка запроса к API
      // await fetch('/api/profile/follow', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ profileId: profile.id, email: followEmailInput })
      // });
      
      setFollowSubmitted(true);
      setTimeout(() => {
        setShowFollowModal(false);
        setFollowSubmitted(false);
        setFollowEmailInput('');
      }, 2000);
    } catch (error) {
      console.error('Error following profile:', error);
    }
  };

  // Функция для определения иконки соцсети
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin': return '/icons/linkedin.svg';
      case 'facebook': return '/icons/facebook.svg';
      case 'twitter': return '/icons/twitter.svg';
      case 'instagram': return '/icons/instagram.svg';
      case 'tiktok': return '/icons/tiktok.svg';
      case 'youtube': return '/icons/youtube.svg';
      case 'spotify': return '/icons/spotify.svg';
      case 'dribbble': return '/icons/dribbble.svg';
      case 'pinterest': return '/icons/pinterest.svg';
      case 'figma': return '/icons/figma.svg';
      case 'discord': return '/icons/discord.svg';
      case 'reddit': return '/icons/reddit.svg';
      case 'whatsapp': return '/icons/whatsapp.svg';
      case 'telegram': return '/icons/telegram.svg';
      case 'messenger': return '/icons/messenger.svg';
      case 'email': return '/icons/email.svg';
      default: return '/icons/link.svg';
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      {/* Верхняя панель с кнопками действий */}
      <div className="flex justify-end space-x-3 mb-4">
        {isOwner && (
          <a 
            href="/dashboard/profile/edit" 
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Редактировать профиль"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </a>
        )}
        
        <button 
          onClick={() => setShowQRModal(true)} 
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          title="Поделиться"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>

        <button 
          onClick={() => setShowFollowModal(true)} 
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          title="Подписаться"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
      </div>

      {/* Профиль пользователя */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="relative px-6 pb-6">
          <div className="absolute -top-16 w-32 h-32 mx-auto">
            {profile.image ? (
              <Image 
                src={profile.image} 
                alt={profile.name}
                width={128}
                height={128}
                className="rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center text-3xl text-white shadow-lg">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="mt-20 text-center">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.role && (
              <p className="text-gray-600 font-medium">{profile.role}</p>
            )}
            {profile.company && (
              <p className="text-gray-500">{profile.company}</p>
            )}
            {profile.bio && (
              <p className="mt-4 text-gray-700">{profile.bio}</p>
            )}
          </div>
          
          {/* Социальные сети */}
          <div className="mt-6 grid grid-cols-4 gap-3">
            {socialLinks.map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Image 
                    src={getSocialIcon(link.platform)} 
                    alt={link.platform} 
                    width={24}
                    height={24}
                  />
                </div>
                <span className="mt-1 text-xs text-gray-600 truncate w-full text-center">
                  {link.platform}
                </span>
              </a>
            ))}
          </div>
          
          {/* Кнопка сохранения контакта */}
          <div className="mt-8">
            <button 
              onClick={downloadContact}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Сохранить контакт
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно с QR-кодом */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Поделиться профилем</h3>
              <button 
                onClick={() => setShowQRModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white p-2 rounded-lg shadow-inner border">
                <QRCodeSVG
                  value={pageUrl}
                  size={200}
                  bgColor={"#FFFFFF"}
                  fgColor={"#000000"}
                  level={"H"}
                  includeMargin={false}
                />
              </div>
              
              <p className="mt-4 text-sm text-gray-600 text-center">
                Отсканируйте QR-код или поделитесь ссылкой:
              </p>
              
              <div className="mt-2 w-full relative">
                <input 
                  type="text"
                  value={pageUrl}
                  readOnly
                  className="w-full p-2 pr-12 bg-gray-100 rounded-lg"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(pageUrl);
                  }}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                  title="Копировать"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подписки */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Подписаться на профиль</h3>
              <button 
                onClick={() => setShowFollowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {followSubmitted ? (
              <div className="text-center py-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mt-2 text-lg font-medium">Готово!</p>
                <p className="text-gray-600">Вы успешно подписались на обновления</p>
              </div>
            ) : (
              <form onSubmit={handleFollow}>
                <p className="text-sm text-gray-600 mb-4">
                  Получайте уведомления об обновлениях этого профиля на вашу электронную почту.
                </p>
                
                <div className="mb-4">
                  <label htmlFor="followEmail" className="block mb-2 text-sm font-medium">
                    Email для уведомлений
                  </label>
                  <input 
                    id="followEmail"
                    type="email"
                    required
                    value={followEmailInput}
                    onChange={(e) => setFollowEmailInput(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Введите ваш email"
                  />
                </div>
                
                <button 
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Подписаться
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicProfile; 