/**
 * Скрипт для проверки подключения к MongoDB и валидации данных
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Запустите скрипт: node scripts/verify-mongodb.js
 */

// Импорт зависимостей
require('dotenv').config();
const mongoose = require('mongoose');

// Проверка наличия необходимых переменных окружения
if (!process.env.MONGODB_URI) {
  console.error('Отсутствует переменная окружения MONGODB_URI');
  process.exit(1);
}

// Настройка схемы MongoDB для Card (с валидацией)
const CardSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true,
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
  },
});

// Основная функция проверки данных
async function verifyMongoDBCards() {
  console.log('Проверка подключения и данных в MongoDB...');
  
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Получаем количество карточек
    const cardCount = await Card.countDocuments();
    console.log(`✅ Найдено ${cardCount} карточек в коллекции`);
    
    // Проверяем наличие карточки "carter"
    const carterCard = await Card.findOne({ username: 'carter' });
    if (carterCard) {
      console.log(`✅ Карточка "carter" найдена: ${carterCard.name}`);
    } else {
      console.log('❌ Карточка "carter" не найдена');
    }
    
    // Проверяем наличие обязательных полей у всех карточек
    const invalidCards = await Card.find({
      $or: [
        { name: { $exists: false } },
        { username: { $exists: false } },
        { user_id: { $exists: false } }
      ]
    }).select('_id username name');
    
    if (invalidCards.length > 0) {
      console.log(`❌ Найдено ${invalidCards.length} карточек с отсутствующими обязательными полями:`);
      invalidCards.forEach(card => {
        console.log(`  - ID: ${card._id}, Username: ${card.username || 'отсутствует'}, Name: ${card.name || 'отсутствует'}`);
      });
    } else {
      console.log('✅ Все карточки имеют необходимые обязательные поля');
    }
    
    // Проверяем уникальность username
    const usernames = await Card.aggregate([
      { $group: { _id: "$username", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    
    if (usernames.length > 0) {
      console.log(`❌ Найдено ${usernames.length} неуникальных username:`);
      usernames.forEach(item => {
        console.log(`  - Username: ${item._id}, Количество: ${item.count}`);
      });
    } else {
      console.log('✅ Все username уникальны');
    }
    
    // Выполняем произвольный запрос для получения последних карточек
    const latestCards = await Card.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name username updatedAt');
      
    console.log('\n📊 Последние обновленные карточки:');
    latestCards.forEach(card => {
      console.log(`  - ${card.name} (${card.username}), обновлено: ${card.updatedAt ? new Date(card.updatedAt).toLocaleString() : 'нет даты'}`);
    });
    
  } catch (error) {
    console.error(`❌ Ошибка при проверке MongoDB: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('\nСоединение с MongoDB закрыто');
  }
}

// Запускаем функцию проверки
verifyMongoDBCards(); 