import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function CloudinaryDashboard() {
  const [uploadResult, setUploadResult] = useState(null);
  const [signedResult, setSignedResult] = useState(null);
  const [apiTestResult, setApiTestResult] = useState(null);
  const [resourcesResult, setResourcesResult] = useState(null);
  const [isLoading, setIsLoading] = useState({
    upload: false,
    signed: false,
    apiTest: false,
    resources: false
  });
  const [error, setError] = useState({});

  // Тестирование прямой загрузки с пресетом
  async function testDirectUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading({...isLoading, upload: true});
    setError({...error, upload: null});
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ntmy_unsigned');
      
      console.log('Uploading with preset:', {
        cloudName,
        preset: 'ntmy_unsigned',
        filename: file.name
      });
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error ${response.status}`);
      }
      
      setUploadResult(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError({...error, upload: err.message});
    } finally {
      setIsLoading({...isLoading, upload: false});
    }
  }

  // Тестирование загрузки с подписанным URL
  async function testSignedUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading({...isLoading, signed: true});
    setError({...error, signed: null});
    
    try {
      // Получаем подпись
      const signatureResponse = await fetch('/api/cloudinary-signature');
      const signatureData = await signatureResponse.json();
      
      if (!signatureData.success) {
        throw new Error('Не удалось получить подпись');
      }
      
      // Загружаем файл с подписью
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signatureData.apiKey);
      formData.append('timestamp', signatureData.timestamp);
      formData.append('signature', signatureData.signature);
      
      console.log('Uploading with signature:', {
        cloudName: signatureData.cloudName,
        timestamp: signatureData.timestamp
      });
      
      const uploadResponse = await fetch(signatureData.uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error?.message || `HTTP error ${uploadResponse.status}`);
      }
      
      setSignedResult(uploadData);
    } catch (err) {
      console.error('Signed upload error:', err);
      setError({...error, signed: err.message});
    } finally {
      setIsLoading({...isLoading, signed: false});
    }
  }

  // Проверка подключения к API
  async function testApiConnection() {
    setIsLoading({...isLoading, apiTest: true});
    setError({...error, apiTest: null});
    
    try {
      const response = await fetch('/api/test-cloudinary-direct');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error ${response.status}`);
      }
      
      setApiTestResult(data);
    } catch (err) {
      console.error('API test error:', err);
      setError({...error, apiTest: err.message});
    } finally {
      setIsLoading({...isLoading, apiTest: false});
    }
  }

  // Загрузка списка ресурсов (при монтировании компонента)
  useEffect(() => {
    async function loadResources() {
      setIsLoading({...isLoading, resources: true});
      
      try {
        const response = await fetch('/api/test-cloudinary-direct');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || `HTTP error ${response.status}`);
        }
        
        setResourcesResult(data);
      } catch (err) {
        console.error('Resources loading error:', err);
        setError({...error, resources: err.message});
      } finally {
        setIsLoading({...isLoading, resources: false});
      }
    }
    
    loadResources();
  }, []);

  // Функция для формирования карточки результата
  function ResultCard({ title, result, loading, errorMessage, children }) {
    return (
      <div className="border rounded-lg p-4 my-4">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        {children}
        
        {loading && (
          <div className="my-2 py-2 px-4 bg-blue-50 text-blue-700 rounded">
            Загрузка...
          </div>
        )}
        
        {errorMessage && (
          <div className="my-2 py-2 px-4 bg-red-50 text-red-700 rounded">
            <strong>Ошибка:</strong> {errorMessage}
          </div>
        )}
        
        {result && (
          <div className="my-2">
            {result.secure_url && (
              <div>
                <p className="mb-2"><strong>URL:</strong> {result.secure_url}</p>
                <img 
                  src={result.secure_url} 
                  alt="Uploaded" 
                  className="w-full max-w-xs rounded" 
                />
              </div>
            )}
            
            {!result.secure_url && (
              <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Head>
        <title>Cloudinary Dashboard</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-6">Cloudinary Тестовая Панель</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Статус API */}
        <ResultCard
          title="Статус API"
          result={apiTestResult}
          loading={isLoading.apiTest}
          errorMessage={error.apiTest}
        >
          <button
            onClick={testApiConnection}
            disabled={isLoading.apiTest}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Проверить API
          </button>
        </ResultCard>
        
        {/* Ресурсы */}
        <ResultCard
          title="Ресурсы в Cloudinary"
          result={resourcesResult}
          loading={isLoading.resources}
          errorMessage={error.resources}
        >
          <p className="mb-2">
            {resourcesResult 
              ? `Найдено ${resourcesResult.total_count} ресурсов`
              : 'Загрузка ресурсов...'}
          </p>
        </ResultCard>
        
        {/* Загрузка с пресетом */}
        <ResultCard
          title="Загрузка с Upload Preset"
          result={uploadResult}
          loading={isLoading.upload}
          errorMessage={error.upload}
        >
          <input
            type="file"
            onChange={testDirectUpload}
            disabled={isLoading.upload}
            className="mb-2"
          />
          <p className="text-xs text-gray-500 mb-2">
            Использует preset: ntmy_unsigned
          </p>
        </ResultCard>
        
        {/* Загрузка с подписью */}
        <ResultCard
          title="Загрузка с Подписью"
          result={signedResult}
          loading={isLoading.signed}
          errorMessage={error.signed}
        >
          <input
            type="file"
            onChange={testSignedUpload}
            disabled={isLoading.signed}
            className="mb-2"
          />
          <p className="text-xs text-gray-500 mb-2">
            Генерирует подпись через /api/cloudinary-signature
          </p>
        </ResultCard>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Информация о конфигурации</h2>
        <p><strong>Cloud name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}</p>
        <p><strong>Порт сервера:</strong> {typeof window !== 'undefined' ? window.location.port : 'unknown'}</p>
      </div>
    </div>
  );
} 