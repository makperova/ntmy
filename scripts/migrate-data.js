/**
 * Скрипт для миграции данных из Supabase в MongoDB
 * 
 * Запуск: node scripts/migrate-data.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import chalk from 'chalk';
import readline from 'readline';

// Загрузка переменных окружения
dotenv.config();

// Проверка наличия переменных окружения
const requiredEnvVars = [
  'MONGODB_URI',
  'SUPABASE_URL',
  'SUPABASE_KEY'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  console.error(chalk.red(`Отсутствуют обязательные переменные окружения: ${missingEnvVars.join(', ')}`));
  process.exit(1);
}

// Инициализация интерфейса readline для взаимодействия с пользователем
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Создание клиента Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Схемы MongoDB
const UserSchema = new mongoose.Schema({
  email: String,
  name: String,
  picture: String,
  created_at: Date,
  last_sign_in: Date,
  supabase_id: String
});

const CardSchema = new mongoose.Schema({
  user_id: String,
  username: { type: String, unique: true },
  name: String,
  displayName: String,
  bio: String,
  picture: String,
  details: Object,
  theme: Object,
  links: Array,
  analyticsEnabled: Boolean,
  visitors: Number,
  created_at: Date,
  updated_at: Date,
  supabase_id: String
});

const AnalyticsSchema = new mongoose.Schema({
  card_id: String,
  action: String,
  timestamp: Date,
  metadata: Object,
  supabase_id: String
});

// Статистика миграции
const stats = {
  users: { total: 0, migrated: 0, errors: 0 },
  cards: { total: 0, migrated: 0, errors: 0 },
  analytics: { total: 0, migrated: 0, errors: 0 }
};

// Функция для форматирования прогресса
function formatProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `${bar} ${current}/${total} (${percentage}%)`;
}

/**
 * Основная функция миграции
 */
async function migrateData() {
  console.log(chalk.blue('=== Миграция данных из Supabase в MongoDB ==='));
  
  try {
    // Подключение к MongoDB
    console.log('Подключение к MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(chalk.green('✓ Подключено к MongoDB'));
    
    // Регистрация моделей
    const User = mongoose.model('User', UserSchema);
    const Card = mongoose.model('Card', CardSchema);
    const Analytics = mongoose.model('Analytics', AnalyticsSchema);
    
    // Проверка подключения к Supabase
    console.log('Проверка подключения к Supabase...');
    const { data: testData, error: testError } = await supabase.from('cards').select('id').limit(1);
    if (testError) {
      throw new Error(`Ошибка подключения к Supabase: ${testError.message}`);
    }
    console.log(chalk.green('✓ Подключено к Supabase'));
    
    // Проверка наличия данных в MongoDB
    const userCount = await User.countDocuments();
    const cardCount = await Card.countDocuments();
    const analyticsCount = await Analytics.countDocuments();
    
    if (userCount > 0 || cardCount > 0 || analyticsCount > 0) {
      console.log(chalk.yellow(`\nВнимание: В MongoDB уже есть данные (${userCount} пользователей, ${cardCount} карточек, ${analyticsCount} записей аналитики)`));
      
      const answer = await askQuestion('Удалить существующие данные перед миграцией? (y/n): ');
      
      if (answer.toLowerCase() === 'y') {
        console.log('Удаление существующих данных...');
        await User.deleteMany({});
        await Card.deleteMany({});
        await Analytics.deleteMany({});
        console.log(chalk.green('✓ Существующие данные удалены'));
      } else {
        console.log('Миграция будет выполнена без удаления существующих данных. Возможны дубликаты.');
      }
    }
    
    // Начало миграции
    console.log(chalk.blue('\n=== Начало миграции ==='));
    
    // Миграция пользователей
    await migrateUsers(User);
    
    // Миграция карточек
    await migrateCards(Card);
    
    // Миграция аналитики
    await migrateAnalytics(Analytics);
    
    // Вывод статистики миграции
    printStats();
    
    console.log(chalk.blue('\n=== Миграция завершена ==='));
    console.log(chalk.blue('Следующий шаг: Запустите скрипт проверки migracji для верификации данных:'));
    console.log('node scripts/verify-migration.js');
    
  } catch (error) {
    console.error(chalk.red(`Ошибка миграции: ${error.message}`));
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('Соединение с MongoDB закрыто');
  }
}

/**
 * Миграция пользователей
 */
async function migrateUsers(User) {
  console.log(chalk.blue('\nМиграция пользователей...'));
  
  // Получение пользователей из Supabase
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения пользователей из Supabase: ${error.message}`));
    return;
  }
  
  stats.users.total = users.length;
  console.log(`Найдено ${stats.users.total} пользователей в Supabase`);
  
  // Миграция каждого пользователя
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    
    try {
      // Создаем объект с данными пользователя для MongoDB
      const mongoUser = new User({
        email: user.email,
        name: user.name,
        picture: user.picture,
        created_at: new Date(user.created_at),
        last_sign_in: user.last_sign_in ? new Date(user.last_sign_in) : null,
        supabase_id: user.id
      });
      
      // Сохраняем пользователя в MongoDB
      await mongoUser.save();
      stats.users.migrated++;
      
      process.stdout.write(`\rМиграция пользователей: ${formatProgress(i + 1, users.length)}`);
    } catch (error) {
      stats.users.errors++;
      console.error(`\nОшибка миграции пользователя ${user.id}: ${error.message}`);
    }
  }
  
  console.log('\n' + chalk.green(`✓ Миграция пользователей завершена: ${stats.users.migrated}/${stats.users.total}`));
}

/**
 * Миграция карточек
 */
async function migrateCards(Card) {
  console.log(chalk.blue('\nМиграция карточек...'));
  
  // Получение карточек из Supabase
  const { data: cards, error } = await supabase.from('cards').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения карточек из Supabase: ${error.message}`));
    return;
  }
  
  stats.cards.total = cards.length;
  console.log(`Найдено ${stats.cards.total} карточек в Supabase`);
  
  // Миграция каждой карточки
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    
    try {
      // Создаем объект с данными карточки для MongoDB
      const mongoCard = new Card({
        user_id: card.user_id,
        username: card.username,
        name: card.name,
        displayName: card.displayName,
        bio: card.bio,
        picture: card.picture,
        details: card.details || {},
        theme: card.theme || {},
        links: card.links || [],
        analyticsEnabled: card.analyticsEnabled === true,
        visitors: card.visitors || 0,
        created_at: new Date(card.created_at),
        updated_at: card.updated_at ? new Date(card.updated_at) : new Date(card.created_at),
        supabase_id: card.id
      });
      
      // Сохраняем карточку в MongoDB
      await mongoCard.save();
      stats.cards.migrated++;
      
      process.stdout.write(`\rМиграция карточек: ${formatProgress(i + 1, cards.length)}`);
    } catch (error) {
      stats.cards.errors++;
      console.error(`\nОшибка миграции карточки ${card.id}: ${error.message}`);
    }
  }
  
  console.log('\n' + chalk.green(`✓ Миграция карточек завершена: ${stats.cards.migrated}/${stats.cards.total}`));
}

