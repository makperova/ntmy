import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Проверяем, что запрос пришел от Builder.io
  // В реальном приложении вы должны проверить секретный токен
  // для подтверждения, что запрос пришел от Builder.io
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { type, data } = req.body;

    // Обрабатываем различные типы вебхуков
    switch (type) {
      case 'content.published':
        // Контент опубликован, можно инвалидировать кеш и т.д.
        console.log('Content published:', data);
        break;
      
      case 'content.unpublished':
        // Контент снят с публикации
        console.log('Content unpublished:', data);
        break;
      
      case 'content.deleted':
        // Контент удален
        console.log('Content deleted:', data);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    // Успешный ответ
    return res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ message: 'Error processing webhook' });
  }
} 