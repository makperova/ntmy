import { useState, useCallback } from 'react';

/**
 * Хук для загрузки изображений в Cloudinary
 * @param {Object} options - Опции загрузки
 * @param {string} options.uploadPreset - Пресет загрузки (по умолчанию 'ntmy_unsigned')
 * @param {string} options.folder - Папка для загрузки (по умолчанию '')
 * @param {Function} options.onProgress - Колбэк для отслеживания прогресса загрузки
 * @returns {Object} - Объект с функциями и состоянием загрузки
 */
export function useCloudinaryUpload(options = {}) {
  const { uploadPreset = 'ntmy_unsigned', folder = '' } = options;
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  
  /**
   * Загрузка файла напрямую в Cloudinary
   * @param {File} file - Файл для загрузки
   * @returns {Promise<Object>} - Результат загрузки
   */
  const uploadToCloudinaryDirect = useCallback(async (file) => {
    if (!file) {
      return null;
    }
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      
      if (folder) {
        formData.append('folder', folder);
      }
      
      // Эмулируем прогресс загрузки (API не предоставляет его напрямую)
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      setProgress(100);
      const data = await response.json();
      
      return data;
    } catch (err) {
      setError(err.message || 'Unknown error during upload');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [uploadPreset, folder]);
  
  /**
   * Загрузка файла через наш собственный API
   * @param {File} file - Файл для загрузки
   * @param {string} customFolder - Опциональная кастомная папка
   * @returns {Promise<Object>} - Результат загрузки
   */
  const uploadViaServerApi = useCallback(async (file, customFolder) => {
    if (!file) {
      return null;
    }
    
    setIsUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (customFolder || folder) {
        formData.append('folder', customFolder || folder);
      }
      
      // Эмуляция прогресса загрузки
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error ${response.status}`);
      }
      
      setProgress(100);
      return await response.json();
    } catch (err) {
      setError(err.message || 'Unknown error during upload');
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [folder]);
  
  /**
   * Преобразование URL изображения Cloudinary для получения миниатюры
   * @param {string} url - URL изображения
   * @param {Object} options - Опции трансформации
   * @returns {string} - URL миниатюры
   */
  const getThumbnail = useCallback((url, options = {}) => {
    if (!url || !url.includes('cloudinary.com')) {
      return url;
    }
    
    const { width = 300, height = 300, crop = 'fill' } = options;
    
    // Разбираем URL cloudinary
    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;
    
    return `${parts[0]}/upload/c_${crop},w_${width},h_${height}/${parts[1]}`;
  }, []);
  
  return {
    uploadToCloudinaryDirect,
    uploadViaServerApi,
    getThumbnail,
    isUploading,
    progress,
    error,
    clearError: () => setError(null),
  };
} 