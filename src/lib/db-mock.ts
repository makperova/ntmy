/**
 * Утилита для подавления ошибок подключения к базе данных в режиме разработки.
 * Вместо реальных запросов может возвращать моковые данные.
 */

export const mockDBConnection = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🔧 Настройка моков для базы данных в режиме разработки');

  // Перехватываем и подавляем некритичные ошибки подключения к БД
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Подавляем ошибки подключения к БД
    const message = args[0]?.toString() || '';
    if (
      message.includes('database connection') ||
      message.includes('supabase') ||
      message.includes('connection error')
    ) {
      console.log('🔶 Подавлена ошибка БД в режиме разработки:', message.slice(0, 100) + '...');
      return;
    }
    
    // Все остальные ошибки выводим как обычно
    originalConsoleError.apply(console, args);
  };
}; 