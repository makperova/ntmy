/**
 * Скрипт миграции данных карточек из Supabase в MongoDB
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install @supabase/supabase-js mongoose dotenv
 * 2. Создайте .env.migration файл с переменными окружения:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_KEY
 *    - MONGODB_URI
 * 3. Запустите скрипт: node scripts/migrate-supabase-to-mongodb.js
 */

// Импорт зависимостей
require('dotenv').config({ path: '.env.migration' });
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(', ')}`);
  console.error('Пожалуйста, создайте файл .env.migration с указанными переменными');
  process.exit(1);
}

// Инициализация клиентов
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Настройка схемы MongoDB
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
  avatar: {
    type: String,
    default: '',
  },
  links: {
    type: [{
      title: String,
      url: String,
      icon: String,
    }],
    default: [],
  },
  socialLinks: {
    type: Map,
    of: String,
    default: {},
  },
  theme: {
    type: String,
    default: 'default',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

// Функция преобразования данных из Supabase в формат MongoDB
function transformSupabaseToMongoDb(supabaseCard) {
  // Создаем базовый объект карточки для MongoDB
  const mongoCard = {
    user_id: supabaseCard.user_id,
    name: supabaseCard.name || 'Unnamed Card',
    // Обрабатываем username: убираем пробелы, приводим к нижнему регистру
    username: (supabaseCard.username || `card-${supabaseCard.id}`).toLowerCase().trim(),
    displayName: supabaseCard.name || 'Unnamed Card', // По умолчанию displayName = name
    job_title: supabaseCard.job_title || '',
    company: supabaseCard.company || '',
    bio: supabaseCard.bio || '',
    email: supabaseCard.email || '',
    phone: supabaseCard.phone || '',
    linkedin_url: supabaseCard.linkedin_url || '',
    whatsapp_url: supabaseCard.whatsapp_url || '',
    telegram_url: supabaseCard.telegram_url || '',
    image_url: supabaseCard.image_url || '',
    template: supabaseCard.template || 'minimal',
    view_count: supabaseCard.view_count || 0,
    createdAt: supabaseCard.created_at ? new Date(supabaseCard.created_at) : new Date(),
    updatedAt: supabaseCard.updated_at ? new Date(supabaseCard.updated_at) : new Date(),
    isPublic: true,
  };

  return mongoCard;
}

// Основная функция миграции
async function migrateCardsFromSupabaseToMongoDB() {
  console.log('Начинаем миграцию данных из Supabase в MongoDB...');
  
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Получаем все карточки из Supabase
    const { data: supabaseCards, error } = await supabase
      .from('cards')
      .select('*');
    
    if (error) {
      throw new Error(`Ошибка при получении данных из Supabase: ${error.message}`);
    }
    
    console.log(`Получено ${supabaseCards.length} карточек из Supabase`);
    
    // Сохраняем резервную копию данных из Supabase
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupPath = path.join(backupDir, `supabase_cards_backup_${new Date().toISOString().replace(/:/g, '-')}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(supabaseCards, null, 2));
    console.log(`Резервная копия данных Supabase сохранена в ${backupPath}`);
    
    // Преобразуем карточки в формат MongoDB
    const mongoCards = supabaseCards.map(transformSupabaseToMongoDb);
    
    // Статистика миграции
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    // Обрабатываем каждую карточку
    for (const cardData of mongoCards) {
      try {
        // Пытаемся найти карточку по username
        const existingCard = await Card.findOne({ username: cardData.username });
        
        if (existingCard) {
          // Обновляем существующую карточку
          await Card.updateOne({ _id: existingCard._id }, cardData);
          updated++;
          console.log(`✅ Обновлена карточка: ${cardData.name} (${cardData.username})`);
        } else {
          // Создаем новую карточку
          await Card.create(cardData);
          created++;
          console.log(`✅ Создана новая карточка: ${cardData.name} (${cardData.username})`);
        }
      } catch (cardError) {
        console.error(`❌ Ошибка при обработке карточки ${cardData.name}: ${cardError.message}`);
        errors++;
      }
    }
    
    // Выводим итоговую статистику
    console.log('\n===== Итоги миграции =====');
    console.log(`Всего обработано: ${mongoCards.length} карточек`);
    console.log(`Создано новых: ${created}`);
    console.log(`Обновлено существующих: ${updated}`);
    console.log(`Ошибок: ${errors}`);
    console.log('==========================\n');
    
    // Проверяем наличие специальной карточки "carter"
    const carterCard = await Card.findOne({ username: 'carter' });
    if (!carterCard) {
      console.log('Создаем специальную карточку для "carter"...');
      await Card.create({
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
      console.log('✅ Карточка "carter" успешно создана');
    } else {
      console.log('✅ Карточка "carter" уже существует в MongoDB');
    }
    
  } catch (error) {
    console.error(`Ошибка при миграции: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

// Запускаем миграцию
migrateCardsFromSupabaseToMongoDB(); 