import { v2 as cloudinary } from 'cloudinary';

export default async function handler(req, res) {
  try {
    // Настраиваем Cloudinary
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });

    // Тестируем доступ к API
    try {
      // Получаем ресурсы из нашего аккаунта (до 10 штук)
      // Эта операция позволит проверить, что мы можем не только загружать, но и читать данные
      const result = await cloudinary.api.resources({
        type: 'upload',
        max_results: 10
      });

      return res.status(200).json({
        success: true,
        message: 'API доступен',
        apiKey: process.env.CLOUDINARY_API_KEY?.substring(0, 4) + '...',
        cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        total_count: result.resources.length,
        resources: result.resources.map(r => ({
          url: r.secure_url,
          format: r.format,
          created_at: r.created_at
        }))
      });
    } catch (apiError) {
      console.error('API error:', apiError);
      return res.status(500).json({
        success: false,
        message: 'Ошибка API Cloudinary',
        error: apiError.message,
        statusCode: apiError.http_code || apiError.statusCode
      });
    }
  } catch (error) {
    console.error('General error:', error);
    return res.status(500).json({
      success: false,
      message: 'Общая ошибка при проверке Cloudinary',
      error: error.message
    });
  }
} 