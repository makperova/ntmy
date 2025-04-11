import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function CloudinarySignedPage() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [signature, setSignature] = useState(null);
  
  // Получаем подпись при загрузке страницы
  useEffect(() => {
    async function getSignature() {
      try {
        const response = await fetch('/api/cloudinary-signature');
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to get signature');
        }
        
        setSignature(data);
      } catch (err) {
        console.error('Error getting signature:', err);
        setError('Failed to get signature: ' + err.message);
      }
    }
    
    getSignature();
  }, []);
  
  async function handleUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Проверяем, что у нас есть подпись
    if (!signature) {
      setError('No signature available. Please wait or refresh the page.');
      return;
    }
    
    setUploading(true);
    setError(null);
    setResult(null);
    
    try {
      // Создаем FormData с подписанными параметрами
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signature.apiKey);
      formData.append('timestamp', signature.timestamp);
      formData.append('signature', signature.signature);
      // Можно добавить другие параметры, если они были включены в подпись
      // например, folder
      
      console.log('Uploading to Cloudinary with signed URL', {
        cloudName: signature.cloudName,
        timestamp: signature.timestamp
      });
      
      // Выполняем запрос на загрузку
      const response = await fetch(signature.uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      console.log('Response status:', response.status, response.statusText);
      
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Парсим ответ
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP error ${response.status}`);
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
  
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Head>
        <title>Cloudinary Signed Upload Test</title>
      </Head>
      
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Cloudinary Signed Upload Test</h1>
      
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#F0F8FF', 
        borderRadius: '4px' 
      }}>
        <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Signature Info</h2>
        {signature ? (
          <>
            <p><strong>Cloud Name:</strong> {signature.cloudName}</p>
            <p><strong>Timestamp:</strong> {signature.timestamp}</p>
            <p><strong>Status:</strong> <span style={{ color: 'green' }}>Signature Ready</span></p>
          </>
        ) : (
          <p>Loading signature...</p>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleUpload}
          disabled={uploading || !signature}
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
          <p><strong>Upload Successful!</strong></p>
          <p>URL: {result.secure_url}</p>
          <img 
            src={result.secure_url} 
            alt="Uploaded" 
            style={{ maxWidth: '100%', marginTop: '10px' }} 
          />
        </div>
      )}
      
      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p>
          <strong>Как это работает:</strong> Эта страница использует подписанные URL для загрузки 
          файлов в Cloudinary без использования Upload Preset. Подпись генерируется на сервере 
          с использованием API Secret.
        </p>
      </div>
    </div>
  );
} 