import React from 'react';
import { FiX, FiExternalLink, FiShare2 } from 'react-icons/fi';

interface CardPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    name: string;
    jobTitle?: string;
    company?: string;
    bio?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    telegram?: string;
    whatsapp?: string;
    username?: string;
  };
  template: string;
  previewImage?: string | null;
  onShare?: () => void;
}

const CardPreview: React.FC<CardPreviewProps> = ({ 
  isOpen, 
  onClose, 
  formData, 
  template, 
  previewImage,
  onShare
}) => {
  if (!isOpen) return null;

  // Определение стилей в зависимости от выбранного шаблона
  const getTemplateStyles = () => {
    switch (template) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Предпросмотр карточки</h2>
          <div className="flex items-center space-x-2">
            {formData.username && (
              <button
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Открыть публичную страницу"
                onClick={() => window.open(`/${formData.username}`, '_blank')}
              >
                <FiExternalLink className="w-5 h-5" />
              </button>
            )}
            
            {onShare && (
              <button
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                title="Поделиться"
                onClick={onShare}
              >
                <FiShare2 className="w-5 h-5" />
              </button>
            )}
            
            <button
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              onClick={onClose}
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Мобильный просмотр */}
            <div className="mx-auto">
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
                        {previewImage ? (
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${template === 'minimal' ? 'text-gray-400' : 'text-white/60'} text-4xl`}>
                            {formData.name ? formData.name.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Profile Info */}
                    <div className="text-center space-y-2">
                      <h1 className={`text-2xl font-bold ${styles.nameText}`}>
                        {formData.name || 'Your Name'}
                      </h1>
                      {formData.jobTitle && (
                        <p className={styles.subtitleText}>{formData.jobTitle}</p>
                      )}
                      {formData.company && (
                        <p className={styles.subtitleText}>{formData.company}</p>
                      )}
                    </div>

                    {/* Bio */}
                    {formData.bio && (
                      <p className={`${styles.bioText} text-center`}>{formData.bio}</p>
                    )}

                    {/* Contact Links */}
                    <div className="space-y-3">
                      {formData.email && (
                        <a 
                          href={`mailto:${formData.email}`} 
                          className={`flex items-center p-3 ${styles.contactBg} rounded-lg`}
                        >
                          <span className={styles.contactText}>Email</span>
                          <span className={`ml-auto ${styles.contactValueText}`}>{formData.email}</span>
                        </a>
                      )}
                      {formData.phone && (
                        <a 
                          href={`tel:${formData.phone}`} 
                          className={`flex items-center p-3 ${styles.contactBg} rounded-lg`}
                        >
                          <span className={styles.contactText}>Phone</span>
                          <span className={`ml-auto ${styles.contactValueText}`}>{formData.phone}</span>
                        </a>
                      )}
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center space-x-4">
                      {formData.linkedin && (
                        <a 
                          href={formData.linkedin} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`w-10 h-10 ${styles.socialBg} rounded-full flex items-center justify-center`}
                        >
                          <span className={`${styles.socialText} font-bold`}>in</span>
                        </a>
                      )}
                      {formData.telegram && (
                        <a 
                          href={formData.telegram} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`w-10 h-10 ${styles.socialBg} rounded-full flex items-center justify-center`}
                        >
                          <span className={`${styles.socialText} font-bold`}>T</span>
                        </a>
                      )}
                      {formData.whatsapp && (
                        <a 
                          href={formData.whatsapp} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`w-10 h-10 ${template === 'minimal' ? 'bg-green-100' : styles.socialBg} rounded-full flex items-center justify-center`}
                        >
                          <span className={`${template === 'minimal' ? 'text-green-800' : styles.socialText} font-bold`}>W</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Информация и QR-код */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Информация о карточке</h3>
                
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Имя:</dt>
                    <dd className="text-gray-900 font-medium">{formData.name || 'Не указано'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Публичная ссылка:</dt>
                    <dd className="text-blue-600 font-medium">
                      {formData.username ? `ntmy.com/${formData.username}` : 'Не создана'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Шаблон:</dt>
                    <dd className="text-gray-900 font-medium capitalize">{template}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Контакты:</dt>
                    <dd className="text-gray-900 font-medium">
                      {[
                        formData.email ? 'Email' : null,
                        formData.phone ? 'Телефон' : null,
                        formData.linkedin ? 'LinkedIn' : null,
                        formData.telegram ? 'Telegram' : null,
                        formData.whatsapp ? 'WhatsApp' : null
                      ].filter(Boolean).join(', ') || 'Не указаны'}
                    </dd>
                  </div>
                </dl>
              </div>

              {formData.username && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">QR-код</h3>
                  
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-40 h-40 bg-white p-2 rounded-lg shadow-sm">
                      {/* Здесь будет отображаться QR-код */}
                      <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-sm text-center px-4">QR-код будет доступен после сохранения</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      disabled
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Скачать QR-код
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardPreview; 