import { connectToDatabase } from '../../../lib/mongodb';
import Card from '../../../models/Card';
import mongoose from 'mongoose';

/**
 * API для работы с конкретной карточкой по ID
 * GET - получение карточки
 * PUT - обновление карточки
 * DELETE - удаление карточки
 */
export default async function handler(req, res) {
  // Получаем ID карточки из URL
  const { id } = req.query;
  
  // Проверяем корректность ID
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

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

  // Обработка GET-запроса (получение карточки)
  if (req.method === 'GET') {
    try {
      const card = await Card.findById(id);
      
      if (!card) {
        return res.status(404).json({ error: `Card with ID "${id}" not found` });
      }
      
      return res.status(200).json(card);
    } catch (error) {
      console.error(`Error fetching card ${id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to fetch card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Обработка PUT-запроса (обновление карточки)
  if (req.method === 'PUT') {
    try {
      // Проверяем наличие userId для авторизации
      if (!userId) {
        return res.status(401).json({ error: 'User ID is required for authentication' });
      }
      
      // Находим карточку
      const card = await Card.findById(id);
      
      if (!card) {
        return res.status(404).json({ error: `Card with ID "${id}" not found` });
      }
      
      // Проверяем принадлежность карточки пользователю
      if (card.user_id !== userId) {
        return res.status(403).json({ error: 'You do not have permission to update this card' });
      }
      
      // Получаем данные из тела запроса
      const updateData = req.body;
      
      // Проверяем уникальность username при его изменении
      if (updateData.username && updateData.username !== card.username) {
        const existingCard = await Card.findOne({ username: updateData.username });
        if (existingCard) {
          return res.status(409).json({ error: `Username "${updateData.username}" already exists` });
        }
      }
      
      // Обновляем карточку
      const updatedCard = await Card.findByIdAndUpdate(
        id,
        { ...updateData, updated_at: new Date() },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json(updatedCard);
    } catch (error) {
      console.error(`Error updating card ${id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to update card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Обработка DELETE-запроса (удаление карточки)
  if (req.method === 'DELETE') {
    try {
      // Проверяем наличие userId для авторизации
      if (!userId) {
        return res.status(401).json({ error: 'User ID is required for authentication' });
      }
      
      // Находим карточку
      const card = await Card.findById(id);
      
      if (!card) {
        return res.status(404).json({ error: `Card with ID "${id}" not found` });
      }
      
      // Проверяем принадлежность карточки пользователю
      if (card.user_id !== userId) {
        return res.status(403).json({ error: 'You do not have permission to delete this card' });
      }
      
      // Удаляем карточку
      await Card.findByIdAndDelete(id);
      
      return res.status(200).json({ message: `Card with ID "${id}" successfully deleted` });
    } catch (error) {
      console.error(`Error deleting card ${id}:`, error);
      return res.status(500).json({ 
        error: 'Failed to delete card',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  // Метод не поддерживается
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
} 