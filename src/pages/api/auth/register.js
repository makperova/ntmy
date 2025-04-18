const { MongoClient } = require('mongodb');
const { hash } = require('bcrypt');

// API-маршрут для регистрации
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const { email, password, ...userData } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
    }

    // Подключение к MongoDB
    let client;
    try {
      client = await getMongoClient();
    } catch (dbError) {
      console.error('Ошибка подключения к MongoDB:', dbError);
      return res.status(500).json({ error: 'Не удалось подключиться к базе данных. Попробуйте позже.' });
    }

    const db = client.db();
    const users = db.collection('users');

    // Проверяем, существует ли пользователь
    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await hash(password, 10);

    // Создаем пользователя
    const user = {
      email,
      password: hashedPassword,
      createdAt: new Date(),
      ...userData
    };

    const result = await users.insertOne(user);
    
    // Возвращаем созданного пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(201).json({ 
      success: true, 
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    return res.status(500).json({ error: 'Не удалось зарегистрировать пользователя' });
  }
}

// Функция для получения подключения к MongoDB
async function getMongoClient() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ntmy';
  const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000, // Таймаут в 5 секунд для выбора сервера
    connectTimeoutMS: 10000 // Таймаут в 10 секунд для подключения
  });
  return await client.connect();
} 