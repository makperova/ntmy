import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Явно указываем URL из переменных окружения
const supabaseUrl = 'https://phfdwwehrkajvlsihqgj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Проверка наличия ключа
if (!supabaseKey) {
  console.error('Missing Supabase key environment variable');
  // Не выбрасываем ошибку, которая может привести к краху приложения
  // вместо этого создаем заглушку, которая будет возвращать специальную ошибку
}

// Создаем клиент Supabase для использования на клиентской стороне
export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// Функция для создания клиента Supabase с кастомным токеном
// Используется для серверной стороны
export const createSupabaseClient = (supabaseAccessToken?: string) => {
  if (supabaseAccessToken) {
    return createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`
        }
      }
    });
  }
  return supabaseClient;
};

// Функция для получения серверного клиента Supabase
export const getServiceSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey;
  return createClient(supabaseUrl, serviceKey);
};

// Создаем обертку-прокси для клиента supabase, чтобы перехватывать ошибки
export const supabaseWithErrorHandling = new Proxy(supabase, {
  get(target, prop) {
    // Получаем значение свойства
    const value = target[prop];
    
    // Если это не функция, просто возвращаем значение
    if (typeof value !== 'function') {
      return value;
    }
    
    // Оборачиваем функцию для перехвата ошибок
    return function(...args) {
      try {
        return value.apply(target, args);
      } catch (error) {
        console.error(`Error in Supabase operation ${String(prop)}:`, error);
        // Возвращаем результат с ошибкой, чтобы код мог корректно обработать ошибку
        return { data: null, error: { message: 'Supabase client error', originalError: error } };
      }
    };
  }
});

// Просто реэкспортируем клиент для совместимости
export { supabase };