import { Builder, builder } from '@builder.io/react';
import React from 'react';

// Ваш API ключ Builder.io
const BUILDER_API_KEY = '81bfbddd';

// Инициализация Builder
export function initBuilder() {
  if (typeof window === 'undefined') {
    return; // Skip on server side
  }
  
  builder.init(BUILDER_API_KEY);
  
  // Регистрируем базовые компоненты
  registerComponents();
  
  console.log('Builder.io initialized successfully');
}

// Регистрация компонентов
function registerComponents() {
  // Регистрация кнопки
  Builder.registerComponent(
    (props: { text: string; href: string; buttonStyle: string }) => {
      const { text, href, buttonStyle } = props;
      return React.createElement('a', {
        href: href || '#',
        className: `px-4 py-2 rounded-md ${
          buttonStyle === 'primary' 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        } transition-colors shadow-sm`
      }, text || 'Click me');
    },
    {
      name: 'CustomButton',
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

  // Регистрация контейнера для секций
  Builder.registerComponent(
    (props: { children: React.ReactNode }) => {
      return React.createElement('div', {
        className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'
      }, props.children);
    },
    {
      name: 'Container',
      defaultChildren: [
        {
          '@type': '@builder.io/sdk:Element',
          component: { name: 'Text', options: { text: 'Секция контента' } }
        }
      ],
      childRequirements: {
        message: "Вы можете добавлять любые блоки внутрь контейнера",
        query: {
          'component.name': { $ne: 'Container' } // Избегаем вложенных контейнеров
        }
      },
      inputs: []
    } as any
  );

  // Регистрация компонента заголовка
  Builder.registerComponent(
    (props: { title: string; subtitle?: string; alignment: string }) => {
      const alignClass = {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right'
      }[props.alignment] || 'text-left';
      
      return React.createElement('div', { className: `mb-8 ${alignClass}` },
        React.createElement('h2', { className: 'text-3xl font-bold text-gray-900 mb-2' }, props.title),
        props.subtitle && React.createElement('p', { className: 'text-lg text-gray-600' }, props.subtitle)
      );
    },
    {
      name: 'Heading',
      inputs: [
        { name: 'title', type: 'string', defaultValue: 'Заголовок секции' },
        { name: 'subtitle', type: 'string' },
        { 
          name: 'alignment', 
          type: 'string', 
          enum: ['left', 'center', 'right'], 
          defaultValue: 'left' 
        }
      ]
    }
  );
} 