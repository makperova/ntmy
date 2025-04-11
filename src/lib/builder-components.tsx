import { Builder } from '@builder.io/react';
import React from 'react';

// Регистрация стандартных компонентов React
export function registerBuilderComponents() {
  // Зарегистрируем базовые компоненты, чтобы Builder мог их использовать
  Builder.registerComponent(
    ({ text, href, buttonStyle }) => (
      <a 
        href={href} 
        className={`px-4 py-2 rounded-md ${
          buttonStyle === 'primary' 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        } transition-colors shadow-sm`}
      >
        {text}
      </a>
    ),
    {
      name: 'Custom Button',
      inputs: [
        { name: 'text', type: 'string', defaultValue: 'Click me' },
        { name: 'href', type: 'string', defaultValue: '#' },
        { 
          name: 'buttonStyle', 
          type: 'string', 
          enum: ['primary', 'secondary'], 
          defaultValue: 'primary' 
        }
      ],
    }
  );

  // Регистрация карточки
  Builder.registerComponent(
    ({ title, description, buttonText, buttonLink }) => (
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900">{title}</h2>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        {buttonText && (
          <a 
            href={buttonLink || '#'} 
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            {buttonText}
          </a>
        )}
      </div>
    ),
    {
      name: 'Info Card',
      inputs: [
        { name: 'title', type: 'string', defaultValue: 'Card Title' },
        { name: 'description', type: 'string', defaultValue: 'Card description goes here' },
        { name: 'buttonText', type: 'string' },
        { name: 'buttonLink', type: 'string' }
      ],
    }
  );

  // Регистрация пользовательского профиля
  Builder.registerComponent(
    ({ name, role, company, bio, image }) => (
      <div className="rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-shadow bg-white p-6">
        <div className="flex items-center mb-4">
          {image ? (
            <img 
              src={image} 
              alt={name}
              className="w-16 h-16 rounded-full mr-4 object-cover" 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-200 mr-4 flex items-center justify-center text-xl font-bold text-gray-500">
              {name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
            {role && <p className="text-gray-600">{role} {company ? `в ${company}` : ""}</p>}
          </div>
        </div>
        {bio && <p className="text-gray-700">{bio}</p>}
      </div>
    ),
    {
      name: 'Profile Card',
      inputs: [
        { name: 'name', type: 'string', defaultValue: 'Имя пользователя' },
        { name: 'role', type: 'string' },
        { name: 'company', type: 'string' },
        { name: 'bio', type: 'string' },
        { name: 'image', type: 'string' }
      ],
    }
  );

  // Регистрация компонентов обработки ошибок
  Builder.registerComponent(
    ({ message }) => (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <p>{message || 'Произошла ошибка при загрузке содержимого'}</p>
      </div>
    ),
    {
      name: 'Error',
      inputs: [
        { name: 'message', type: 'string', defaultValue: 'Произошла ошибка при загрузке содержимого' }
      ],
      noWrap: true,
    }
  );
}
 