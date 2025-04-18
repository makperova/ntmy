/**
 * Скрипт для обновления API роутов с Supabase на MongoDB
 * 
 * Запуск: node scripts/update-api-routes.js
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const API_DIR = path.join(process.cwd(), 'src', 'pages', 'api');

// Проверка директории API
if (!fs.existsSync(API_DIR)) {
  console.error(chalk.red(`Директория API не найдена: ${API_DIR}`));
  process.exit(1);
}

console.log(chalk.blue("=== Начало обновления API роутов с Supabase на MongoDB ==="));

// Список маппингов для замены
const replacements = [
  {
    pattern: /import { createClient } from '@supabase\/supabase-js';/g,
    replacement: "import { connectDB } from '@/lib/mongodb';\nimport mongoose from 'mongoose';"
  },
  {
    pattern: /const supabase = createClient\(\s*process\.env\.SUPABASE_URL[^)]*,\s*process\.env\.SUPABASE_KEY[^)]*\);/g,
    replacement: "await connectDB();"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('cards'\)\s*\.\s*select\([^)]*\)/g,
    replacement: "const data = await mongoose.model('Card').find({})"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('cards'\)\s*\.\s*insert\(\s*([^)]*)\)/g,
    replacement: "const data = await mongoose.model('Card').create($1)"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('cards'\)\s*\.\s*update\(\s*([^)]*)\)\s*\.\s*match\(\s*([^)]*)\)/g,
    replacement: "const data = await mongoose.model('Card').findOneAndUpdate($2, $1, { new: true })"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('cards'\)\s*\.\s*delete\(\)\s*\.\s*match\(\s*([^)]*)\)/g,
    replacement: "const data = await mongoose.model('Card').findOneAndDelete($1)"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('users'\)\s*\.\s*select\(\s*([^)]*)\)/g,
    replacement: "const data = await mongoose.model('User').find({}, $1)"
  },
  {
    pattern: /const { data, error } = await supabase\s*\.\s*from\('analytics'\)\s*\.\s*insert\(\s*([^)]*)\)/g,
    replacement: "const data = await mongoose.model('Analytics').create($1)"
  },
  {
    pattern: /if\s*\(\s*error\s*\)\s*\{\s*return\s*res\.status\(500\)\.json\(\s*\{\s*error:\s*error\.message\s*\}\s*\)\s*;?\s*\}/g,
    replacement: "// MongoDB error handling already done via try/catch"
  },
  {
    pattern: /if\s*\(\s*error\s*\)\s*\{\s*console\.error\(error\);\s*return\s*res\.status\(500\)\.json\(\s*\{\s*error:\s*error\.message\s*\}\s*\)\s*;?\s*\}/g,
    replacement: "// MongoDB error handling already done via try/catch"
  }
];

// Функция для обработки файла
function processFile(filePath) {
  console.log(`Обработка файла: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Заменяем импорты и API-вызовы
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Добавляем обработку ошибок, если её нет
    if (!content.includes('try {') && !content.includes('catch (error)')) {
      const handlerStart = content.indexOf('export default async function handler');
      if (handlerStart !== -1) {
        const openBrace = content.indexOf('{', handlerStart);
        if (openBrace !== -1) {
          const functionBody = content.substring(openBrace + 1);
          const newFunctionBody = `{
  try {${functionBody.replace(/return\s+res/, '\n    return res')}
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
}`;
          content = content.substring(0, openBrace) + newFunctionBody;
        }
      }
    }
    
    // Проверяем, есть ли изменения
    if (content !== originalContent) {
      // Создаем бэкап файла
      const backupPath = `${filePath}.bak`;
      fs.writeFileSync(backupPath, originalContent);
      console.log(chalk.yellow(`  Создан бэкап: ${backupPath}`));
      
      // Записываем обновленный файл
      fs.writeFileSync(filePath, content);
      console.log(chalk.green(`  Файл обновлен: ${filePath}`));
      return true;
    } else {
      console.log(chalk.yellow(`  Нет изменений: ${filePath}`));
      return false;
    }
  } catch (error) {
    console.error(chalk.red(`  Ошибка обработки файла ${filePath}: ${error.message}`));
    return false;
  }
}

// Рекурсивное сканирование директории API
function scanDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath);
  let updatedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(directoryPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Рекурсивно сканируем поддиректорию
      updatedFiles += scanDirectory(filePath);
    } else if (stats.isFile() && (file.endsWith('.js') || file.endsWith('.ts'))) {
      // Обрабатываем JS/TS файлы
      if (processFile(filePath)) {
        updatedFiles++;
      }
    }
  }
  
  return updatedFiles;
}

// Создаем lib/mongodb.js, если его нет
const mongodbLibPath = path.join(process.cwd(), 'src', 'lib', 'mongodb.js');
if (!fs.existsSync(path.dirname(mongodbLibPath))) {
  fs.mkdirSync(path.dirname(mongodbLibPath), { recursive: true });
}

if (!fs.existsSync(mongodbLibPath)) {
  console.log(chalk.blue(`Создание файла подключения к MongoDB: ${mongodbLibPath}`));
  
  const mongodbLibContent = `import mongoose from 'mongoose';

// MongoDB схемы
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

// Кэш для моделей mongoose
const models = {};

/**
 * Подключение к MongoDB
 */
export async function connectDB() {
  if (mongoose.connections[0].readyState) {
    // Уже подключено
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Подключено к MongoDB');
    
    // Инициализация моделей при необходимости
    if (!models.User) {
      // Регистрация моделей
      models.User = mongoose.models.User || mongoose.model('User', UserSchema);
      models.Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
      models.Analytics = mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
    }
  } catch (error) {
    console.error('Ошибка подключения к MongoDB:', error);
    throw error;
  }
}

export default connectDB;
`;
  
  fs.writeFileSync(mongodbLibPath, mongodbLibContent);
  console.log(chalk.green(`Файл создан: ${mongodbLibPath}`));
}

// Начинаем сканирование и обновление
const updatedFiles = scanDirectory(API_DIR);

console.log(chalk.green(`\n=== Обновление завершено ===`));
console.log(`Обновлено файлов: ${updatedFiles}`);
console.log(chalk.blue("\n=== Следующие шаги ==="));
console.log("1. Проверьте обновленные API роуты");
console.log("2. Протестируйте API с MongoDB");
console.log("3. Если всё работает корректно, удалите файлы .bak");
console.log("4. В случае проблем, восстановите файлы из бэкапов (.bak)"); 