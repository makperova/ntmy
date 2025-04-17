import { connectToDatabase } from '../../../lib/mongodb';
import Card from '../../../models/Card';

/**
 * API для работы с карточками
 * GET - получение списка карточек
 * POST - создание новой карточки
 */
export default async function handler(req, res) {
  // Подключаемся к базе данных
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      error: 'Failed to connect to database',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Получение User ID из запроса (предполагается, что он передается в заголовке или параметрах)
  // В реальной системе здесь будет аутентификация
  const userId = req.headers['user-id'] || req.query.userId;

  // Обработка GET-запроса (получение карточек)
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      
      // Если указан username, ищем конкретную карточку
      if (username) {
        const card = await Card.findOne({ username });
        
        if (!card) {
          return res.status(404).json({ error: `Card with username "${username}" not found` });
        }
        
        return res.status(200).json(card);
      }
      
      // Если указан userId, возвращаем карточки пользователя
      if (userId) {
        const cards = await Card.find({ user_id: userId });
        return res.status(200).json(cards);
      }
      
      // Если не указаны фильтры, возвращаем все карточки (для админов)
      const cards = await Card.find({});
      return res.status(200).json(cards);
    } catch (error) {
      console.error('Error fetching cards:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch cards',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Обработка POST-запроса (создание карточки)
  if (req.method === 'POST') {
    try {
      // Проверяем наличие userId
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }
      
      // Получаем данные из тела запроса
      const cardData = req.body;
      
      // Проверяем обязательные поля
      if (!cardData.name || !cardData.username) {
        return res.status(400).json({ error: 'Name and username are required' });
      }
      
      // Проверяем уникальность username
      const existingCard = await Card.findOne({ username: cardData.username });
      if (existingCard) {
        return res.status(409).json({ error: `Username "${cardData.username}" already exists` });
      }
      
      // Добавляем user_id и создаем карточку
      const newCard = new Card({
        ...cardData,
        user_id: userId
      });
      
      // Сохраняем карточку
      await newCard.save();
      
      return res.status(201).json(newCard);
    } catch (error) {
      console.error('Error creating card:', error);
      return res.status(500).json({ 
        error: 'Failed to create card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Метод не поддерживается
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
} 