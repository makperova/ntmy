import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

const CreateCard = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
  
  // Проверка авторизации при загрузке страницы
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    
    checkUser();
  }, [router]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };
  
  const handlePreview = () => {
    // Логика для предпросмотра карточки
    console.log('Preview card');
  };
  
  const handleSubmit = async () => {
    try {
      // Здесь будет логика сохранения в базу данных
      console.log('Saving card:', formData);
      // После успешного сохранения перенаправляем на Dashboard
      router.push('/admin/dashboard');
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Боковое меню */}
      <div className="w-16 bg-white shadow-md min-h-screen fixed left-0 top-0 flex flex-col items-center py-8">
        <div className="mb-12">
          <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold">
            N
          </div>
        </div>
        
        <div className="flex-1 flex flex-col items-center space-y-6">
          <Link href="/admin/dashboard" className="p-2 text-gray-400 hover:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
          
          <Link href="/admin/analytics" className="p-2 text-gray-400 hover:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
          
          <Link href="/admin/settings" className="p-2 text-gray-400 hover:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Основное содержимое */}
      <div className="ml-16 w-full">
        <Head>
          <title>Создать новую карточку | NTMY</title>
          <meta name="description" content="Create a new business card on NTMY" />
        </Head>
        
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-2">Создать новую карточку</h1>
          <h2 className="text-xl text-gray-600 mb-6">Создать новую карточку</h2>
          
          {/* Табы */}
          <div className="mb-8 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`pb-4 px-1 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => handleTabChange('profile')}
              >
                Профиль
              </button>
              <button
                className={`pb-4 px-1 ${activeTab === 'template' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => handleTabChange('template')}
              >
                Шаблон
              </button>
              <button
                className={`pb-4 px-1 ${activeTab === 'share' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'text-gray-500'}`}
                onClick={() => handleTabChange('share')}
              >
                Поделиться
              </button>
            </div>
          </div>
          
          {/* Содержимое вкладки Профиль */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Profile Information</h2>
              
              {/* Фото профиля */}
              <div className="mb-8">
                <h3 className="text-base mb-2">Profile Picture</h3>
                <p className="text-sm text-gray-500 mb-4">Upload a professional photo for your business card.</p>
                
                <div className="flex items-center">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  
                  <div>
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm">
                      Choose File
                    </button>
                    <button className="ml-2 text-red-500 px-2 py-1">
                      Remove
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Форма с данными профиля */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Product Designer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Design Studio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief description that appears on your card"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                  />
                  <p className="text-sm text-gray-500 mt-1">Brief description that appears on your card (max 150 characters)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      ntmy.pro/
                    </span>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">This will be your card's URL: ntmy.pro/{formData.username || '_______'}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                
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
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Social Media & Links</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-800 font-bold">in</span>
                    </div>
                    <input
                      type="text"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="LinkedIn URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <span className="text-green-800 font-bold">W</span>
                    </div>
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="WhatsApp URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-800 font-bold">T</span>
                    </div>
                    <input
                      type="text"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleInputChange}
                      placeholder="Telegram URL"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <button className="flex items-center text-gray-700 mt-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add more links
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Содержимое вкладки Шаблон */}
          {activeTab === 'template' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Шаблон / Template</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate === 'minimal' ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handleTemplateSelect('minimal')}
                >
                  <div className="h-40 bg-gray-100 rounded flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                  </div>
                  <p className="text-center font-medium">Минимальный</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate === 'gradient' ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handleTemplateSelect('gradient')}
                >
                  <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500 rounded flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-white rounded-full"></div>
                  </div>
                  <p className="text-center font-medium">Градиент</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedTemplate === 'dark' ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  onClick={() => handleTemplateSelect('dark')}
                >
                  <div className="h-40 bg-gray-900 rounded flex items-center justify-center mb-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  </div>
                  <p className="text-center font-medium">Тёмный</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Содержимое вкладки Поделиться */}
          {activeTab === 'share' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Share Your Card</h2>
              <p className="text-gray-600 mb-4">Your card is not created yet. Create a card first to get sharing options.</p>
            </div>
          )}
          
          {/* Нижняя панель с кнопками */}
          <div className="mt-10 flex justify-end space-x-4">
            <button 
              onClick={handlePreview}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Предпросмотр карточки
            </button>
            
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Создать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCard; 