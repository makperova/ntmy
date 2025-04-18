import { connectToDatabase } from '../../../../lib/mongodb';
import Card from '../../../../models/Card';

/**
 * API для работы с карточками конкретного пользователя
 * GET - получение всех карточек пользователя
 * Поддерживает идентификацию пользователя по:
 * - ID пользователя (Supabase ID или новый ID)
 * - email пользователя
 * - маркер особого доступа (special_access_token)
 */
export default async function handler(req, res) {
  // Добавляем заголовки CORS для доступа из любого источника
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, special-access-token');
  
  // Обрабатываем preflight запросы
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { user_id } = req.query;
      const specialAccessToken = req.headers['special-access-token'];
      
      console.log('Запрос карточек для пользователя:', user_id);
      console.log('Специальный токен:', specialAccessToken);
      
      if (!user_id && !specialAccessToken) {
        return res.status(400).json({ error: 'User identification is required' });
      }
      
      // Подключение к базе данных
      try {
        await connectToDatabase();
      } catch (dbError) {
        console.error('Ошибка подключения к базе данных:', dbError);
        return res.status(500).json({ 
          error: 'Failed to connect to database',
          details: dbError.message
        });
      }
      
      // Формируем запрос на основе полученных данных
      let query = {};
      
      // Специальный токен доступа для makperova@gmail.com
      if (specialAccessToken === process.env.SPECIAL_ACCESS_TOKEN || 
          specialAccessToken === 'ntmy-temp-migration-token') {
        // Специальный доступ для миграции - показываем карточки привязанные к makperova@gmail.com
        query = { $or: [
          { user_id: 'mock-user-id-for-makperova' },
          { user_email: 'makperova@gmail.com' },
          { email: 'makperova@gmail.com' }
        ]};
        
        console.log('Используем специальный запрос для makperova@gmail.com');
      } else if (user_id.includes('@')) {
        // Если user_id похож на email - ищем по email или user_email
        query = { $or: [
          { email: user_id },
          { user_email: user_id }
        ]};
        
        console.log('Используем запрос по email:', user_id);
      } else {
        // В остальных случаях ищем по user_id
        query = { user_id: user_id };
        console.log('Используем запрос по user_id:', user_id);
      }
      
      // Поиск всех карточек пользователя
      try {
        console.log('Выполняем поиск карточек с запросом:', JSON.stringify(query));
        const cards = await Card.find(query);
        
        console.log(`Найдено ${cards ? cards.length : 0} карточек`);
        
        if (!cards || cards.length === 0) {
          console.log('Карточки не найдены, проверяем специальные пути...');
          
          // Если мы ищем карточки для makperova@gmail.com и не нашли ничего,
          // создаем специальные карточки carter, osho и marina
          if ((specialAccessToken === 'ntmy-temp-migration-token' || 
               specialAccessToken === process.env.SPECIAL_ACCESS_TOKEN ||
               user_id === 'makperova@gmail.com') && 
              (!cards || cards.length === 0)) {
              
            console.log('Создаем специальные карточки...');
            
            // Пробуем найти существующие карточки по username
            const specialUsernames = ['carter', 'osho', 'marina'];
            const specialCards = [];
            
            for (const username of specialUsernames) {
              try {
                let specialCard = await Card.findOne({ username });
                
                if (!specialCard) {
                  console.log(`Создаем специальную карточку ${username}...`);
                  
                  // Если карточка не найдена, создаем ее
                  specialCard = new Card({
                    user_id: 'mock-user-id-for-makperova',
                    user_email: 'makperova@gmail.com',
                    username: username,
                    name: username.charAt(0).toUpperCase() + username.slice(1),
                    displayName: username.charAt(0).toUpperCase() + username.slice(1),
                    job_title: username === 'carter' ? 'Developer' : 
                               username === 'osho' ? 'Spiritual Teacher' : 'Designer',
                    company: username === 'carter' ? 'NTMY' : 
                             username === 'osho' ? 'Osho International' : 'Design Studio',
                    image_url: username === 'osho' ? 'https://randomuser.me/api/portraits/men/29.jpg' : null,
                    template: 'minimal',
                    isPublic: true,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                  
                  await specialCard.save();
                  console.log(`Карточка ${username} создана!`);
                } else {
                  console.log(`Карточка ${username} уже существует, обновляем привязку к makperova@gmail.com`);
                  specialCard.user_email = 'makperova@gmail.com';
                  await specialCard.save();
                }
                
                specialCards.push(specialCard);
              } catch (cardError) {
                console.error(`Ошибка при создании карточки ${username}:`, cardError);
              }
            }
            
            console.log(`Создано ${specialCards.length} специальных карточек`);
            return res.status(200).json(specialCards);
          }
          
          // Если карточек не найдено для обычного запроса
          return res.status(200).json([]);
        }
        
        return res.status(200).json(cards);
      } catch (cardError) {
        console.error('Ошибка при поиске карточек:', cardError);
        return res.status(500).json({ 
          error: 'Error searching for cards',
          details: cardError.message,
          query: query
        });
      }
    } catch (error) {
      console.error('Ошибка обработки запроса:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch user cards',
        user_id: req.query.user_id,
        message: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
} 