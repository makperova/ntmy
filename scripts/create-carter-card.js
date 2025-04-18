/**
 * Скрипт для создания или обновления карточки "carter" в MongoDB
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Запустите скрипт: node scripts/create-carter-card.js
 */

// Импорт зависимостей
require('dotenv').config();
const mongoose = require('mongoose');

// Проверка наличия необходимых переменных окружения
if (!process.env.MONGODB_URI) {
  console.error('Отсутствует переменная окружения MONGODB_URI');
  process.exit(1);
}

// Настройка схемы MongoDB для Card
const CardSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
  },
  job_title: String,
  company: String,
  bio: {
    type: String,
    default: '',
  },
  email: String,
  phone: String,
  linkedin_url: String,
  whatsapp_url: String,
  telegram_url: String,
  image_url: String,
  template: {
    type: String,
    default: 'minimal'
  },
  view_count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

// Основная функция создания карточки
async function createCarterCard() {
  console.log('Создание карточки "carter" в MongoDB...');
  
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Проверяем, существует ли карточка "carter"
    const existingCard = await Card.findOne({ username: 'carter' });
    
    if (existingCard) {
      console.log('Карточка "carter" уже существует в базе данных.');
      console.log('Обновляем существующую карточку...');
      
      // Обновляем существующую карточку
      await Card.updateOne(
        { username: 'carter' },
        {
          $set: {
            name: 'Carter',
            displayName: 'Carter',
            job_title: 'Developer',
            company: 'NTMY',
            bio: 'This is my digital business card',
            email: 'carter@example.com',
            template: 'minimal',
            updatedAt: new Date(),
            isPublic: true,
            image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
            view_count: existingCard.view_count || 0
          }
        }
      );
      
      console.log('✅ Карточка "carter" успешно обновлена');
    } else {
      console.log('Карточка "carter" не найдена в базе данных.');
      console.log('Создаем новую карточку...');
      
      // Создаем новую карточку
      await Card.create({
        user_id: 'temp_user_id_' + new Date().getTime(),
        name: 'Carter',
        username: 'carter',
        displayName: 'Carter',
        job_title: 'Developer',
        company: 'NTMY',
        bio: 'This is my digital business card',
        email: 'carter@example.com',
        phone: '+1234567890',
        linkedin_url: 'https://linkedin.com/in/carter',
        template: 'minimal',
        image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        view_count: 0
      });
      
      console.log('✅ Карточка "carter" успешно создана');
    }
    
    // Проверяем результат
    const card = await Card.findOne({ username: 'carter' });
    console.log('\n📊 Данные карточки "carter":');
    console.log(JSON.stringify(card, null, 2));
    
  } catch (error) {
    console.error(`❌ Ошибка при создании карточки: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('\nСоединение с MongoDB закрыто');
  }
}

// Запускаем функцию создания карточки
createCarterCard(); 