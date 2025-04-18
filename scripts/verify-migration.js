/**
 * Скрипт для проверки корректности миграции из Supabase в MongoDB
 * 
 * Запуск: node scripts/verify-migration.js
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import mongoose from 'mongoose';
import chalk from 'chalk';

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

// Клиент Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Статистика верификации
const stats = {
  users: { total: 0, matched: 0, mismatched: 0, missing: 0 },
  cards: { total: 0, matched: 0, mismatched: 0, missing: 0 },
  analytics: { total: 0, matched: 0, mismatched: 0, missing: 0 }
};

// Ошибки верификации
const errors = {
  users: [],
  cards: [],
  analytics: []
};

/**
 * Основная функция верификации
 */
async function verifyMigration() {
  console.log(chalk.blue('=== Проверка миграции данных из Supabase в MongoDB ==='));
  
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
    
    // Начало проверки
    console.log('\n=== Начало проверки ===');
    
    // Проверка пользователей
    await verifyUsers(User);
    
    // Проверка карточек
    await verifyCards(Card);
    
    // Проверка аналитики
    await verifyAnalytics(Analytics);
    
    // Вывод итоговой статистики
    printStats();
    
    // Вывод ошибок, если есть
    if (errors.users.length || errors.cards.length || errors.analytics.length) {
      printErrors();
    }
    
    console.log(chalk.blue('\n=== Проверка завершена ==='));
    
  } catch (error) {
    console.error(chalk.red(`Ошибка верификации: ${error.message}`));
  } finally {
    // Закрытие соединения с MongoDB
    await mongoose.disconnect();
    console.log('Соединение с MongoDB закрыто');
  }
}

/**
 * Проверка пользователей
 */
