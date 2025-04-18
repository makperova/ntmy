const { createClient } = require('@supabase/supabase-js');

// Настройки подключения к Supabase
const supabaseUrl = 'https://phfdwwehrkajvlsihqgj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZmR3d2VocmthanZsc2locWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM1MzAwOTYsImV4cCI6MjA1OTEwNjA5Nn0.HqebVfmwhOBvbSBIM-MxeCsGLozvDuplf_MjFZq7By8';

// Инициализация клиента Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Функция проверки базы данных
async function checkDatabase() {
  try {
    console.log('Проверка таблицы cards...');
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*');
    
    if (cardsError) {
      console.error('Ошибка при получении данных из таблицы cards:', cardsError);
    } else {
      console.log(`Найдено ${cardsData.length} карточек`);
      
      if (cardsData.length > 0) {
        console.log('Имена пользователей в карточках:', cardsData.map(card => card.username).join(', '));
        console.log('Первая карточка:', JSON.stringify(cardsData[0], null, 2));
      } else {
        console.log('В таблице cards нет данных');
      }
    }
    
    // Проверяем структуру таблицы cards
    console.log('\nПроверка структуры таблицы cards...');
    const { data: cardStructure, error: structureError } = await supabase
      .from('cards')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('Ошибка при получении структуры таблицы cards:', structureError);
    } else if (cardStructure && cardStructure.length > 0) {
      console.log('Структура таблицы cards (поля):', Object.keys(cardStructure[0]).join(', '));
    } else {
      // Если данных нет, пробуем получить структуру через metadata API
      console.log('В таблице нет данных, получить структуру напрямую не удалось');
    }
    
    // Проверяем таблицу profiles
    console.log('\nПроверка таблицы profiles...');
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(3);
    
    if (profilesError) {
      console.error('Ошибка при получении данных из таблицы profiles:', profilesError);
    } else {
      console.log(`Найдено ${profilesData.length} профилей`);
      if (profilesData.length > 0) {
        console.log('Пример профиля:', JSON.stringify(profilesData[0], null, 2));
      }
    }
    
    // Пробуем создать тестовую карточку
    console.log('\nСоздание тестовой карточки...');
    // Находим существующий user_id из профилей
    let userId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'; // Значение по умолчанию
    
    if (profilesData && profilesData.length > 0 && profilesData[0].user_id) {
      userId = profilesData[0].user_id;
      console.log(`Использую существующий user_id из профиля: ${userId}`);
    }
    
    const testCardData = {
      name: 'Test Card',
      username: 'testcard-' + Date.now(),
      job_title: 'Developer',
      company: 'Test Company',
      template: 'minimal',
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Данные тестовой карточки:', testCardData);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('cards')
      .insert([testCardData])
      .select();
    
    if (insertError) {
      console.error('Ошибка при создании тестовой карточки:', insertError);
    } else {
      console.log('Тестовая карточка успешно создана:', insertResult);
    }
    
  } catch (error) {
    console.error('Ошибка при выполнении проверки:', error);
  }
}

// Запускаем проверку
checkDatabase().then(() => console.log('Проверка завершена')); 