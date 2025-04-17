import { connectToDatabase } from '../../../../lib/mongodb';
import Card from '../../../../models/Card';

/**
 * API для работы с карточкой по username
 * GET - получение карточки по username (публичный доступ)
 * PUT - обновление карточки по username
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { username } = req.query;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // Подключение к базе данных
      await connectToDatabase();
      
      // Поиск карточки пользователя
      const card = await Card.findOne({ username: username.toLowerCase() });
      
      if (!card) {
        return res.status(404).json({ error: 'Card not found' });
      }
      
      return res.status(200).json(card);
    } catch (error) {
      console.error('Error fetching card:', error);
      return res.status(500).json({ error: 'Failed to fetch card' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { username } = req.query;
      const cardData = req.body;
      
      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }
      
      // Подключение к базе данных
      await connectToDatabase();
      
      // Обновление карточки с использованием upsert
      const updatedCard = await Card.findOneAndUpdate(
        { username: username.toLowerCase() },
        { ...cardData, updatedAt: new Date() },
        { new: true, upsert: true, runValidators: true }
      );
      
      return res.status(200).json(updatedCard);
    } catch (error) {
      console.error('Error updating card:', error);
      return res.status(500).json({ error: 'Failed to update card' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 