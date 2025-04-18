/**
 * Скрипт для удаления резервных копий файлов API
 * 
 * Запуск: node scripts/cleanup-backups.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const readline = require('readline');

const apiDir = path.join(process.cwd(), 'src/pages/api');
const backupSuffix = '.backup';
let removedCount = 0;

// Создание интерфейса для чтения ввода пользователя
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Рекурсивная функция для удаления резервных копий
 */
function removeBackups(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);
    
    if (stats.isDirectory()) {
      removeBackups(itemPath);
    } else if (item.endsWith(backupSuffix)) {
      fs.unlinkSync(itemPath);
      console.log(chalk.green(`✓ Удален файл: ${itemPath}`));
      removedCount++;
    }
  });
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

/**
 * Основная функция
 */
async function main() {
  console.log(chalk.blue('=== Удаление резервных копий API файлов ==='));
  
  // Проверка существования директории API
  if (!fs.existsSync(apiDir)) {
    console.error(chalk.red(`Ошибка: Директория API не найдена: ${apiDir}`));
    process.exit(1);
  }
  
  // Сначала подсчитаем количество резервных копий
  let backupCount = 0;
  
  function countBackups(dirPath) {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        countBackups(itemPath);
      } else if (item.endsWith(backupSuffix)) {
        backupCount++;
      }
    });
  }
  
  countBackups(apiDir);
  
  if (backupCount === 0) {
    console.log(chalk.yellow('Резервные копии не найдены.'));
    rl.close();
    return;
  }
  
  console.log(`Найдено ${backupCount} резервных копий файлов.`);
  
  // Запрашиваем подтверждение пользователя
  const answer = await askQuestion(chalk.yellow(`Вы действительно хотите удалить все ${backupCount} резервных копий? (y/n): `));
  
  if (answer.toLowerCase() === 'y') {
    // Запуск процесса удаления
    removeBackups(apiDir);
    
    // Вывод итоговой статистики
    console.log(chalk.blue(`\n=== Удаление завершено: ${removedCount} файлов удалено ===`));
  } else {
    console.log(chalk.cyan('Операция отменена.'));
  }
  
  rl.close();
}

main().catch(err => {
  console.error(chalk.red('Непредвиденная ошибка:', err));
  process.exit(1);
}); 