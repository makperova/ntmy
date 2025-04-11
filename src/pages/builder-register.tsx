import React, { useEffect } from 'react';
import { Builder } from '@builder.io/react';
import Head from 'next/head';

// Определяем компонент ошибки для Builder
const ErrorUI = ({ error }: { error: Error }) => {
  return (
    <div style={{ 
      padding: '20px', 
      margin: '20px auto', 
      maxWidth: '600px',
      background: '#ffebee', 
      border: '1px solid #ef9a9a', 
      borderRadius: '6px',
      color: '#c62828'
    }}>
      <h2 style={{ margin: '0 0 10px' }}>Ошибка</h2>
      <div>{error.message || 'Произошла ошибка при загрузке компонента'}</div>
    </div>
  );
};

const BuilderRegisterPage: React.FC = () => {
  useEffect(() => {
    // Регистрируем компонент ошибки
    try {
      // @ts-ignore
      Builder.components = Builder.components || {};
      // @ts-ignore
      Builder.components.error = ErrorUI;
      
      // Регистрируем другие базовые компоненты
      Builder.registerComponent(
        (props: { text: string }) => (
          <div style={{ padding: '10px' }}>{props.text}</div>
        ),
        {
          name: 'SimpleText',
          inputs: [{ name: 'text', type: 'string', defaultValue: 'Текст компонента' }],
        }
      );
      
      console.log('Builder components registered successfully');
    } catch (error) {
      console.error('Error registering Builder components:', error);
    }
  }, []);

  return (
    <div className="p-8">
      <Head>
        <title>Builder.io Регистрация | NTMY</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-4">Регистрация компонентов Builder.io</h1>
      <p className="mb-4">Компоненты Builder.io зарегистрированы.</p>
      <p>
        Теперь вы можете перейти к{' '}
        <a 
          href="/builder-preview" 
          className="text-blue-600 hover:underline"
        >
          странице предпросмотра
        </a>
        {' '}или в ваш{' '}
        <a 
          href="/admin/dashboard" 
          className="text-blue-600 hover:underline"
        >
          личный кабинет
        </a>
        .
      </p>
    </div>
  );
};

export default BuilderRegisterPage; 