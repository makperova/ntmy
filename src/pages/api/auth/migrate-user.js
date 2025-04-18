import { connectToDatabase } from '../../../lib/mongodb';
import mongoose from 'mongoose';

// Схема для таблицы миграции пользователей
const UserMigrationSchema = new mongoose.Schema({
  old_id: { 
    type: String, 
    required: true,
    index: true
  },
  new_id: { 
    type: String, 
    required: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    default: ''
  },
  migrated_at: {
    type: Date,
    default: Date.now
  }
});

/**
 * API для миграции пользователей с Supabase на новую систему аутентификации
 * POST - регистрация нового ID пользователя
 * GET - получение ID пользователя по старому ID или email
 */
export default async function handler(req, res) {
  try {
    // Проверка авторизации - API ключ должен совпадать
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.MIGRATION_API_KEY && 
        apiKey !== 'ntmy-migration-temp-key') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Подключение к базе данных
    await connectToDatabase();
    
    // Регистрируем модель для миграции пользователей
    const UserMigration = mongoose.models.UserMigration || 
                         mongoose.model('UserMigration', UserMigrationSchema);
    
    // Обработка GET запроса - получение данных о миграции
    if (req.method === 'GET') {
      const { old_id, email } = req.query;
      
      if (!old_id && !email) {
        return res.status(400).json({ error: 'Old ID or email is required' });
      }
      
      let query = {};
      if (old_id) {
        query = { old_id };
      } else if (email) {
        query = { email };
      }
      
      const userMigration = await UserMigration.findOne(query);
      
      if (!userMigration) {
        return res.status(404).json({ 
          error: 'User migration not found',
          message: 'This user has not been migrated yet'
        });
      }
      
      return res.status(200).json(userMigration);
    }
    
    // Обработка POST запроса - регистрация миграции
    if (req.method === 'POST') {
      const { old_id, new_id, email, name } = req.body;
      
      if (!old_id || !new_id || !email) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['old_id', 'new_id', 'email']
        });
      }
      
      // Проверяем, существует ли уже миграция для этого пользователя
      const existingMigration = await UserMigration.findOne({ 
        $or: [{ old_id }, { email }] 
      });
      
      if (existingMigration) {
        // Обновляем существующую запись
        existingMigration.new_id = new_id;
        if (name) existingMigration.name = name;
        existingMigration.migrated_at = new Date();
        
        await existingMigration.save();
        
        return res.status(200).json({
          message: 'User migration updated successfully',
          migration: existingMigration
        });
      }
      
      // Создаем новую запись миграции
      const userMigration = new UserMigration({
        old_id,
        new_id,
        email,
        name: name || '',
        migrated_at: new Date()
      });
      
      await userMigration.save();
      
      return res.status(201).json({
        message: 'User migration registered successfully',
        migration: userMigration
      });
    }
    
    // Для других методов возвращаем ошибку
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
    
  } catch (error) {
    console.error('Error in user migration API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
} 