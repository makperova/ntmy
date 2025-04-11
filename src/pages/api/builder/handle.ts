import { NextApiRequest, NextApiResponse } from 'next';
import { builder } from '@builder.io/react';

// Инициализация с API-ключом
builder.init('81bfbddd');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { model, id } = req.query;

  if (req.method === 'GET') {
    try {
      const modelName = Array.isArray(model) ? model[0] : model;
      const contentId = Array.isArray(id) ? id[0] : id;

      if (!modelName) {
        return res.status(400).json({ error: 'Model name is required' });
      }

      // Получаем контент из Builder.io
      const content = await builder
        .get(modelName as string, {
          ...(contentId && { id: contentId }),
          options: { includeUnpublished: true }
        })
        .promise();

      return res.status(200).json(content || null);
    } catch (error) {
      console.error('Builder fetch error', error);
      return res.status(500).json({ error: 'Error fetching Builder.io content' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
} 