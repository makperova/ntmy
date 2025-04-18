const { MongoClient } = require('mongodb');
const { compare } = require('bcrypt');

// API-маршрут для аутентификации
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не поддерживается' });
  }

  try {
    const { email, password } = req.body;
    
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

    // Ищем пользователя по email
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Проверяем пароль
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Неверный пароль' });
    }

    // Создаем сессию
    const session = {
      userId: user._id,
      email: user.email,
      createdAt: new Date()
    };

    const result = await db.collection('sessions').insertOne(session);
    
    // Возвращаем данные сессии без пароля
    const { password: _, ...userWithoutPassword } = user;
    
    return res.status(200).json({ 
      success: true, 
      sessionId: result.insertedId.toString(),
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Ошибка при входе пользователя:', error);
    return res.status(500).json({ error: 'Не удалось выполнить вход. Пожалуйста, попробуйте позже.' });
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