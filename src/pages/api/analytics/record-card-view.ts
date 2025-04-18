import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../../lib/supabase';

/**
 * API endpoint for recording card views in analytics
 * @param req Request containing cardId in the body
 * @param res Response with success status or error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { cardId } = req.body;

    // Check for required fields
    if (!cardId) {
      return res.status(400).json({ message: 'Missing required field: cardId' });
    }

    // Get additional data for analytics
    const userAgent = req.headers['user-agent'] || '';
    const referer = req.headers.referer || '';
    const ip = getIpAddress(req);

    // First, increment the view count in the cards table
    const { error: updateError } = await supabase
      .from('cards')
      .update({ 
        view_count: supabase.rpc('increment_view_count'), 
        last_viewed_at: new Date()
      })
      .eq('id', cardId);

    if (updateError) {
      console.error('Error updating card view count:', updateError);
      return res.status(500).json({ 
        message: 'Failed to update card view count',
        error: updateError.message
      });
    }

    // Then, record the view in the card_views table for detailed analytics
    const { data, error } = await supabase
      .from('card_views')
      .insert([
        { 
          card_id: cardId,
          ip_address: ip,
          user_agent: userAgent,
          referer: referer
        }
      ]);

    if (error) {
      console.error('Error recording card view:', error);
      return res.status(500).json({ 
        message: 'Failed to record card view in analytics',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      id: data?.[0]?.id || null,
      message: 'Card view recorded successfully'
    });
  } catch (error: any) {
    console.error('Unexpected error recording card view:', error);
    return res.status(500).json({ 
      message: 'Internal Server Error',
      error: error.message 
    });
  }
}

/**
 * Get IP address from request
 * @param req The NextApiRequest
 * @returns IP address string
 */
function getIpAddress(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? typeof forwarded === 'string'
      ? forwarded.split(',')[0]
      : forwarded[0]
    : req.socket.remoteAddress;
  
  return ip || '0.0.0.0';
} 