const mongoose = require('mongoose');

const CardSchema = new mongoose.Schema({
  user_id: { 
    type: String, 
    required: true,
    index: true
  },
  // Поле email для связи с пользователем и контактной информации
  email: {
    type: String,
    index: true // для быстрого поиска по email
  },
  // Поле user_email для разделения email пользователя и контактного email
  user_email: {
    type: String,
    index: true // для быстрого поиска по email пользователя
  },
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
  job_title: String,
  company: String,
  bio: {
    type: String,
    default: '',
  },
  phone: String,
  linkedin_url: String,
  whatsapp_url: String,
  telegram_url: String,
  image_url: String,
  template: {
    type: String,
    default: 'minimal'
  },
  view_count: {
    type: Number,
    default: 0
  },
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

// Создаем составной индекс для более быстрого поиска
CardSchema.index({ user_id: 1, username: 1 });
CardSchema.index({ user_email: 1, username: 1 });

// Проверка email при сохранении
CardSchema.pre('save', function(next) {
  // Если контактный email не задан, но есть email пользователя, используем его
  if (!this.email && this.user_email) {
    this.email = this.user_email;
  }
  next();
});

module.exports = mongoose.models.Card || mongoose.model('Card', CardSchema); 