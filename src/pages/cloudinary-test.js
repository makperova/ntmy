import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function CloudinaryTestPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [envInfo, setEnvInfo] = useState(null);
  const [preset, setPreset] = useState('ntmy_unsigned');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // При загрузке компонента проверяем переменные окружения
  useEffect(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    setEnvInfo({
      cloudName,
      timestamp: new Date().toISOString()
    });
  }, []);
  
  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setResult(null);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    // Проверяем наличие переменных окружения
    if (!cloudName) {
      setError('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME отсутствует. Проверьте .env и .env.local файлы.');
      setUploading(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Добавляем upload_preset только если он задан
      if (preset) {
        formData.append('upload_preset', preset);
      }
      
      console.log('Uploading to Cloudinary:', {
        cloudName,
        preset: preset || 'not set',
        hasFile: !!file,
        fileName: file.name,
        fileSize: file.size
      });
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log('Upload URL:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      // Полный текст ответа для отладки
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Пробуем распарсить JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error?.message || data.error || `HTTP error ${response.status}`);
      }
      
      console.log('Upload successful:', data);
      setResult(data);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setUploading(false);
    }
  }
  
  // Прямое тестирование API для проверки доступности
  async function testCloudinaryApi() {
    setUploading(true);
    setError(null);
    setResult(null);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    try {
      // Простой GET запрос для проверки доступности Cloudinary
      const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/sample`);
      
      console.log('API Test Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`API Test failed with status ${response.status}`);
      }
      
      setResult({
        message: 'Cloudinary API доступен',
        testedUrl: `https://res.cloudinary.com/${cloudName}/image/upload/sample`
      });
    } catch (err) {
      console.error('API Test failed:', err);
      setError(`Test failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Cloudinary Test</title>
      </Head>
      
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Cloudinary Upload Test</h1>
      
      {/* Информация о переменных окружения */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#F0F8FF', 
        borderRadius: '4px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Environment Info</h2>
        <p><strong>Cloud Name:</strong> {envInfo?.cloudName || 'Not set'}</p>
        <p><strong>Time:</strong> {envInfo?.timestamp}</p>
        <button 
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ 
            marginTop: '10px',
            backgroundColor: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '5px 10px',
            borderRadius: '4px'
          }}
        >
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
      </div>
      
      {showAdvanced && (
        <div style={{ 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#FFFBEA',
          borderRadius: '4px'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Advanced Options</h2>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>
              <strong>Upload Preset:</strong>
            </label>
            <input 
              type="text" 
              value={preset} 
              onChange={(e) => setPreset(e.target.value)}
              placeholder="Preset name (leave empty for no preset)"
              style={{ 
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px' 
              }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              Оставьте пустым, чтобы загрузить без preset (потребуется signed URL)
            </p>
          </div>
          
          <button
            onClick={testCloudinaryApi}
            disabled={uploading}
            style={{
              backgroundColor: '#4299E1',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Проверить доступность API
          </button>
        </div>
      )}
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload}
          disabled={uploading}
          style={{ marginBottom: '10px' }}
        />
        {uploading && <p>Uploading...</p>}
      </div>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#FEE2E2', 
          color: '#B91C1C',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {result && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ECFDF5', 
          color: '#065F46',
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p><strong>Success!</strong></p>
          {result.secure_url ? (
            <>
              <p>URL: {result.secure_url}</p>
              <img 
                src={result.secure_url} 
                alt="Uploaded" 
                style={{ maxWidth: '100%', marginTop: '10px' }} 
              />
            </>
          ) : (
            <p>{result.message || JSON.stringify(result)}</p>
          )}
        </div>
      )}
    </div>
  );
} 