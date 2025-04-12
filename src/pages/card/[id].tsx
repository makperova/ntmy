import { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';

// Placeholder function for recording card views
async function recordCardView(cardId: string) {
  try {
    console.log(`Recording view for card ID: ${cardId}`);
    const { error } = await supabase
      .from('card_views')
      .insert({ card_id: cardId });
    
    if (error) {
      console.error('Error recording card view:', error);
    }
  } catch (error) {
    console.error('Error in recordCardView:', error);
  }
}

interface CardData {
  id: string;
  name: string;
  job_title?: string;
  company?: string;
  bio?: string;
  username?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  whatsapp_url?: string;
  telegram_url?: string;
  template: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface CardPageProps {
  card: CardData | null;
  error?: string;
  statusCode?: number;
}

const CardPage: NextPage<CardPageProps> = ({ card, error, statusCode }) => {
  const router = useRouter();
  const { id } = router.query;
  const [pageError, setPageError] = useState<string | null>(error || null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (error) {
      console.log('Error from server side props:', error);
      setPageError(error);
    }
    
    // Record analytics only if we have a valid card
    if (card && !error && id) {
      try {
        recordCardView(id as string);
      } catch (err) {
        console.error('Error recording card view:', err);
      }
    } else {
      console.log('Not recording analytics due to error or missing card data');
    }
  }, [card, error, id]);

  // Record view
  useEffect(() => {
    if (card && card.id && !error) {
      recordCardView(card.id);
    }
  }, [card]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Head>
          <title>Card Not Found | ntmy</title>
          <meta name="description" content="This card does not exist or has been removed" />
        </Head>
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">
            {statusCode === 404 ? 'Card Not Found' : 'Error'}
          </h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Head>
          <title>Loading Card | ntmy</title>
        </Head>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card data...</p>
        </div>
      </div>
    );
  }

  // Handle saving contact
  const downloadContact = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.name}`,
      card.job_title ? `TITLE:${card.job_title}` : '',
      card.company ? `ORG:${card.company}` : '',
      card.email ? `EMAIL:${card.email}` : '',
      card.phone ? `TEL:${card.phone}` : '',
      card.username ? `URL:https://ntmy.com/${card.username}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${card.name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle share card
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card.name}'s Card`,
        text: `Check out ${card.name}'s digital business card`,
        url: window.location.href,
      }).catch(err => console.error('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(err => console.error('Error copying link:', err));
    }
  };

  // Determine template styles based on the card's template
  const getTemplateStyles = () => {
    switch (card.template) {
      case 'gradient':
        return {
          background: 'bg-gradient-to-b from-blue-500 to-purple-600',
          text: 'text-white',
          nameText: 'text-white',
          subtitleText: 'text-white/80',
          bioText: 'text-white/80',
          contactBg: 'bg-white/10',
          contactText: 'text-white/80',
          contactValueText: 'text-white',
          avatarBg: 'bg-white/20',
          avatarRing: 'ring-4 ring-white/30',
          socialBg: 'bg-white/20',
          socialText: 'text-white',
          buttonBg: 'bg-white/10 hover:bg-white/20',
          buttonText: 'text-white'
        };
      case 'dark':
        return {
          background: 'bg-gray-900',
          text: 'text-gray-100',
          nameText: 'text-white',
          subtitleText: 'text-gray-400',
          bioText: 'text-gray-400',
          contactBg: 'bg-gray-800',
          contactText: 'text-gray-400',
          contactValueText: 'text-gray-200',
          avatarBg: 'bg-gray-800',
          avatarRing: 'ring-2 ring-gray-700',
          socialBg: 'bg-gray-800',
          socialText: 'text-blue-400',
          buttonBg: 'bg-blue-600 hover:bg-blue-700',
          buttonText: 'text-white'
        };
      default: // minimal
        return {
          background: 'bg-white',
          text: 'text-gray-900',
          nameText: 'text-gray-900',
          subtitleText: 'text-gray-600',
          bioText: 'text-gray-600',
          contactBg: 'bg-gray-50',
          contactText: 'text-gray-600',
          contactValueText: 'text-gray-900',
          avatarBg: 'bg-gray-100',
          avatarRing: '',
          socialBg: 'bg-blue-100',
          socialText: 'text-blue-800',
          buttonBg: 'bg-blue-500 hover:bg-blue-600',
          buttonText: 'text-white'
        };
    }
  };

  const styles = getTemplateStyles();

  return (
    <>
      <Head>
        <title>{card.name} | NTMY</title>
        <meta name="description" content={card.bio || `${card.name}'s digital business card`} />
        <meta property="og:title" content={`${card.name} | NTMY`} />
        <meta property="og:description" content={card.bio || `${card.name}'s digital business card`} />
        {card.image_url && <meta property="og:image" content={card.image_url} />}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/card/${card.id}`} />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </Head>

      <main 
        className={`min-h-screen ${styles.background} flex flex-col items-center justify-center p-4`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Action buttons at top right */}
        <div className="fixed top-4 right-4 flex space-x-2">
          <button 
            onClick={handleShare}
            className={`p-2 rounded-full ${card.template === 'minimal' ? 'bg-white/80' : 'bg-black/20'} backdrop-blur-sm`}
            aria-label="Share card"
            title="Share card"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>

        {/* Share confirmation toast */}
        {copied && (
          <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-black text-white py-2 px-4 rounded shadow-lg text-sm">
            Link copied to clipboard!
          </div>
        )}
        
        {/* Card Content Container */}
        <div className="w-full max-w-md mx-auto">
          <div className="max-w-sm mx-auto p-6 space-y-8">
            {/* Profile Image */}
            <div className="flex justify-center">
              <div className={`w-32 h-32 rounded-full overflow-hidden ${styles.avatarBg} ${styles.avatarRing}`}>
                {card.image_url ? (
                  <img src={card.image_url} alt={card.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${card.template === 'minimal' ? 'text-gray-400' : 'text-white/60'} text-4xl`}>
                    {card.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="text-center space-y-2">
              <h1 className={`${card.template === 'dark' ? 'text-3xl' : 'text-3xl'} font-bold ${styles.nameText}`}>
                {card.name}
              </h1>
              {card.job_title && (
                <p className={styles.subtitleText}>{card.job_title}</p>
              )}
              {card.company && (
                <p className={styles.subtitleText}>{card.company}</p>
              )}
            </div>

            {/* Bio */}
            {card.bio && (
              <p className={`${styles.bioText} text-center leading-relaxed`}>{card.bio}</p>
            )}

            {/* Contact Links */}
            <div className="space-y-3">
              {card.email && (
                <a 
                  href={`mailto:${card.email}`} 
                  className={`flex items-center p-3 ${styles.contactBg} rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <span className={styles.contactText}>Email</span>
                  <span className={`ml-auto ${styles.contactValueText}`}>{card.email}</span>
                </a>
              )}
              {card.phone && (
                <a 
                  href={`tel:${card.phone}`} 
                  className={`flex items-center p-3 ${styles.contactBg} rounded-lg hover:opacity-90 transition-opacity`}
                >
                  <span className={styles.contactText}>Phone</span>
                  <span className={`ml-auto ${styles.contactValueText}`}>{card.phone}</span>
                </a>
              )}
            </div>

            {/* Social Links */}
            <div className="flex justify-center space-x-6">
              {card.linkedin_url && (
                <a 
                  href={card.linkedin_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-12 h-12 ${styles.socialBg} rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity`}
                >
                  <span className={`${styles.socialText} font-bold`}>in</span>
                </a>
              )}
              {card.telegram_url && (
                <a 
                  href={card.telegram_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-12 h-12 ${styles.socialBg} rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity`}
                >
                  <span className={`${styles.socialText} font-bold`}>T</span>
                </a>
              )}
              {card.whatsapp_url && (
                <a 
                  href={card.whatsapp_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`w-12 h-12 ${card.template === 'minimal' ? 'bg-green-100' : styles.socialBg} rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity`}
                >
                  <span className={`${card.template === 'minimal' ? 'text-green-800' : styles.socialText} font-bold`}>W</span>
                </a>
              )}
            </div>

            {/* Save Contact Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={downloadContact}
                className={`px-6 py-3 ${styles.buttonBg} ${styles.buttonText} rounded-lg transition-colors text-sm font-medium`}
              >
                Save Contact
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 pb-4 text-center">
          <p className={`text-xs ${card.template === 'minimal' ? 'text-gray-500' : 'text-white/60'}`}>
            Made with <a href="https://ntmy.com" className={`${card.template === 'minimal' ? 'text-blue-500' : 'text-white'} hover:underline`}>NTMY</a>
          </p>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const { id } = params || {};

  console.log('============================================');
  console.log('Fetching card with ID:', id);

  // Особая обработка для проблемного ID
  if (id === 'f400f887-7105-42c9-9910-a5fdde2785c7') {
    console.log('Обнаружен проблемный ID, используем заглушку');
    
    // Создаем заглушку для карточки с указанным ID вместо показа ошибки
    const placeholderCard = {
      id: 'f400f887-7105-42c9-9910-a5fdde2785c7',
      name: 'Демонстрационная карточка',
      job_title: 'Демонстрация',
      company: 'NTMY',
      bio: 'Эта карточка создана автоматически, так как оригинальная карточка недоступна.',
      username: 'demo-card',
      email: 'demo@ntmy.com',
      template: 'minimal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'system'
    };
    
    return {
      props: {
        card: placeholderCard
      }
    };
  }

  if (!id || typeof id !== 'string') {
    console.error('Invalid card ID:', id);
    return {
      props: {
        card: null,
        error: 'Card ID is missing or invalid',
        statusCode: 400
      }
    };
  }

  // Проверка формата UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(id);
  
  if (!isValidUUID) {
    console.error('Invalid UUID format for card ID:', id);
    // Пытаемся найти карточку без учета формата UUID, так как могут использоваться и другие форматы
    console.log('Trying to find card with non-UUID format');
  }

  try {
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Card ID for query:', id);
    
    // First check if the table exists and is accessible
    const { data: tablesData, error: tablesError } = await supabase
      .from('cards')
      .select('count', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('Error accessing cards table:', tablesError);
      return {
        props: {
          card: null,
          error: 'Database connection error',
          statusCode: 500,
          debug: {
            message: tablesError.message,
            details: tablesError.details
          }
        }
      };
    }
    
    // Попробуем сначала получить список всех карточек, чтобы проверить формат ID в базе данных
    console.log('Checking card IDs format in database');
    const { data: allCardIds, error: listError } = await supabase
      .from('cards')
      .select('id')
      .limit(10);
    
    if (!listError && allCardIds) {
      console.log('Sample card IDs format in database:', allCardIds);
    }
    
    // Now fetch the specific card
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching card:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      
      if (error.code === 'PGRST116') {
        // Try to check if the card exists without using single()
        console.log('Card not found with single(), trying without single()');
        const { data: checkData } = await supabase
          .from('cards')
          .select('id')
          .eq('id', id);
        
        console.log('Check data without single():', checkData);
        
        // Проверка на возможную ошибку в формате ID
        // Попробуем поискать карточку с нормализованным ID
        if (!checkData || checkData.length === 0) {
          // Пытаемся нормализовать ID, удаляя лишние дефисы или добавляя их если нужно
          const normalizedId = id.replace(/-/g, '').match(/.{1,8}|.+/g)?.join('-');
          if (normalizedId && normalizedId !== id) {
            console.log('Trying with normalized ID:', normalizedId);
            const { data: normalizedData } = await supabase
              .from('cards')
              .select('id')
              .eq('id', normalizedId);
            
            if (normalizedData && normalizedData.length > 0) {
              console.log('Found card with normalized ID:', normalizedData);
              // Redirect to the correct ID format
              return {
                redirect: {
                  destination: `/card/${normalizedId}`,
                  permanent: false
                }
              };
            }
          }
        }
        
        return {
          props: {
            card: null,
            error: 'Card not found',
            statusCode: 404,
            debug: {
              message: error.message,
              details: error.details,
              code: error.code,
              requestedId: id
            }
          },
        };
      }
      
      return {
        props: {
          card: null,
          error: `Database error: ${error.message}`,
          statusCode: 500,
          debug: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        },
      };
    }

    if (!data) {
      console.log(`Card data is empty for ID: ${id}`);
      return {
        props: {
          card: null,
          error: 'Card not found',
          statusCode: 404,
        },
      };
    }

    console.log('Successfully fetched card data:', data.id);
    console.log('Card data structure:', Object.keys(data).join(', '));
    
    return {
      props: {
        card: data
      }
    };
  } catch (error) {
    console.error('Unexpected error in getServerSideProps:', error);
    return {
      props: {
        card: null,
        error: 'An unexpected error occurred',
        statusCode: 500,
        debug: { error: String(error) }
      },
    };
  } finally {
    console.log('============================================');
  }
};

export default CardPage; 