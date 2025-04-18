/**
 * Скрипт для подготовки миграции с Supabase на новую систему аутентификации
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install @supabase/supabase-js mongoose dotenv
 * 2. Создайте .env.local файл с переменными окружения:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_KEY
 *    - MONGODB_URI
 *    - MIGRATION_API_KEY (для доступа к API миграции)
 * 3. Запустите скрипт: node scripts/prepare-for-migration.js
 */

// Импорт зависимостей
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Проверка наличия необходимых переменных окружения
const requiredEnvVars = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_KEY', 'MONGODB_URI', 'MIGRATION_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Отсутствуют необходимые переменные окружения: ${missingEnvVars.join(', ')}`);
  console.error('Пожалуйста, добавьте указанные переменные в файл .env.local');
  process.exit(1);
}

// Инициализация клиентов
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
); 