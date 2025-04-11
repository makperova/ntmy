import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
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

// Просто реэкспортируем клиент для совместимости
export { supabase }; 