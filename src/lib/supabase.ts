import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Явно указываем URL из переменных окружения
const supabaseUrl = 'https://phfdwwehrkajvlsihqgj.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Проверка наличия ключа
if (!supabaseKey) {
  console.error('Missing Supabase key environment variable');
}

// Функция для создания клиента Supabase с кастомным токеном
// Используется для серверной стороны
export const createSupabaseClient = (supabaseAccessToken?: string) => {
  try {
    if (supabaseAccessToken && supabaseKey) {
      return createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            Authorization: `Bearer ${supabaseAccessToken}`
          }
        }
      });
    }
    return supabase; // возвращаем основной клиент (или заглушку, если он недоступен)
  } catch (error) {
    console.error('Error creating custom Supabase client:', error);
    return supabase; // возвращаем основной клиент как запасной вариант
  }
};

// Функция для получения серверного клиента Supabase
export const getServiceSupabase = () => {
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_KEY || supabaseKey;
    if (!serviceKey) {
      console.error('Missing Supabase service key');
      return supabase; // возвращаем основной клиент как запасной вариант
    }
    return createClient(supabaseUrl, serviceKey);
  } catch (error) {
    console.error('Error creating service Supabase client:', error);
    return supabase; // возвращаем основной клиент как запасной вариант
  }
};

// Просто реэкспортируем клиент для совместимости
export { supabase };