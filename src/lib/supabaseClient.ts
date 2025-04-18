import { createClient } from '@supabase/supabase-js';

// Используем явно заданный URL для Supabase
const supabaseUrl = 'https://phfdwwehrkajvlsihqgj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Создаем заглушку для Supabase клиента
const createDummyClient = () => {
  console.warn('Создана заглушка Supabase клиента из-за отсутствия ключа');
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: { message: 'Supabase client not initialized properly' } })
        }),
        error: { message: 'Supabase client not initialized properly' }
      }),
      error: { message: 'Supabase client not initialized properly' }
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ 
        error: { message: 'Supabase аутентификация отключена. Используйте MongoDB аутентификацию.' } 
      }),
      signInWithOAuth: () => Promise.resolve({ 
        error: { message: 'Supabase аутентификация отключена. Используйте MongoDB аутентификацию.' } 
      }),
      signUp: () => Promise.resolve({ 
        error: { message: 'Supabase аутентификация отключена. Используйте MongoDB аутентификацию.' } 
      }),
      resetPasswordForEmail: () => Promise.resolve({ 
        error: { message: 'Supabase аутентификация отключена. Используйте MongoDB аутентификацию.' } 
      }),
      updateUser: () => Promise.resolve({ 
        error: { message: 'Supabase аутентификация отключена. Используйте MongoDB аутентификацию.' } 
      })
    }
  };
};

// Создаем клиент или заглушку в зависимости от наличия ключа
let supabaseInstance;

if (!supabaseAnonKey) {
  console.error('Missing Supabase Anon Key. Please check your environment variables.');
  supabaseInstance = createDummyClient();
} else {
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
    supabaseInstance = createDummyClient();
  }
}

export const supabase = supabaseInstance; 