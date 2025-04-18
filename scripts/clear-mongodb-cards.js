/**
 * Скрипт для удаления всех карточек из MongoDB
 * ОПАСНО! Используйте только при необходимости повторной миграции
 * 
 * Использование:
 * 1. Установите необходимые зависимости: npm install mongoose dotenv
 * 2. Запустите скрипт: node scripts/clear-mongodb-cards.js
 */

// Импорт зависимостей
require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');

// Проверка наличия необходимых переменных окружения
if (!process.env.MONGODB_URI) {
  console.error('Отсутствует переменная окружения MONGODB_URI');
  process.exit(1);
}

// Создаем интерфейс для чтения ввода пользователя
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Основная функция удаления данных
async function clearMongoDBCards() {
  console.log('\n⚠️ ВНИМАНИЕ! ⚠️');
  console.log('Этот скрипт удалит ВСЕ карточки из MongoDB.');
  console.log('Рекомендуется сначала создать резервную копию данных с помощью скрипта backup-mongodb.js');
  console.log('Продолжить выполнение? (y/n)');
  
  rl.question('> ', async (answer) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Операция отменена.');
      rl.close();
      return;
    }
    
    try {
      // Подключаемся к MongoDB
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      console.log('Успешно подключились к MongoDB');
      
      // Регистрируем модель Card
      const CardSchema = new mongoose.Schema({}, { strict: false });
      const Card = mongoose.models.Card || mongoose.model('Card', CardSchema);
      
      // Получаем количество карточек перед удалением
      const cardCount = await Card.countDocuments();
      console.log(`Найдено ${cardCount} карточек в коллекции`);
      
      if (cardCount === 0) {
        console.log('Коллекция карточек уже пуста.');
        rl.close();
        await mongoose.connection.close();
        return;
      }
      
      console.log(`\nВы собираетесь удалить ${cardCount} карточек. Это действие невозможно отменить.`);
      console.log('Введите DELETE для подтверждения:');
      
      rl.question('> ', async (confirmation) => {
        if (confirmation !== 'DELETE') {
          console.log('Операция отменена.');
          rl.close();
          await mongoose.connection.close();
          return;
        }
        
        // Удаляем все карточки
        const result = await Card.deleteMany({});
        
        console.log(`\n✅ Удалено ${result.deletedCount} карточек`);
        console.log('Операция завершена успешно.');
        
        // Проверяем, остались ли карточки
        const remainingCount = await Card.countDocuments();
        if (remainingCount > 0) {
          console.log(`⚠️ Внимание: в коллекции осталось ${remainingCount} карточек.`);
        } else {
          console.log('✅ Коллекция карточек полностью очищена.');
        }
        
        rl.close();
        await mongoose.connection.close();
        console.log('Соединение с MongoDB закрыто');
      });
      
    } catch (error) {
      console.error(`❌ Ошибка при очистке коллекции: ${error.message}`);
      rl.close();
      process.exit(1);
    }
  });
}

// Запускаем функцию удаления
clearMongoDBCards(); 