import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// Инициализация Prisma клиента
const prisma = new PrismaClient();

/**
 * API эндпоинт для записи посещения профиля в аналитику
 * @param req Данные запроса с информацией о посещении
 * @param res Ответ API
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { profileId, userId, deviceType, referer } = req.body;

    // Проверка наличия обязательных полей
    if (!profileId || !userId) {
      return res.status(400).json({ message: 'Missing required fields: profileId and userId are required' });
    }

    // Получение IP-адреса посетителя
    const ipAddress = getIpAddress(req);
    
    // Получение User-Agent
    const userAgent = req.headers['user-agent'] || '';

    // Запись данных о посещении в базу
    const analyticsRecord = await prisma.analyticsData.create({
      data: {
        userId,
        profileId,
        ipAddress,
        userAgent,
        referer: referer || null,
        deviceType: deviceType || null,
        visitDate: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      id: analyticsRecord.id,
    });
  } catch (error: any) {
    console.error('Error recording visit:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error',
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Получение IP-адреса из запроса
 * @param req Запрос
 * @returns IP-адрес посетителя
 */
function getIpAddress(req: NextApiRequest): string {
  // Проверка различных заголовков для определения IP
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : forwarded[0]
    : req.socket.remoteAddress;
  
  return ip || '0.0.0.0';
} 