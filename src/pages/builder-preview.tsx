import React, { useState } from 'react';
import Head from 'next/head';
import BuilderContent from '../components/BuilderContent';

const BuilderPreviewPage: React.FC = () => {
  const [model, setModel] = useState('dashboard');

  const models = [
    { id: 'dashboard', name: 'Личный кабинет' },
    { id: 'profiles', name: 'Профили' },
    { id: 'cards', name: 'Визитки' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Предпросмотр Builder.io | NTMY</title>
        <meta name="description" content="Предпросмотр компонентов Builder.io" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Предпросмотр Builder.io компонентов</h1>
          
          <div className="flex space-x-4">
            {models.map((modelOption) => (
              <button
                key={modelOption.id}
                onClick={() => setModel(modelOption.id)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  model === modelOption.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {modelOption.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="mb-4 text-sm text-gray-500">
            Отображается модель: <span className="font-medium">{model}</span>
          </div>
          
          <BuilderContent modelName={model} />
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500 mb-2">Если контент не отображается:</div>
            <ul className="list-disc pl-5 text-sm text-gray-500">
              <li>Убедитесь, что модель с таким именем существует в Builder.io</li>
              <li>Проверьте, что API ключ Builder.io настроен правильно</li>
              <li>Проверьте, что контент опубликован</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderPreviewPage; 