async function verifyUsers(User) {
  console.log(chalk.blue('\nПроверка пользователей...'));
  
  // Получение пользователей из Supabase
  const { data: supabaseUsers, error } = await supabase.from('users').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения пользователей из Supabase: ${error.message}`));
    return;
  }
  
  stats.users.total = supabaseUsers.length;
  console.log(`Найдено ${stats.users.total} пользователей в Supabase`);
  
  // Получение пользователей из MongoDB
  const mongoUsers = await User.find({});
  console.log(`Найдено ${mongoUsers.length} пользователей в MongoDB`);
  
  // Проходим по каждому пользователю из Supabase
  for (const supabaseUser of supabaseUsers) {
    // Ищем соответствующего пользователя в MongoDB
    const mongoUser = mongoUsers.find(u => u.supabase_id === supabaseUser.id);
    
    if (!mongoUser) {
      stats.users.missing++;
      errors.users.push({
        id: supabaseUser.id,
        email: supabaseUser.email,
        error: 'Пользователь отсутствует в MongoDB'
      });
      continue;
    }
    
    // Проверка соответствия полей
    const mismatchedFields = [];
    
    if (mongoUser.email !== supabaseUser.email) {
      mismatchedFields.push('email');
    }
    
    if (mongoUser.name !== supabaseUser.name) {
      mismatchedFields.push('name');
    }
    
    if (mongoUser.picture !== supabaseUser.picture) {
      mismatchedFields.push('picture');
    }
    
    if (mismatchedFields.length > 0) {
      stats.users.mismatched++;
      errors.users.push({
        id: supabaseUser.id,
        email: supabaseUser.email,
        error: `Несоответствие полей: ${mismatchedFields.join(', ')}`
      });
    } else {
      stats.users.matched++;
    }
  }
  
  // Проверка на наличие дополнительных пользователей в MongoDB
  const extraMongoUsers = mongoUsers.filter(
    mu => !supabaseUsers.some(su => su.id === mu.supabase_id)
  );
  
  if (extraMongoUsers.length > 0) {
    console.log(chalk.yellow(`Найдено ${extraMongoUsers.length} дополнительных пользователей в MongoDB`));
    extraMongoUsers.forEach(u => {
      errors.users.push({
        id: u._id.toString(),
        email: u.email,
        error: 'Дополнительный пользователь (отсутствует в Supabase)'
      });
    });
  }
  
  console.log(chalk.green(`✓ Проверка пользователей завершена: ${stats.users.matched}/${stats.users.total} совпадений`));
}

/**
 * Проверка карточек
 */
async function verifyCards(Card) {
  console.log(chalk.blue('\nПроверка карточек...'));
  
  // Получение карточек из Supabase
  const { data: supabaseCards, error } = await supabase.from('cards').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения карточек из Supabase: ${error.message}`));
    return;
  }
  
  stats.cards.total = supabaseCards.length;
  console.log(`Найдено ${stats.cards.total} карточек в Supabase`);
  
  // Получение карточек из MongoDB
  const mongoCards = await Card.find({});
  console.log(`Найдено ${mongoCards.length} карточек в MongoDB`);
  
  // Проходим по каждой карточке из Supabase
  for (const supabaseCard of supabaseCards) {
    // Ищем соответствующую карточку в MongoDB
    const mongoCard = mongoCards.find(c => c.supabase_id === supabaseCard.id);
    
    if (!mongoCard) {
      stats.cards.missing++;
      errors.cards.push({
        id: supabaseCard.id,
        username: supabaseCard.username,
        error: 'Карточка отсутствует в MongoDB'
      });
      continue;
    }
    
    // Проверка соответствия полей
    const mismatchedFields = [];
    
    if (mongoCard.username !== supabaseCard.username) {
      mismatchedFields.push('username');
    }
    
    if (mongoCard.user_id !== supabaseCard.user_id) {
      mismatchedFields.push('user_id');
    }
    
    if (mongoCard.name !== supabaseCard.name) {
      mismatchedFields.push('name');
    }
    
    if (mongoCard.displayName !== supabaseCard.displayName) {
      mismatchedFields.push('displayName');
    }
    
    if (mongoCard.bio !== supabaseCard.bio) {
      mismatchedFields.push('bio');
    }
    
    // Примечание: сложные объекты можно было бы проверять более глубоко
    
    if (mismatchedFields.length > 0) {
      stats.cards.mismatched++;
      errors.cards.push({
        id: supabaseCard.id,
        username: supabaseCard.username,
        error: `Несоответствие полей: ${mismatchedFields.join(', ')}`
      });
    } else {
      stats.cards.matched++;
    }
  }
  
  // Проверка на наличие дополнительных карточек в MongoDB
  const extraMongoCards = mongoCards.filter(
    mc => !supabaseCards.some(sc => sc.id === mc.supabase_id)
  );
  
  if (extraMongoCards.length > 0) {
    console.log(chalk.yellow(`Найдено ${extraMongoCards.length} дополнительных карточек в MongoDB`));
    extraMongoCards.forEach(c => {
      errors.cards.push({
        id: c._id.toString(),
        username: c.username,
        error: 'Дополнительная карточка (отсутствует в Supabase)'
      });
    });
  }
  
  console.log(chalk.green(`✓ Проверка карточек завершена: ${stats.cards.matched}/${stats.cards.total} совпадений`));
}

/**
 * Проверка аналитики
 */
async function verifyAnalytics(Analytics) {
  console.log(chalk.blue('\nПроверка аналитики...'));
  
  // Получение аналитики из Supabase
  const { data: supabaseAnalytics, error } = await supabase.from('analytics').select('*');
  if (error) {
    console.error(chalk.red(`Ошибка получения аналитики из Supabase: ${error.message}`));
    return;
  }
  
  stats.analytics.total = supabaseAnalytics.length;
  console.log(`Найдено ${stats.analytics.total} записей аналитики в Supabase`);
  
  // Получение аналитики из MongoDB
  const mongoAnalytics = await Analytics.find({});
  console.log(`Найдено ${mongoAnalytics.length} записей аналитики в MongoDB`);
  
  // Проходим по каждой записи аналитики из Supabase
  for (const supabaseAnalytic of supabaseAnalytics) {
    // Ищем соответствующую запись в MongoDB
    const mongoAnalytic = mongoAnalytics.find(a => a.supabase_id === supabaseAnalytic.id);
    
    if (!mongoAnalytic) {
      stats.analytics.missing++;
      errors.analytics.push({
        id: supabaseAnalytic.id,
        card_id: supabaseAnalytic.card_id,
        error: 'Запись аналитики отсутствует в MongoDB'
      });
      continue;
    }
    
    // Проверка соответствия полей
    const mismatchedFields = [];
    
    if (mongoAnalytic.card_id !== supabaseAnalytic.card_id) {
      mismatchedFields.push('card_id');
    }
    
    if (mongoAnalytic.action !== supabaseAnalytic.action) {
      mismatchedFields.push('action');
    }
    
    // Примечание: timestamp может отличаться форматом, поэтому проверяем только дату
    const supabaseDate = new Date(supabaseAnalytic.timestamp);
    const mongoDate = new Date(mongoAnalytic.timestamp);
    
    if (supabaseDate.toDateString() !== mongoDate.toDateString()) {
      mismatchedFields.push('timestamp');
    }
    
    if (mismatchedFields.length > 0) {
      stats.analytics.mismatched++;
      errors.analytics.push({
        id: supabaseAnalytic.id,
        card_id: supabaseAnalytic.card_id,
        error: `Несоответствие полей: ${mismatchedFields.join(', ')}`
      });
    } else {
      stats.analytics.matched++;
    }
  }
  
  console.log(chalk.green(`✓ Проверка аналитики завершена: ${stats.analytics.matched}/${stats.analytics.total} совпадений`));
}

