import { supabase } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { code, next = '/admin/dashboard' } = req.query;

  // Проверяем наличие кода
  if (!code) {
    return res.status(400).json({
      error: 'Код авторизации отсутствует'
    });
  }

  try {
    // Обмениваем код на сессию
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return res.status(400).json({ 
        error: error.message 
      });
    }

    // Перенаправляем на указанную страницу
    return res.redirect(next);
  } catch (error) {
    console.error('Ошибка при обработке OAuth callback:', error);
    return res.status(500).json({ 
      error: 'Ошибка при обработке аутентификации' 
    });
  }
} 