import React, { useEffect, useState } from 'react';
import { BuilderComponent, builder } from '@builder.io/react';

// Инициализация Builder с вашим API ключом
builder.init('81bfbddd');

interface BuilderContentProps {
  modelName: string;
  contentId?: string; // Опциональный ID контента
}

const BuilderContent: React.FC<BuilderContentProps> = ({ modelName, contentId }) => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        // Если указан contentId, ищем конкретный контент
        if (contentId) {
          // @ts-ignore - библиотека имеет несоответствие в типах
          const content = await builder.get(modelName, { query: { id: contentId } }).promise();
          setContent(content);
        } else {
          // Иначе получаем первый опубликованный контент
          const content = await builder.get(modelName).promise();
          setContent(content);
        }
      } catch (error) {
        console.error('Error fetching Builder content:', error);
      }
    }
    fetchContent();
  }, [modelName, contentId]);

  return (
    <>
      <div className="builder-content">
        <BuilderComponent 
          model={modelName} 
          content={content}
          options={{ includeRefs: true }} 
        />
      </div>
      <div className="builder-fallback max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Запасной UI отображается, когда контент Builder.io не загружен */}
      </div>
    </>
  );
};

export default BuilderContent; 