/**
 * Вывод статистики
 */
function printStats() {
  console.log(chalk.blue('\n=== Статистика проверки ==='));
  
  console.log(chalk.cyan('\nПользователи:'));
  console.log(`Всего: ${stats.users.total}`);
  console.log(`Совпадающих: ${stats.users.matched} (${Math.round(stats.users.matched / stats.users.total * 100)}%)`);
  console.log(`Несовпадающих: ${stats.users.mismatched} (${Math.round(stats.users.mismatched / stats.users.total * 100)}%)`);
  console.log(`Отсутствующих: ${stats.users.missing} (${Math.round(stats.users.missing / stats.users.total * 100)}%)`);
  
  console.log(chalk.cyan('\nКарточки:'));
  console.log(`Всего: ${stats.cards.total}`);
  console.log(`Совпадающих: ${stats.cards.matched} (${Math.round(stats.cards.matched / stats.cards.total * 100)}%)`);
  console.log(`Несовпадающих: ${stats.cards.mismatched} (${Math.round(stats.cards.mismatched / stats.cards.total * 100)}%)`);
  console.log(`Отсутствующих: ${stats.cards.missing} (${Math.round(stats.cards.missing / stats.cards.total * 100)}%)`);
  
  console.log(chalk.cyan('\nАналитика:'));
  console.log(`Всего: ${stats.analytics.total}`);
  console.log(`Совпадающих: ${stats.analytics.matched} (${Math.round(stats.analytics.matched / stats.analytics.total * 100)}%)`);
  console.log(`Несовпадающих: ${stats.analytics.mismatched} (${Math.round(stats.analytics.mismatched / stats.analytics.total * 100)}%)`);
  console.log(`Отсутствующих: ${stats.analytics.missing} (${Math.round(stats.analytics.missing / stats.analytics.total * 100)}%)`);
}

/**
 * Вывод ошибок
 */
function printErrors() {
  console.log(chalk.red('\n=== Ошибки проверки ==='));
  
  if (errors.users.length > 0) {
    console.log(chalk.cyan('\nОшибки пользователей:'));
    errors.users.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. ID: ${error.id}, Email: ${error.email}`);
      console.log(`   Ошибка: ${error.error}`);
    });
    
    if (errors.users.length > 10) {
      console.log(`... и еще ${errors.users.length - 10} ошибок`);
    }
  }
  
  if (errors.cards.length > 0) {
    console.log(chalk.cyan('\nОшибки карточек:'));
    errors.cards.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. ID: ${error.id}, Username: ${error.username}`);
      console.log(`   Ошибка: ${error.error}`);
    });
    
    if (errors.cards.length > 10) {
      console.log(`... и еще ${errors.cards.length - 10} ошибок`);
    }
  }
  
  if (errors.analytics.length > 0) {
    console.log(chalk.cyan('\nОшибки аналитики:'));
    errors.analytics.slice(0, 10).forEach((error, index) => {
      console.log(`${index + 1}. ID: ${error.id}, Card ID: ${error.card_id}`);
      console.log(`   Ошибка: ${error.error}`);
    });
    
    if (errors.analytics.length > 10) {
      console.log(`... и еще ${errors.analytics.length - 10} ошибок`);
    }
  }
}

// Запуск проверки
verifyMigration().catch(err => {
  console.error(chalk.red('Непредвиденная ошибка:', err));
  process.exit(1);
}); 