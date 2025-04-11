import React, { useState, useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Profile, SocialLink, Template } from '../../types/profile';

interface ProfileEditorProps {
  profile?: Profile;
  socialLinks?: SocialLink[];
  templates: Template[];
  onSave: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

interface ProfileFormData {
  name: string;
  role: string;
  company: string;
  bio: string;
  phone: string;
  email: string;
  templateId: string;
  isPublished: boolean;
  image?: File | string;
  socialLinks: {
    id?: string;
    platform: string;
    url: string;
    isActive: boolean;
  }[];
}

// Доступные платформы для социальных сетей
const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'twitter', name: 'Twitter / X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'figma', name: 'Figma' },
  { id: 'discord', name: 'Discord' },
  { id: 'reddit', name: 'Reddit' },
  { id: 'whatsapp', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'messenger', name: 'Messenger' },
  { id: 'email', name: 'Email' },
];

const ProfileEditor: React.FC<ProfileEditorProps> = ({ 
  profile, 
  socialLinks = [], 
  templates,
  onSave,
  isLoading = false
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ProfileFormData>({
    defaultValues: {
      name: profile?.name || '',
      role: profile?.role || '',
      company: profile?.company || '',
      bio: profile?.bio || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      templateId: profile?.templateId || (templates[0]?.id || ''),
      isPublished: profile?.isPublished || false,
      image: profile?.image || '',
      socialLinks: socialLinks.length > 0 
        ? socialLinks.map(link => ({
            id: link.id,
            platform: link.platform,
            url: link.url,
            isActive: link.isActive
          })) 
        : [{ platform: 'linkedin', url: '', isActive: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'socialLinks'
  });

  // Отслеживаем изменение изображения
  const watchImage = watch('image');
  
  // Обновляем превью изображения при изменении
  useEffect(() => {
    if (watchImage && watchImage instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(watchImage);
    } else if (typeof watchImage === 'string' && watchImage) {
      setPreviewImage(watchImage);
    }
  }, [watchImage]);

  // Обработчик отправки формы
  const onSubmit = async (data: ProfileFormData) => {
    await onSave(data);
  };

  // Обработчик изменения изображения
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Здесь можно добавить проверку размера и типа файла
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Редактирование профиля</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Фото профиля
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {previewImage ? (
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors"
                >
                  Загрузить фото
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Имя *
              </label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Имя обязательно' })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div className="mb-4">
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Должность
              </label>
              <input
                id="role"
                type="text"
                {...register('role')}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="company" className="block text-sm font-medium mb-2">
                Компания
              </label>
              <input
                id="company"
                type="text"
                {...register('company')}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <div className="mb-4">
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                О себе
              </label>
              <textarea
                id="bio"
                rows={4}
                {...register('bio')}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Телефон
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email для контакта
              </label>
              <input
                id="email"
                type="email"
                {...register('email', {
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: 'Неверный формат email'
                  }
                })}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Выбор шаблона */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Выбор шаблона</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="relative">
                <input
                  type="radio"
                  id={`template-${template.id}`}
                  value={template.id}
                  {...register('templateId')}
                  className="sr-only"
                />
                <label
                  htmlFor={`template-${template.id}`}
                  className="cursor-pointer block rounded-lg overflow-hidden border-2 hover:border-blue-400 transition-colors"
                >
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500 text-sm">{template.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-white">
                    <p className="text-sm font-medium">{template.name}</p>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Социальные сети */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-4">Социальные сети и ссылки</h2>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name={`socialLinks.${index}.platform`}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {SOCIAL_PLATFORMS.map(platform => (
                        <option key={platform.id} value={platform.id}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                
                <input
                  type="text"
                  {...register(`socialLinks.${index}.url` as const, {
                    required: 'URL обязателен'
                  })}
                  placeholder="https://..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                
                <Controller
                  control={control}
                  name={`socialLinks.${index}.isActive`}
                  render={({ field: { value, onChange } }) => (
                    <label className="inline-flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={onChange}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Активно</span>
                    </label>
                  )}
                />
                
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-red-500 hover:text-red-700 rounded-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => append({ platform: 'linkedin', url: '', isActive: true })}
              className="mt-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Добавить ссылку</span>
            </button>
          </div>
        </div>

        {/* Публикация */}
        <div className="mt-6 flex items-center">
          <Controller
            control={control}
            name="isPublished"
            render={({ field: { value, onChange } }) => (
              <label className="inline-flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={onChange}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">Опубликовать профиль</span>
              </label>
            )}
          />
        </div>

        {/* Кнопки действий */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 border text-gray-700 rounded-md hover:bg-gray-50"
            onClick={() => window.history.back()}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEditor; 