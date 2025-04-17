import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { saveCardToLocalStorage } from '../components/CardLocalStorage';

const CreateCardPage: NextPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    job_title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    linkedin_url: '',
    telegram_url: '',
    whatsapp_url: '',
    template: 'minimal',
    image_url: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Очищаем ошибку поля при изменении
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Обязательные поля
    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.username.trim()) newErrors.username = 'Username обязателен';
    
    // Валидация username (только буквы, цифры и подчеркивания)
    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username может содержать только буквы, цифры и подчеркивания';
    }
    
    // Валидация email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный email';
    }
    
    // Валидация URL
    const urlFields = ['linkedin_url', 'telegram_url', 'whatsapp_url', 'image_url'];
    urlFields.forEach(field => {
      if (formData[field] && !isValidUrl(formData[field])) {
        newErrors[field] = 'Некорректный URL';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Создаем объект карточки
      const cardData = {
        ...formData,
        id: `local_${Date.now()}`, // Временный ID для локальной карточки
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: `local_user_${Date.now()}` // Временный ID пользователя
      };
      
      // Сохраняем в localStorage
      const saved = saveCardToLocalStorage(cardData);
      
      if (saved) {
        setSuccessMessage('Карточка успешно создана!');
        
        // Пытаемся синхронизировать с сервером
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cards/username/${formData.username}`;
          const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cardData),
          });
          
          if (response.ok) {
            console.log('Card successfully synced with server');
          } else {
            console.log('Card saved locally only, sync failed');
          }
        } catch (err) {
          console.error('Error syncing with server:', err);
        }
        
        // Перенаправляем на страницу карточки
        setTimeout(() => {
          router.push(`/card/${formData.username}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error creating card:', error);
      setErrors({ submit: 'Произошла ошибка при создании карточки' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Создать цифровую визитку | NTMY</title>
        <meta name="description" content="Создайте свою цифровую визитку на NTMY" />
      </Head>

      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Создать цифровую визитку</h1>
            
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 text-green-800 rounded-md">
                {successMessage}
              </div>
            )}
            
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md">
                {errors.submit}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Основная информация */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Основная информация</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Имя *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="Иван Иванов"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="ivanivanov"
                      />
                      {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
                    </div>
                    <div>
                      <label htmlFor="job_title" className="block text-sm font-medium text-gray-700 mb-1">
                        Должность
                      </label>
                      <input
                        type="text"
                        id="job_title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Менеджер по продажам"
                      />
                    </div>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                        Компания
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ООО Компания"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Биография */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Биография
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Расскажите о себе..."
                  />
                </div>
                
                {/* Контактная информация */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Контактная информация</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="ivan@example.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Телефон
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+7 (900) 123-45-67"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Социальные сети */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Социальные сети</h2>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        id="linkedin_url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.linkedin_url ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="https://linkedin.com/in/username"
                      />
                      {errors.linkedin_url && <p className="mt-1 text-sm text-red-600">{errors.linkedin_url}</p>}
                    </div>
                    <div>
                      <label htmlFor="telegram_url" className="block text-sm font-medium text-gray-700 mb-1">
                        Telegram URL
                      </label>
                      <input
                        type="url"
                        id="telegram_url"
                        name="telegram_url"
                        value={formData.telegram_url}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.telegram_url ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="https://t.me/username"
                      />
                      {errors.telegram_url && <p className="mt-1 text-sm text-red-600">{errors.telegram_url}</p>}
                    </div>
                    <div>
                      <label htmlFor="whatsapp_url" className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp URL
                      </label>
                      <input
                        type="url"
                        id="whatsapp_url"
                        name="whatsapp_url"
                        value={formData.whatsapp_url}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.whatsapp_url ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="https://wa.me/79001234567"
                      />
                      {errors.whatsapp_url && <p className="mt-1 text-sm text-red-600">{errors.whatsapp_url}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Оформление */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-3">Оформление</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                        Шаблон
                      </label>
                      <select
                        id="template"
                        name="template"
                        value={formData.template}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="minimal">Минимальный</option>
                        <option value="gradient">Градиент</option>
                        <option value="dark">Темный</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                        URL аватара
                      </label>
                      <input
                        type="url"
                        id="image_url"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border ${errors.image_url ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {errors.image_url && <p className="mt-1 text-sm text-red-600">{errors.image_url}</p>}
                    </div>
                  </div>
                </div>
                
                {/* Кнопки управления */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Создание...' : 'Создать карточку'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </>
  );
};

export default CreateCardPage; 