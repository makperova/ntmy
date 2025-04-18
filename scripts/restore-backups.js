/**
 * Скрипт для восстановления резервных копий файлов API
 * 
 * Запуск: node scripts/restore-backups.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const apiDir = path.join(process.cwd(), 'src/pages/api');
const backupSuffix = '.backup';
let restoredCount = 0;

/**
 * Рекурсивная функция для восстановления резервных копий
 */
function restoreBackups(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      restoreBackups(itemPath);
    } else if (item.endsWith(backupSuffix)) {
      const originalFilePath = itemPath.slice(0, -backupSuffix.length);
      fs.copyFileSync(itemPath, originalFilePath);
      console.log(chalk.green(`✓ Восстановлен файл: ${originalFilePath}`));
      restoredCount++;
    }
  });
}

console.log(chalk.blue('=== Восстановление резервных копий API файлов ==='));

// Проверка существования директории API
if (!fs.existsSync(apiDir)) {
  console.error(chalk.red(`Ошибка: Директория API не найдена: ${apiDir}`));
  process.exit(1);
}

// Запуск процесса восстановления
restoreBackups(apiDir);

// Вывод итоговой статистики
console.log(chalk.blue(`\n=== Восстановление завершено: ${restoredCount} файлов восстановлено ===`));

// Если файлы были восстановлены, выводим информацию о следующих шагах
if (restoredCount > 0) {
  console.log(chalk.cyan('\nСледующие шаги:'));
  console.log('1. Обновите файл .env, чтобы снова использовать Supabase:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key');
  console.log('2. Удалите или закомментируйте настройки MongoDB в next.config.js');
  console.log('3. Перезапустите приложение: npm run dev');
} else {
  console.log(chalk.yellow('\nПредупреждение: Резервные копии не найдены.'));
  console.log('Возможные причины:');
  console.log('- Миграция на MongoDB еще не выполнялась');
  console.log('- Резервные копии были удалены вручную');
  console.log('- Указан неправильный путь к API директории');
}

// Предложение удалить резервные копии
if (restoredCount > 0) {
  console.log(chalk.yellow('\nПримечание: Резервные копии файлов (.backup) все еще присутствуют в системе.'));
  console.log('Если вы хотите удалить их, запустите:');
  console.log('node scripts/cleanup-backups.js');
} 