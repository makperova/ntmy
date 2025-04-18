/**
 * Скрипт для создания резервной копии коллекции Card из MongoDB
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Запустите скрипт: node scripts/backup-mongodb.js
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
const CardSchema = new mongoose.Schema({}, { strict: false });

// Основная функция резервного копирования
async function backupMongoDBCards() {
  console.log('Создание резервной копии карточек из MongoDB...');
  
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Успешно подключились к MongoDB');
    
    // Регистрируем модель Card
    const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
    
    // Получаем все карточки из MongoDB
    const cards = await Card.find({}).lean();
    
    console.log(`Получено ${cards.length} карточек из MongoDB`);
    
    // Создаем директорию для резервных копий, если она не существует
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Формируем имя файла с резервной копией, включая текущую дату и время
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupPath = path.join(backupDir, `mongodb_cards_backup_${timestamp}.json`);
    
    // Записываем данные в файл
    fs.writeFileSync(backupPath, JSON.stringify(cards, null, 2));
    
    console.log(`Резервная копия успешно создана: ${backupPath}`);
    
  } catch (error) {
    console.error(`Ошибка при создании резервной копии: ${error.message}`);
    process.exit(1);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.connection.close();
    console.log('Соединение с MongoDB закрыто');
  }
}

// Запускаем функцию резервного копирования
backupMongoDBCards(); 