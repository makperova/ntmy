import mongoose from 'mongoose';

/**
 * Схема для карточки в MongoDB
 * Соответствует структуре, которая была в таблице cards Supabase
 */
const CardSchema = new mongoose.Schema({
  // Информация о пользователе
  user_id: { 
    type: String, 
    required: true,
    index: true // Индекс для быстрого поиска
  },
  
  // Основная информация
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
  },
  
  // Профессиональная информация
  job_title: String,
  company: String,
  bio: {
    type: String,
    default: '',
  },
  
  // Контактная информация
  email: String,
  phone: String,
  
  // Социальные сети
  linkedin_url: String,
  whatsapp_url: String,
  telegram_url: String,
  
  // Настройки карточки
  image_url: String,
  template: {
    type: String,
    default: 'minimal'
  },
  
  // Статистика
  view_count: {
    type: Number,
    default: 0
  },
  
  // Метаданные
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: '',
  },
  links: {
    type: [{
      title: String,
      url: String,
      icon: String,
    }],
    default: [],
  },
  socialLinks: {
    type: Map,
    of: String,
    default: {},
  },
  theme: {
    type: String,
    default: 'default',
  },
  isPublic: {
    type: Boolean,
    default: true,
  },
});

// Update the updatedAt field when document is modified
CardSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Middleware перед обновлением
CardSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

// Если модель уже скомпилирована, используем ее, иначе компилируем новую
export default mongoose.models.Card || mongoose.model('Card', CardSchema); 