/**
 * Миграция аналитики
 */
async function migrateAnalytics(Analytics) {
  console.log(chalk.blue('\nМиграция аналитики...'));
  
  // Получение аналитики из Supabase
  const { data: analyticsData, error } = await supabase.from('analytics').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения аналитики из Supabase: ${error.message}`));
    return;
  }
  
  stats.analytics.total = analyticsData.length;
  console.log(`Найдено ${stats.analytics.total} записей аналитики в Supabase`);
  
  // Миграция каждой записи аналитики
  // Обработка по пакетам для ускорения миграции
  const batchSize = 100;
  const batches = Math.ceil(analyticsData.length / batchSize);
  
  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, analyticsData.length);
    const batch = analyticsData.slice(start, end);
    
    const mongoAnalyticsBatch = batch.map(analytic => ({
      card_id: analytic.card_id,
      action: analytic.action,
      timestamp: new Date(analytic.timestamp),
      metadata: analytic.metadata || {},
      supabase_id: analytic.id
    }));
    
    try {
      // Сохраняем пакет записей аналитики в MongoDB
      await Analytics.insertMany(mongoAnalyticsBatch);
      stats.analytics.migrated += mongoAnalyticsBatch.length;
    } catch (error) {
      stats.analytics.errors += batch.length;
      console.error(`\nОшибка миграции пакета аналитики: ${error.message}`);
    }
    
    process.stdout.write(`\rМиграция аналитики: ${formatProgress(end, analyticsData.length)}`);
  }
  
  console.log('\n' + chalk.green(`✓ Миграция аналитики завершена: ${stats.analytics.migrated}/${stats.analytics.total}`));
}

/**
 * Функция для вывода статистики миграции
 */
function printStats() {
  console.log(chalk.blue('\n=== Статистика миграции ==='));
  
  console.log(chalk.cyan('\nПользователи:'));
  console.log(`Всего: ${stats.users.total}`);
  console.log(`Успешно мигрировано: ${stats.users.migrated} (${Math.round(stats.users.migrated / stats.users.total * 100)}%)`);
  console.log(`Ошибок: ${stats.users.errors}`);
  
  console.log(chalk.cyan('\nКарточки:'));
  console.log(`Всего: ${stats.cards.total}`);
  console.log(`Успешно мигрировано: ${stats.cards.migrated} (${Math.round(stats.cards.migrated / stats.cards.total * 100)}%)`);
  console.log(`Ошибок: ${stats.cards.errors}`);
  
  console.log(chalk.cyan('\nАналитика:'));
  console.log(`Всего: ${stats.analytics.total}`);
  console.log(`Успешно мигрировано: ${stats.analytics.migrated} (${Math.round(stats.analytics.migrated / stats.analytics.total * 100)}%)`);
  console.log(`Ошибок: ${stats.analytics.errors}`);
}

/**
 * Функция для получения ответа на вопрос
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Запуск миграции
migrateData().catch(err => {
  console.error(chalk.red('Непредвиденная ошибка:', err));
  process.exit(1);
}); 