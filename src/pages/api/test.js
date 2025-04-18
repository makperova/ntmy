// Простой API-маршрут для проверки доступности сервера
export default function handler(req, res) {
  res.status(200).json({ success: true, message: 'API работает!' });
} 