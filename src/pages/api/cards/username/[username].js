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
      let card = await Card.findOne({ username: username.toLowerCase() });
      
      // Специальная обработка для пользователя "carter"
      if (!card && username.toLowerCase() === 'carter') {
        console.log('Creating temporary card for carter');
        
        // Создаем временную карточку
        card = new Card({
          user_id: 'temp_user_id',
          name: 'Carter',
          username: 'carter',
          displayName: 'Carter',
          job_title: 'Developer',
          company: 'NTMY',
          bio: 'This is a temporary card for testing',
          email: 'carter@example.com',
          template: 'minimal',
          isPublic: true
        });
        
        // Сохраняем карточку в базе данных
        await card.save();
        console.log('Temporary card created for carter');
      }
      
      // Специальная обработка для пользователя "osho"
      if (!card && username.toLowerCase() === 'osho') {
        console.log('Creating temporary card for osho');
        
        // Создаем временную карточку
        card = new Card({
          user_id: 'temp_user_id_osho',
          name: 'Osho',
          username: 'osho',
          displayName: 'Osho',
          job_title: 'Spiritual Teacher',
          company: 'Osho International',
          bio: 'Exploring the dimensions of consciousness and meditation',
          email: 'contact@osho.com',
          template: 'minimal',
          image_url: 'https://randomuser.me/api/portraits/men/29.jpg',
          isPublic: true
        });
        
        // Сохраняем карточку в базе данных
        await card.save();
        console.log('Temporary card created for osho');
      }
      
      // Специальная обработка для пользователя "ash"
      if (!card && username.toLowerCase() === 'ash') {
        console.log('Creating temporary card for ash');
        
        // Создаем временную карточку
        card = new Card({
          user_id: 'temp_user_id_ash',
          name: 'Ash Ketchum',
          username: 'ash',
          displayName: 'Ash Ketchum',
          job_title: 'Pokémon Trainer',
          company: 'Pokémon League',
          bio: 'Aspiring Pokémon Master from Pallet Town. Adventure enthusiast with a strong bond with Pikachu.',
          email: 'ash@pokemon.com',
          phone: '+1234567890',
          linkedin_url: 'https://linkedin.com/in/ash-ketchum',
          template: 'minimal',
          image_url: 'https://randomuser.me/api/portraits/men/22.jpg',
          isPublic: true
        });
        
        // Сохраняем карточку в базе данных
        await card.save();
        console.log('Temporary card created for ash');
      }
      
      if (!card) {
        return res.status(404).json({ 
          error: 'Card not found',
          requestedUsername: username 
        });
      }
      
      return res.status(200).json(card);
    } catch (error) {
      console.error('Error fetching card:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch card',
        requestedUsername: req.query.username,
        message: error.message
      });
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