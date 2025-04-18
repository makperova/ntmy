// API-маршрут для проверки состояния сервера
export default async function handler(req, res) {
  try {
    // Проверяем доступность MongoDB
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ntmy';
    const client = new MongoClient(uri, { 
      serverSelectionTimeoutMS: 2000, // Быстрый таймаут
      connectTimeoutMS: 2000 
    });
    
    try {
      // Пробуем подключиться
      await client.connect();
      await client.db().command({ ping: 1 });
      await client.close();
      
      // Если подключение успешно, возвращаем 200 OK
      res.status(200).json({ status: 'ok', mongodb: true });
    } catch (dbError) {
      console.error('MongoDB недоступна:', dbError);
      
      // Если MongoDB недоступна, но сервер работает, отправляем статус с предупреждением
      res.status(200).json({ status: 'ok', mongodb: false, warning: 'MongoDB недоступна' });
    }
  } catch (error) {
    console.error('Ошибка API сервера:', error);
    
    // Если произошла ошибка, отправляем 500
    res.status(500).json({ status: 'error', message: 'Ошибка сервера' });
  }
} 