/**
 * Скрипт для создания набора тестовых карточек в MongoDB
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Запустите скрипт: node scripts/create-test-cards.js
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

// Массив тестовых карточек
const testCards = [
  {
    user_id: 'test_user_id_carter',
    name: 'Carter',
    username: 'carter',
    displayName: 'Carter',
    job_title: 'Developer',
    company: 'NTMY',
    bio: 'Full stack developer with a passion for building great products',
    email: 'carter@example.com',
    phone: '+1234567890',
    linkedin_url: 'https://linkedin.com/in/carter',
    template: 'minimal',
    image_url: 'https://randomuser.me/api/portraits/men/32.jpg',
    isPublic: true
  },
  {
    user_id: 'test_user_id_osho',
    name: 'Osho',
    username: 'osho',
    displayName: 'Osho',
    job_title: 'Spiritual Teacher',
    company: 'Osho International',
    bio: 'Exploring the dimensions of consciousness and meditation',
    email: 'contact@osho.com',
    linkedin_url: 'https://linkedin.com/in/osho',
    template: 'minimal',
    image_url: 'https://randomuser.me/api/portraits/men/29.jpg',
    isPublic: true
  },
  {
    user_id: 'test_user_id_ash',
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
  },
  {
    user_id: 'test_user_id_einstein',
    name: 'Albert Einstein',
    username: 'einstein',
    displayName: 'Albert Einstein',
    job_title: 'Theoretical Physicist',
    company: 'Princeton University',
    bio: 'Developed the theory of relativity, one of the two pillars of modern physics',
    email: 'einstein@example.com',
    linkedin_url: 'https://linkedin.com/in/einstein',
    template: 'minimal',
    image_url: 'https://randomuser.me/api/portraits/men/21.jpg',
    isPublic: true
  },
  {
    user_id: 'test_user_id_curie',
    name: 'Marie Curie',
    username: 'curie',
    displayName: 'Marie Curie',
    job_title: 'Physicist and Chemist',
    company: 'University of Paris',
    bio: 'Pioneer in the field of radioactivity, first person to win Nobel Prize twice',
    email: 'curie@example.com',
    linkedin_url: 'https://linkedin.com/in/curie',
    template: 'minimal',
    image_url: 'https://randomuser.me/api/portraits/women/31.jpg',
    isPublic: true
  },
  {
    user_id: 'test_user_id_tesla',
    name: 'Nikola Tesla',
    username: 'tesla',
    displayName: 'Nikola Tesla',
    job_title: 'Inventor & Engineer',
    company: 'Tesla Electric Company',
    bio: 'Known for contributions to the design of the modern alternating current (AC) electricity supply system',
    email: 'tesla@example.com',
    linkedin_url: 'https://linkedin.com/in/tesla',
    template: 'minimal',
    image_url: 'https://randomuser.me/api/portraits/men/33.jpg',
    isPublic: true
  }
];

// Основная функция создания тестовых карточек
async function createTestCards() {
  console.log('Создание тестовых карточек в MongoDB...');
  
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Статистика создания карточек
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    // Обрабатываем каждую тестовую карточку
    for (const cardData of testCards) {
      try {
        // Проверяем, существует ли карточка с таким username
        const existingCard = await Card.findOne({ username: cardData.username });
        
        if (existingCard) {
          // Обновляем существующую карточку
          await Card.updateOne(
            { username: cardData.username },
            {
              ...cardData,
              updatedAt: new Date(),
              view_count: existingCard.view_count || 0
            }
          );
          updated++;
          console.log(`✅ Обновлена тестовая карточка: ${cardData.name} (${cardData.username})`);
        } else {
          // Создаем новую карточку
          await Card.create({
            ...cardData,
            createdAt: new Date(),
            updatedAt: new Date(),
            view_count: 0
          });
          created++;
          console.log(`✅ Создана новая тестовая карточка: ${cardData.name} (${cardData.username})`);
        }
      } catch (cardError) {
        console.error(`❌ Ошибка при обработке тестовой карточки ${cardData.name}: ${cardError.message}`);
        errors++;
      }
    }
    
    // Выводим итоговую статистику
    console.log('\n===== Итоги создания тестовых карточек =====');
    console.log(`Всего обработано: ${testCards.length} карточек`);
    console.log(`Создано новых: ${created}`);
    console.log(`Обновлено существующих: ${updated}`);
    console.log(`Ошибок: ${errors}`);
    console.log('============================================\n');
    
  } catch (error) {
    console.error(`❌ Ошибка при создании тестовых карточек: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

// Запускаем функцию создания тестовых карточек
createTestCards(); 