/**
 * Скрипт для импорта данных из JSON-файла в MongoDB
 * Используется, если экспорт из Supabase делается вручную через интерфейс
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Экспортируйте данные из Supabase в JSON-файл
 * 3. Поместите JSON-файл в папку backups/ с именем supabase_export.json
 * 4. Запустите скрипт: node scripts/import-json-to-mongodb.js
 */

// Импорт зависимостей
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

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

// Основная функция импорта
async function importFromJsonToMongoDB() {
  console.log('Импорт данных из JSON-файла в MongoDB...');
  
  try {
    // Проверяем наличие файла
    const jsonFilePath = path.join(__dirname, '../backups/supabase_export.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`Файл ${jsonFilePath} не найден.`);
      console.error('Экспортируйте данные из Supabase и поместите их в backups/supabase_export.json');
      process.exit(1);
    }
    
    // Читаем данные из файла
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    let supabaseCards;
    
    try {
      supabaseCards = JSON.parse(jsonData);
    } catch (parseError) {
      console.error(`Ошибка при разборе JSON-файла: ${parseError.message}`);
      process.exit(1);
    }
    
    if (!Array.isArray(supabaseCards)) {
      console.error('Данные в файле должны быть массивом объектов.');
      process.exit(1);
    }
    
    console.log(`Прочитано ${supabaseCards.length} карточек из файла`);
    
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Преобразуем карточки в формат MongoDB
    const mongoCards = supabaseCards.map(transformSupabaseToMongoDb);
    
    // Статистика импорта
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
    console.log('\n===== Итоги импорта =====');
    console.log(`Всего обработано: ${mongoCards.length} карточек`);
    console.log(`Создано новых: ${created}`);
    console.log(`Обновлено существующих: ${updated}`);
    console.log(`Ошибок: ${errors}`);
    console.log('=========================\n');
    
  } catch (error) {
    console.error(`Ошибка при импорте: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

// Запускаем импорт
importFromJsonToMongoDB(); 