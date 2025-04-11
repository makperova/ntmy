import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import * as vCard from 'vcf';

// Инициализация Prisma клиента
const prisma = new PrismaClient();

/**
 * API эндпоинт для генерации VCF файла с контактом из профиля
 * @param req Запрос с ID профиля
 * @param res Ответ с VCF файлом
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Разрешаем только GET запросы
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { profileId } = req.query;

    // Проверка наличия обязательного параметра
    if (!profileId || typeof profileId !== 'string') {
      return res.status(400).json({ message: 'Missing required parameter: profileId' });
    }

    // Получение данных профиля из базы
    const profile = await prisma.profile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        socialLinks: {
          where: { isActive: true },
        },
      },
    });

    // Если профиль не найден
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Создание vCard
    const card = new vCard();
    
    // Добавление основных полей
    card.add('FN', profile.name);
    
    if (profile.role) {
      card.add('TITLE', profile.role);
    }
    
    if (profile.company) {
      card.add('ORG', profile.company);
    }
    
    if (profile.email) {
      card.add('EMAIL', { value: profile.email, type: 'WORK' });
    }
    
    if (profile.phone) {
      card.add('TEL', { value: profile.phone, type: 'WORK' });
    }
    
    // Добавление URL профиля
    const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/profile/${profile.user.username}`;
    card.add('URL', profileUrl);
    
    // Добавление фото, если оно есть
    if (profile.image) {
      // Примечание: в реальной реализации нужно загрузить изображение и конвертировать его в base64
      // card.add('PHOTO', { value: base64Image, encoding: 'b', type: 'JPEG' });
    }
    
    // Добавление социальных сетей как дополнительные URL
    profile.socialLinks.forEach((link, index) => {
      card.add(`X-SOCIALPROFILE;type=${link.platform}`, link.url);
    });
    
    // Генерация VCF содержимого
    const vcfContent = card.toString();
    
    // Отправка файла
    res.setHeader('Content-Type', 'text/vcard');
    res.setHeader('Content-Disposition', `attachment; filename="${profile.name.replace(/ /g, '_')}.vcf"`);
    
    return res.status(200).send(vcfContent);
  } catch (error: any) {
    console.error('Error generating VCF:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error',
      error: error.message 
    });
  } finally {
    await prisma.$disconnect();
  }
} 