#!/usr/bin/env node

/**
 * Скрипт для автоматического исправления компонентов Link во всем проекте.
 * Преобразует старый формат в новый формат Next.js 13+
 * 
 * Пример преобразования:
 * Старый формат:
 * <Link href="/path">
 *   <a className="some-class">Link Text</a>
 * </Link>
 * 
 * Новый формат:
 * <Link href="/path" className="some-class">
 *   Link Text
 * </Link>
 * 
 * Использование:
 * node scripts/fix-link-components.js
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Папки для поиска файлов
const searchDirs = [
  'src/pages',
  'src/components'
];

// Регулярное выражение для поиска компонентов Link со вложенным тегом a
const linkWithATagRegex = /<Link\s+([^>]*?)href=(['"])([^'"]*?)\2([^>]*?)>\s*?<a\s+([^>]*?)>([\s\S]*?)<\/a>\s*?<\/Link>/g;

// Функция для замены найденных компонентов Link
function replaceLinks(content) {
  return content.replace(linkWithATagRegex, (match, beforeHref, quoteType, href, afterHref, aProps, children) => {
    // Извлекаем className из тега a
    const classNameMatch = aProps.match(/className=(['"])(.*?)\1/);
    const className = classNameMatch ? classNameMatch[2] : '';
    
    // Создаем новый компонент Link с классом из тега a
    const classNameProp = className ? ` className=${quoteType}${className}${quoteType}` : '';
    return `<Link href=${quoteType}${href}${quoteType}${beforeHref}${afterHref}${classNameProp}>\n  ${children}\n</Link>`;
  });
}

// Функция для обработки всех файлов в указанной директории
function processDirectory(dir) {
  const fullPath = path.join(process.cwd(), dir);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`Директория не существует: ${fullPath}`);
    return;
  }
  
  // Получаем список файлов в директории
  const files = fs.readdirSync(fullPath, { withFileTypes: true });
  
  files.forEach(file => {
    const filePath = path.join(fullPath, file.name);
    
    if (file.isDirectory()) {
      // Рекурсивно обрабатываем поддиректории
      processDirectory(path.join(dir, file.name));
    } else if (file.name.match(/\.(tsx|jsx|js|ts)$/)) {
      // Обрабатываем только файлы с React компонентами
      console.log(`Обработка файла: ${filePath}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const newContent = replaceLinks(content);
        
        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent, 'utf8');
          console.log(`✅ Исправлен файл: ${filePath}`);
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке файла ${filePath}:`, error);
      }
    }
  });
}

// Основная функция
function main() {
  console.log('Начинаем исправление компонентов Link в проекте...');
  
  // Обрабатываем все указанные директории
  searchDirs.forEach(dir => {
    console.log(`\nОбработка директории: ${dir}`);
    processDirectory(dir);
  });
  
  console.log('\n✨ Исправление компонентов Link завершено!');
  console.log('Запускаем проверку кода линтером...');
  
  // Запускаем линтер для проверки результатов
  exec('npm run lint', (error, stdout, stderr) => {
    if (error) {
      console.error(`\n❌ Ошибка при запуске линтера: ${error.message}`);
      return;
    }
    
    if (stderr) {
      console.error(`\n⚠️ Предупреждения линтера: ${stderr}`);
      return;
    }
    
    console.log(`\n✅ Проверка линтером успешно пройдена!`);
  });
}

// Запускаем скрипт
main(); 