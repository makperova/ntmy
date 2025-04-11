import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';

export default async function handler(req, res) {
  try {
    // Получаем и проверяем переменные окружения
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials', { 
        cloudName: !!cloudName, 
        apiKey: !!apiKey, 
        apiSecret: !!apiSecret 
      });
      return res.status(500).json({ 
        success: false, 
        message: 'Missing Cloudinary credentials' 
      });
    }
    
    // Генерируем метку времени для подписи
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Создаем параметры для подписи
    // Можно добавить дополнительные параметры, например, folder
    const params = {
      timestamp: timestamp,
      // Дополнительные параметры можно добавить здесь
      // folder: 'my_folder'
    };
    
    // Создаем строку для подписи
    const signature_string = Object.entries(params)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('&') + apiSecret;
    
    // Вычисляем подпись
    const signature = crypto
      .createHash('sha1')
      .update(signature_string)
      .digest('hex');
    
    // Возвращаем данные для загрузки
    return res.status(200).json({
      success: true,
      cloudName,
      apiKey,
      timestamp,
      signature,
      // URL для загрузки
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating signature',
      error: error.message
    });
  }
} 