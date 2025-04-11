import formidable from 'formidable';
import { uploadImage } from '@/lib/cloudinary';
import fs from 'fs';

// Отключаем bodyParser для получения данных формы
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Парсим данные формы с помощью formidable
    const form = new formidable.IncomingForm();
    form.keepExtensions = true;
    
    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });
    
    // Проверяем наличие файла
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Получаем путь к временному файлу
    const filePath = file.filepath;
    
    // Определяем опции для загрузки
    let folder = 'uploads'; // Папка по умолчанию
    
    if (fields.folder) {
      folder = String(fields.folder);
    }
    
    // Загружаем файл в Cloudinary
    const result = await uploadImage(filePath, {
      folder,
      resource_type: 'auto', // Автоматически определить тип ресурса
    });
    
    // Удаляем временный файл
    fs.unlinkSync(filePath);
    
    // Возвращаем результат
    return res.status(200).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    
    return res.status(500).json({
      error: 'Failed to upload image',
      message: error.message,
    });
  }
} 