import { createClient } from '@supabase/supabase-js';

// Используем явно заданный URL для Supabase
const supabaseUrl = 'https://phfdwwehrkajvlsihqgj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Убеждаемся, что ключ существует
if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key. Please check your environment variables.');
}

// Создаем клиент с обработкой ошибок
let supabaseInstance;

try {
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  console.log('Supabase client initialized successfully with URL:', supabaseUrl);
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Создаем заглушку, чтобы предотвратить сбой приложения
  supabaseInstance = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => ({ data: null, error: { message: 'Supabase client not initialized properly' } })
        }),
        error: { message: 'Supabase client not initialized properly' }
      }),
      error: { message: 'Supabase client not initialized properly' }
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
}

export const supabase = supabaseInstance; 