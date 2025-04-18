/**
 * Скрипт для полной миграции данных из Supabase в MongoDB
 * 
 * Запуск: node scripts/migrate-full.js
 * 
 * Требуемые переменные окружения:
 * - MONGODB_URI: URI подключения к MongoDB
 * - MIGRATION_API_KEY: Ключ API для миграции
 * - SPECIAL_ACCESS_TOKEN: Специальный токен доступа
 * - SUPABASE_URL: URL Supabase
 * - SUPABASE_KEY: Ключ Supabase
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { createClient } from "@supabase/supabase-js";
import chalk from "chalk";

// Загрузка переменных окружения
dotenv.config({ path: ".env.local" });

// Проверка и вывод статуса переменных среды
const { 
  MONGODB_URI, 
  MIGRATION_API_KEY, 
  SUPABASE_URL, 
  SUPABASE_KEY,
  SPECIAL_ACCESS_TOKEN 
} = process.env;

console.log(chalk.blue("=== Проверка переменных окружения ==="));
console.log(`MONGODB_URI: ${MONGODB_URI ? chalk.green('✓') : chalk.red('✗')}`);
console.log(`MIGRATION_API_KEY: ${MIGRATION_API_KEY ? chalk.green('✓') : chalk.red('✗')}`);
console.log(`SUPABASE_URL: ${SUPABASE_URL ? chalk.green('✓') : chalk.red('✗')}`);
console.log(`SUPABASE_KEY: ${SUPABASE_KEY ? chalk.green('✓') : chalk.red('✗')}`);
console.log(`SPECIAL_ACCESS_TOKEN: ${SPECIAL_ACCESS_TOKEN ? chalk.green('✓') : chalk.red('✗')}`);

// Проверка необходимых переменных
if (!MONGODB_URI || !MIGRATION_API_KEY || !SUPABASE_URL || !SUPABASE_KEY || !SPECIAL_ACCESS_TOKEN) {
  console.error(chalk.red("Отсутствуют обязательные переменные окружения. Проверьте .env.local"));
  process.exit(1);
}

// MongoDB схемы
const MigrationSchema = new mongoose.Schema({
  type: String,
  completed: Boolean,
  timestamp: Date
});

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

// Функция миграции
async function migrateData() {
  console.log(chalk.blue("\n=== Начало миграции данных из Supabase в MongoDB ==="));
  
  try {
    // Подключение к MongoDB
    console.log("Подключение к MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log(chalk.green("✓ Подключение к MongoDB установлено"));

    // Создание моделей
    const Migration = mongoose.model('Migration', MigrationSchema);
    const User = mongoose.model('User', UserSchema);
    const Card = mongoose.model('Card', CardSchema);
    const Analytics = mongoose.model('Analytics', AnalyticsSchema);

    // Проверка, была ли миграция уже выполнена
    const existingMigration = await Migration.findOne({ type: 'full' });
    if (existingMigration && existingMigration.completed) {
      console.log(chalk.yellow("⚠ Полная миграция уже была выполнена ранее."));
      const confirm = process.argv.includes('--force');
      
      if (!confirm) {
        console.log(chalk.yellow("Для повторной миграции запустите с флагом --force"));
        process.exit(0);
      }
      console.log(chalk.yellow("Продолжаем с принудительной миграцией..."));
    }

    // Инициализация Supabase клиента
    console.log("Подключение к Supabase...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(chalk.green("✓ Подключение к Supabase установлено"));

    // Счетчики для статистики
    let stats = {
      users: { total: 0, migrated: 0, errors: 0 },
      cards: { total: 0, migrated: 0, errors: 0 },
      analytics: { total: 0, migrated: 0, errors: 0 }
    };

    // Миграция пользователей
    console.log(chalk.blue("\n=== Миграция пользователей ==="));
    const { data: supaUsers, error: usersError } = await supabase
      .from('users')
      .select('*');

    if (usersError) {
      console.error(chalk.red(`Ошибка получения пользователей из Supabase: ${usersError.message}`));
      process.exit(1);
    }

    stats.users.total = supaUsers.length;
    console.log(`Найдено ${supaUsers.length} пользователей в Supabase`);

    for (const supaUser of supaUsers) {
      try {
        // Проверка существования пользователя в MongoDB
        const existingUser = await User.findOne({ supabase_id: supaUser.id });
        
        if (existingUser) {
          console.log(chalk.yellow(`Пользователь ${supaUser.email} уже существует в MongoDB. Обновление...`));
          
          // Обновляем существующего пользователя
          await User.updateOne(
            { supabase_id: supaUser.id }, 
            {
              email: supaUser.email,
              name: supaUser.name,
              picture: supaUser.picture,
              last_sign_in: supaUser.last_sign_in,
              updated_at: new Date()
            }
          );
        } else {
          // Создаем нового пользователя
          const newUser = new User({
            email: supaUser.email,
            name: supaUser.name,
            picture: supaUser.picture,
            created_at: supaUser.created_at,
            last_sign_in: supaUser.last_sign_in,
            supabase_id: supaUser.id
          });
          
          await newUser.save();
        }
        
        stats.users.migrated++;
        process.stdout.write(`\rМигрировано пользователей: ${stats.users.migrated}/${stats.users.total}`);
      } catch (error) {
        console.error(chalk.red(`\nОшибка миграции пользователя ${supaUser.email}: ${error.message}`));
        stats.users.errors++;
      }
    }
    console.log(chalk.green(`\n✓ Миграция пользователей завершена. Успешно: ${stats.users.migrated}, Ошибки: ${stats.users.errors}`));

    // Миграция карточек
    console.log(chalk.blue("\n=== Миграция карточек ==="));
    const { data: supaCards, error: cardsError } = await supabase
      .from('cards')
      .select('*');

    if (cardsError) {
      console.error(chalk.red(`Ошибка получения карточек из Supabase: ${cardsError.message}`));
      process.exit(1);
    }

    stats.cards.total = supaCards.length;
    console.log(`Найдено ${supaCards.length} карточек в Supabase`);

    for (const supaCard of supaCards) {
      try {
        // Проверка существования карточки в MongoDB
        const existingCard = await Card.findOne({ supabase_id: supaCard.id });
        
        // Найти соответствующего пользователя
        const user = await User.findOne({ supabase_id: supaCard.user_id });
        
        if (!user) {
          console.log(chalk.yellow(`Пользователь для карточки ${supaCard.username} не найден. Пропуск...`));
          continue;
        }
        
        const cardData = {
          user_id: user._id.toString(),
          username: supaCard.username,
          name: supaCard.name,
          displayName: supaCard.display_name,
          bio: supaCard.bio,
          picture: supaCard.picture,
          details: supaCard.details || {},
          theme: supaCard.theme || {},
          links: supaCard.links || [],
          analyticsEnabled: supaCard.analytics_enabled || false,
          visitors: supaCard.visitors || 0,
          updated_at: new Date(),
          supabase_id: supaCard.id
        };
        
        if (existingCard) {
          console.log(chalk.yellow(`Карточка ${supaCard.username} уже существует в MongoDB. Обновление...`));
          
          // Обновляем существующую карточку
          await Card.updateOne(
            { supabase_id: supaCard.id }, 
            cardData
          );
        } else {
          // Создаем новую карточку
          cardData.created_at = supaCard.created_at || new Date();
          const newCard = new Card(cardData);
          await newCard.save();
        }
        
        stats.cards.migrated++;
        process.stdout.write(`\rМигрировано карточек: ${stats.cards.migrated}/${stats.cards.total}`);
      } catch (error) {
        console.error(chalk.red(`\nОшибка миграции карточки ${supaCard.username}: ${error.message}`));
        stats.cards.errors++;
      }
    }
    console.log(chalk.green(`\n✓ Миграция карточек завершена. Успешно: ${stats.cards.migrated}, Ошибки: ${stats.cards.errors}`));

    // Миграция аналитики
    console.log(chalk.blue("\n=== Миграция аналитики ==="));
    const { data: supaAnalytics, error: analyticsError } = await supabase
      .from('analytics')
      .select('*');

    if (analyticsError) {
      console.error(chalk.red(`Ошибка получения аналитики из Supabase: ${analyticsError.message}`));
      process.exit(1);
    }

    stats.analytics.total = supaAnalytics.length;
    console.log(`Найдено ${supaAnalytics.length} записей аналитики в Supabase`);

    for (const supaAnalytic of supaAnalytics) {
      try {
        // Найти соответствующую карточку
        const card = await Card.findOne({ supabase_id: supaAnalytic.card_id });
        
        if (!card) {
          console.log(chalk.yellow(`Карточка для записи аналитики ${supaAnalytic.id} не найдена. Пропуск...`));
          continue;
        }
        
        // Проверка существования записи аналитики в MongoDB
        const existingAnalytic = await Analytics.findOne({ supabase_id: supaAnalytic.id });
        
        if (!existingAnalytic) {
          // Создаем новую запись аналитики
          const newAnalytic = new Analytics({
            card_id: card._id.toString(),
            action: supaAnalytic.action,
            timestamp: supaAnalytic.created_at || new Date(),
            metadata: supaAnalytic.metadata || {},
            supabase_id: supaAnalytic.id
          });
          
          await newAnalytic.save();
          stats.analytics.migrated++;
        } else {
          stats.analytics.migrated++;
        }
        
        if (stats.analytics.migrated % 100 === 0) {
          process.stdout.write(`\rМигрировано аналитики: ${stats.analytics.migrated}/${stats.analytics.total}`);
        }
      } catch (error) {
        console.error(chalk.red(`\nОшибка миграции аналитики ${supaAnalytic.id}: ${error.message}`));
        stats.analytics.errors++;
      }
    }
    console.log(chalk.green(`\n✓ Миграция аналитики завершена. Успешно: ${stats.analytics.migrated}, Ошибки: ${stats.analytics.errors}`));

    // Запись результатов миграции
    await Migration.updateOne(
      { type: 'full' },
      { 
        type: 'full',
        completed: true,
        timestamp: new Date()
      },
      { upsert: true }
    );

    console.log(chalk.green("\n=== Миграция успешно завершена ==="));
    console.log(chalk.blue("\nСтатистика миграции:"));
    console.log(`Пользователи: Всего - ${stats.users.total}, Мигрировано - ${stats.users.migrated}, Ошибки - ${stats.users.errors}`);
    console.log(`Карточки: Всего - ${stats.cards.total}, Мигрировано - ${stats.cards.migrated}, Ошибки - ${stats.cards.errors}`);
    console.log(`Аналитика: Всего - ${stats.analytics.total}, Мигрировано - ${stats.analytics.migrated}, Ошибки - ${stats.analytics.errors}`);
    
  } catch (error) {
    console.error(chalk.red(`Критическая ошибка миграции: ${error.message}`));
    process.exit(1);
  } finally {
    // Закрытие соединения с MongoDB
    await mongoose.connection.close();
    console.log("Соединение с MongoDB закрыто");
  }
}

// Запуск процесса миграции
migrateData()
  .then(() => {
    console.log(chalk.blue("\n=== Следующие шаги ==="));
    console.log("1. Убедитесь, что все данные были правильно перенесены");
    console.log("2. Настройте переменные окружения для работы с MongoDB");
    console.log("3. Перезапустите приложение");
    console.log("4. Проверьте доступность данных в приложении");
    
    process.exit(0);
  })
  .catch(error => {
    console.error(chalk.red(`Ошибка выполнения миграции: ${error.message}`));
    process.exit(1);
  }); 