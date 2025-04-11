import { v2 as cloudinary } from 'cloudinary';

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.warn('Warning: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined');
}

// Настройка Cloudinary (только на серверной стороне)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Экспортируем настроенный экземпляр
export default cloudinary;

// Функция для загрузки изображения на серверной стороне
export const uploadImage = async (file, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'image',
      ...options
    };

    if (Buffer.isBuffer(file)) {
      // Если файл передан как буфер
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Ошибка загрузки изображения'));
        }
        resolve(result);
      }).end(file);
    } else {
      // Если передан путь к файлу
      cloudinary.uploader.upload(file, uploadOptions, (error, result) => {
        if (error || !result) {
          return reject(error || new Error('Ошибка загрузки изображения'));
        }
        resolve(result);
      });
    }
  });
};

// Функция для получения URL загрузки на клиенте
export const getCloudinaryUploadUrl = () => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
};

// Хелпер для создания URL изображения с трансформациями
export const buildImageUrl = (publicId, options = {}) => {
  const { width, height, crop = 'fill', quality = 'auto' } = options;
  
  if (!publicId) return '';
  
  let transformations = [];
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (quality) transformations.push(`q_${quality}`);
  
  const transformationString = transformations.length 
    ? transformations.join(',') + '/' 
    : '';
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${publicId}`;
}; 