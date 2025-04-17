import React, { useState, useEffect } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabase';
import { recordCardView } from '../../lib/analytics'; // Assuming analytics lib exists
import { getCardByUsernameFromLocalStorage, syncCardWithServer } from '../../components/CardLocalStorage';

// Styles based on template (assuming minimal for now, adapt as needed)
const styles = {
  minimal: {
    background: 'bg-white',
    text: 'text-gray-800',
    link: 'text-blue-600 hover:text-blue-800',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    buttonText: 'text-white',
    cardBg: 'bg-white',
    cardBorder: 'border border-gray-200',
    nameText: 'text-gray-900',
    titleText: 'text-gray-500',
    bioText: 'text-gray-700',
    contactIcon: 'text-gray-400',
  },
  // Add gradient and dark styles here later if needed
};

interface CardData {
  id: string; // Keep id for internal use, analytics etc.
  name: string;
  job_title?: string;
  company?: string;
  bio?: string;
  username: string; // Now the primary lookup key for the page
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
  checkLocalStorage?: boolean;
  debug?: any; // For passing debug info from server
}

const CardPage: NextPage<CardPageProps> = ({ card, error, statusCode, checkLocalStorage, debug }) => {
  const router = useRouter();
  const { username } = router.query;
  const [localCard, setLocalCard] = useState<CardData | null>(null);
  const [loading, setLoading] = useState<boolean>(checkLocalStorage ?? false);
  const [pageError, setPageError] = useState<string | null>(error || null);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (error) {
      console.log('Error from server side props:', error);
      console.log('Server debug info:', debug);
      setPageError(error);
    }

    // Record analytics only if we have a valid card and no error
    if (card && card.id && !error) { 
      try {
        console.log('Recording view for card with ID:', card.id);
        recordCardView(card.id);
      } catch (err) {
        console.error('Error recording card view:', err);
      }
    } else if (!card && !error) {
        console.log('Card data missing, not recording analytics.');
    } else if (!card?.id && !error) {
        console.log('Card ID missing, not recording analytics.');
    } else {
       console.log('Not recording analytics due to error:', error);
    }

    // Если карточка не найдена в базе данных и установлен флаг checkLocalStorage,
    // попробуем загрузить карточку из localStorage
    if (!card && checkLocalStorage && typeof window !== 'undefined' && username) {
      setLoading(true);
      try {
        const foundCard = getCardByUsernameFromLocalStorage(username as string);
        
        if (foundCard) {
          console.log('Card found in localStorage:', foundCard);
          setLocalCard(foundCard as CardData);
          
          // Пытаемся синхронизировать карточку с сервером
          setSyncing(true);
          syncCardWithServer(username as string)
            .then(result => {
              if (result) {
                console.log('Card synced with server successfully');
                // Можно перезагрузить страницу для получения обновленных данных с сервера
                // или тихо обновить локальный state
              }
            })
            .finally(() => {
              setSyncing(false);
            });
        } else {
          console.log(`Card with username ${username} not found in localStorage`);
        }
      } catch (err) {
        console.error('Error loading card from localStorage:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [card, checkLocalStorage, username]);

  // Используем карточку из базы данных или из localStorage
  const displayCard = card || localCard;

  const handleShare = async () => {
    if (!displayCard) return;
    const shareUrl = `${window.location.origin}/card/${displayCard.username}`; // Use username for sharing
    const shareData = {
      title: `${displayCard.name}'s Digital Business Card`,
      text: `Check out ${displayCard.name}'s digital business card on NTMY!`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        console.log('Card shared successfully');
      } else {
        // Fallback for browsers that don't support navigator.share
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Hide after 2 seconds
      }
    } catch (err) {
      console.error('Error sharing card:', err);
      // Optionally show an error message to the user
    }
  };

  if (loading) {
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

  if (!displayCard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
        <Head>
           <title>{statusCode === 404 ? 'Card Not Found' : 'Error'} | ntmy</title>
           <meta name="description" content={pageError} />
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
          <p className="text-gray-600 mb-4">{pageError}</p>
          {/* Optional: Show debug info during development */}
          {debug && process.env.NODE_ENV === 'development' && (
             <pre className="text-xs text-left bg-gray-100 p-2 rounded overflow-auto mb-4">
               {JSON.stringify(debug, null, 2)}
             </pre>
          )}
          <Link href="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Determine styles based on template
  const templateStyle = styles[displayCard.template] || styles.minimal;

  // Helper to create tel: links
  const formatPhoneLink = (phone: string | undefined) => {
    if (!phone) return '#';
    return `tel:${phone.replace(/[^0-9+]/g, '')}`;
  }

  // Helper to create mailto: links
  const formatEmailLink = (email: string | undefined) => {
    if (!email) return '#';
    return `mailto:${email}`;
  }

  return (
    <>
      <Head>
        <title>{displayCard.name} | NTMY</title>
        <meta name="description" content={displayCard.bio || `${displayCard.name}'s digital business card`} />
        <meta property="og:title" content={`${displayCard.name} | NTMY`} />
        <meta property="og:description" content={displayCard.bio || `${displayCard.name}'s digital business card`} />
        {displayCard.image_url && <meta property="og:image" content={displayCard.image_url} />}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL || ''}/card/${displayCard.username}`} />
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        `}</style>
      </Head>

      <main
        className={`min-h-screen ${templateStyle.background} flex flex-col items-center justify-center p-4`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Notification if card is loaded from localStorage */}
        {localCard && !card && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-md shadow-lg z-30 text-sm">
            {syncing ? 'Синхронизация карточки с сервером...' : 'Карточка загружена из локального хранилища'}
          </div>
        )}

        {/* Action buttons at top right */}
        <div className="fixed top-4 right-4 flex space-x-2 z-20">
          <button
            onClick={handleShare}
            className={`p-2 rounded-full ${displayCard.template === 'minimal' ? 'bg-white/80' : 'bg-black/20'} backdrop-blur-sm shadow`}
            aria-label="Share card"
            title="Share card"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
          </button>
           {/* Add to Contacts Button (placeholder) */}
           {/* Consider using a vCard download approach here */}
           <button
             className={`p-2 rounded-full ${displayCard.template === 'minimal' ? 'bg-white/80' : 'bg-black/20'} backdrop-blur-sm shadow`}
             aria-label="Add to contacts"
             title="Add to contacts"
             onClick={() => alert('Add to contacts functionality coming soon!')}
           >
             {/* User Plus Icon */}
             <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
           </button>
        </div>

        {/* Share confirmation toast */}
        {copied && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg z-30">
            Link copied to clipboard!
          </div>
        )}

        {/* --- Card Content --- */}
        <div className={`w-full max-w-md ${templateStyle.cardBg} rounded-xl shadow-lg overflow-hidden ${templateStyle.cardBorder}`}>
          {/* Profile Image */}
          <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative">
             {displayCard.image_url ? (
              <img
                src={displayCard.image_url}
                alt={`${displayCard.name}'s profile picture`}
                className="w-24 h-24 rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 object-cover shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-gray-300 flex items-center justify-center shadow-md">
                <span className="text-4xl font-semibold text-gray-600">{displayCard.name ? displayCard.name.charAt(0).toUpperCase() : '?'}</span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="pt-16 pb-6 px-6 text-center">
            <h1 className={`text-2xl font-bold ${templateStyle.nameText}`}>{displayCard.name}</h1>
            {(displayCard.job_title || displayCard.company) && (
              <p className={`mt-1 text-sm ${templateStyle.titleText}`}>
                {displayCard.job_title}{displayCard.job_title && displayCard.company && ' at '}{displayCard.company}
              </p>
            )}
          </div>

          {/* Bio */}
          {displayCard.bio && (
            <div className="px-6 pb-6">
              <p className={`${templateStyle.bioText} text-sm text-center`}>{displayCard.bio}</p>
            </div>
          )}

          {/* Contact Links */}
          <div className="px-6 pb-6 space-y-3">
            {displayCard.email && (
              <a href={formatEmailLink(displayCard.email)} className={`flex items-center ${templateStyle.link}`}>
                <svg className={`w-5 h-5 mr-3 ${templateStyle.contactIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <span className="text-sm">{displayCard.email}</span>
              </a>
            )}
            {displayCard.phone && (
              <a href={formatPhoneLink(displayCard.phone)} className={`flex items-center ${templateStyle.link}`}>
                 <svg className={`w-5 h-5 mr-3 ${templateStyle.contactIcon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <span className="text-sm">{displayCard.phone}</span>
              </a>
            )}
          </div>

          {/* Social Links */}
          <div className="px-6 pb-6 flex justify-center space-x-4">
            {displayCard.linkedin_url && (
              <a href={displayCard.linkedin_url} target="_blank" rel="noopener noreferrer" className={`${templateStyle.link}`} aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            )}
             {displayCard.telegram_url && (
               <a href={displayCard.telegram_url} target="_blank" rel="noopener noreferrer" className={`${templateStyle.link}`} aria-label="Telegram">
                 {/* Telegram Icon SVG */}
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.79-2.09-1.44-2.75-1.924-.753-.543-1.506-1.086-1.29-1.785.15-.504.718-1.53 1.486-2.485.945-1.18 1.89-2.36 2.834-3.54.945-1.18 1.89-2.36 2.835-3.54.18-.22.36-.44.54-.66.18-.22.27-.33.36-.44.14-.17.28-.34.42-.51.1-.124.24-.248.38-.372zm-.848 10.482.928-4.418c.144-.69.016-1.31-.264-1.855-.28-.545-.745-.995-1.395-1.35-.65-.355-1.486-.61-2.506-.77l-.012-.002c-1.02-.16-2.11.01-3.27.51-.075.033-.15.065-.225.096-.75.323-1.5.645-2.25.968l-1.5 1.12c-.248.186-.496.372-.744.558l-.002.002c-.248.186-.496.372-.744.558l-.002.002-.002.002v.004l.004-.003c.004.002.01.005.014.008q.004.002.008.005l.01.006.012.007.014.008.016.009.018.01.02.01.02.012.024.012.026.013.028.014.03.015.03.016.034.016.036.017.038.018.04.018.04.019.044.019.046.02.048.02.05.02.05.022.054.022.056.022.058.024.06.024.06.026.064.026.066.026.068.028.07.028.07.03.074.03.076.03.078.03.08.032.08.032.084.032.086.034.088.034.09.034.09.036.094.036.096.036.098.038.1.038.1.038.104.04.106.04.108.04.11.04.11.04.114.04.116.042.118.042.12.042.12.044.124.044.126.044.128.044.13.046.13.046.134.046.136.046.138.048.14.048.14.048.144.048.146.05.148.05.15.05.15.05.154.05.156.052.158.052.16.052.16.052.164.054.166.054.168.054.17.054.17.056.174.056.176.056.178.056.18.058.18.058.184.058.186.058.188.06.19.06.19.06.194.06.196.06.198.062.2.062.2.062.204.062.206.062.208.064.21.064.21.064.214.064.216.064.218.066.22.066.22.066.224.066.226.066.228.068.23.068.23.068.234.068.236.068.238.07.24.07.24.07.244.07.246.07.248.072.25.072.25.072.254.072.256.072.258.074.26.074.26.074.264.074.266.074.268.076.27.076.27.076.274.076.276.076.278.078.28.078.28.078.284.078.286.078.288.08.29.08.29.08.294.08.296.08.298.082.3.082.3.082.304.082.306.082.308.084.31.084.31.084.314.084.316.084.318.086.32.086.32.086.324.086.326.086.328.088.33.088.33.088.334.088.336.088.338.09.34.09.34.09.344.09.346.09.348.092.35.092.35.092.354.092.356.092.358.094.36.094.36.094.364.094.366.094.368.096.37.096.37.096.374.096.376.096.378.098.38.098.38.098.384.098.386.098.388.1.39.1.39.1.394.1.396.1.398.102.4.102.4.102.404.102.406.102.408.104.41.104.41.104.414.104.416.104.418.106.42.106.42.106.424.106.426.106.428.108.43.108.43.108.434.108.436.108.438.11.44.11.44.11.444.11.446.11.448.112.45.112.45.112.454.112.456.112.458.114.46.114.46.114.464.114.466.114.468.116.47.116.47.116.474.116.476.116.478.118.48.118.48.118.484.118.486.118.488.12.49.12.49.12.494.122.496.122.498.122.5.122.5.122.504.122.506.122.508.124.51.124.51.124.514.124.516.124.518.126.52.126.52.126.524.126.526.126.528.128.53.128.53.128.534.128.536.128.538.13.54.13.54.13.544.13.546.13.548.132.55.132.55.132.554.132.556.132.558.134.56.134.56.134.564.134.566.134.568.136.57.136.57.136.574.136.576.136.578.138.58.138.58.138.584.138.586.138.588.14.59.14.59.14.594.14.596.14.598.142.6.142.6.142.604.142.606.142.608.144.61.144.61.144.614.144.616.144.618.146.62.146.62.146.624.146.626.146.628.148.63.148.63.148.634.148.636.148.638.15.64.15.64.15.644.15.646.15.648.152.65.152.65.152.654.152.656.152.658.154.66.154.66.154.664.154.666.154.668.156.67.156.67.156.674.156.676.156.678.158.68.158.68.158.684.158.686.158.688.16.69.16.69.16.694.16.696.16.698c.002-.002.003-.003.005-.005l.007-.005.008-.005.01-.006.01-.006.013-.007.014-.007.015-.008.016-.008.018-.009.018-.009.02-.01.02-.01.023-.01.024-.01.025-.011.026-.011.028-.012.03-.012.03-.012.033-.013.034-.013.035-.014.036-.014.038-.014.04-.015.04-.015.043-.016.044-.016.045-.016.046-.017.048-.017.05-.017.05-.018.053-.018.054-.018.055-.018.057-.019.058-.019.06-.019.06-.02.063-.02.064-.02.065-.02.067-.02.068-.022.07-.022.07.022.073-.022.074-.023.075-.023.077-.023.078-.024.08-.024.08.024.083-.024.084-.025.085-.025.087-.025.088-.026.09-.026.09.026.093-.026.094-.027.095-.027.097-.027.098-.028.1-.028.1.028.103-.028.104-.029.105-.029.107-.029.108-.03.11-.03.11.03.113-.03.114-.03.115-.032.117-.032.118-.032.12-.032.12.032.123-.032.124-.033.125-.033.127-.033.128-.034.13-.034.13.034.133-.034.134-.035.135-.035.137-.035.138-.036.14-.036.14.036.143-.036.144-.037.145-.037.147-.037.148-.038.15-.038.15.038.153-.038.154-.038.155-.039.157-.039.158-.04.16-.04.16.04.163-.04.164-.04.165-.04.167-.042.168-.042.17-.042.17.042.173-.042.174-.043.175-.043.177-.043.178-.044.18-.044.18.044.183-.044.184-.045.185-.045.187-.045.188-.046.19-.046.19.046.193-.046.194-.046.195-.047.197-.047.198-.048.2-.048.2.048.203-.048.204-.048.205-.049.207-.049.208-.05.21-.05.21.05.213-.05.214-.05.215-.05.217-.052.218-.052.22-.052.22.052.223-.052.224-.053.225-.053.227-.053.228-.054.23-.054.23.054.233-.054.234-.055.235-.055.237-.055.238-.056.24-.056.24.056.243-.056.244-.056.245-.057.247-.057.248-.058.25-.058.25.058.253-.058.254-.058.255-.059.257-.059.258-.06.26-.06.26.06.263-.06.264-.06.265-.06.267-.062.268-.062.27-.062.27.062.273-.062.274-.063.275-.063.277-.063.278-.064.28-.064.28.064.283-.064.284-.064.285-.065.287-.065.288-.066.29-.066.29.066.293-.066.294-.066.295-.067.297-.067.298-.068.3-.068.3.068.303-.068.304-.068.305-.069.307-.069.308-.07.31-.07.31.07.313-.07.314-.07.315-.07.317-.072.318-.072.32-.072.32.072.323-.072.324-.073.325-.073.327-.073.328-.074.33-.074.33.074.333-.074.334-.074.335-.075.337-.075.338-.076.34-.076.34.076.343-.076.344-.076.345-.077.347-.077.348-.078.35-.078.35.078.353-.078.354-.078.355-.079.357-.079.358-.08.36-.08.36.08.363-.08.364-.08.365-.08.367-.082.368-.082.37-.082.37.082.373-.082.374-.083.375-.083.377-.083.378-.084.38-.084.38.084.383-.084.384-.084.385-.085.387-.085.388-.086.39-.086.39.086.393-.086.394-.086.395-.087.397-.087.398-.088.4-.088.4.088.403-.088.404-.088.405-.089.407-.089.408-.09.41-.09.41.09.413-.09.414-.09.415-.09.417-.092.418-.092.42-.092.42.092.423-.092.424-.093.425-.093.427-.093.428-.094.43-.094.43.094.433-.094.434-.094.435-.095.437-.095.438-.096.44-.096.44.096.443-.096.444-.096.445-.097.447-.097.448-.098.45-.098.45.098.453-.098.454-.098.455-.099.457-.099.458-.1.46-.1.46.1.463-.1.464-.1.465-.1.467-.102.468-.102.47-.102.47.102.473-.102.474-.103.475-.103.477-.103.478-.104.48-.104.48.104.483-.104.484-.098.485-.099.487-.099.488-.1.5.1.5.1.503-.1.504-.1.505-.1.507-.1.508-.1.51-.1.51.1.513-.1.514-.1.515-.1.517-.1.518-.1.52-.1.52.1.523-.1.524-.1.525-.1.527-.1.528-.1.53-.1.53.1.533-.1.534-.1.535-.1.537-.1.538-.1.54-.1.54.1.543-.1.544-.1.545-.1.547-.1.548-.1.55-.1.55.1.553-.1.554-.1.555-.1.557-.1.558-.1.56-.1.56.1.563-.1.564-.1.565-.1.567-.1.568-.1.57-.1.57.1.573-.1.574-.1.575-.1.577-.1.578-.1.58-.1.58.1.583-.1.584-.1.585-.1.587-.1.588-.1.59-.1.59.1.593-.1.594-.1.595-.1.597-.1.598-.1.6-.1.6.1.603-.1.604-.1.605-.1.607-.1.608-.1.61-.1.61.1.613-.1.614-.1.615-.1.617-.1.618-.1.62-.1.62.1.623-.1.624-.1.625-.1.627-.1.628-.1.63-.1.63.1.633-.1.634-.1.635-.1.637-.1.638-.1.64-.1.64.1.643-.1.644-.1.645-.1.647-.1.648-.1.65-.1.65.1.653-.1.654-.1.655-.1.657-.1.658-.1.66-.1.66.1.663-.1.664-.1.665-.1.667-.1.668-.1.67-.1.67.1.673-.1.674-.1.675-.1.677-.1.678-.1.68-.1.68.1.683-.1.684-.1.685-.1.687-.1.688-.1.69-.1.69.1.693-.1.694-.1.695-.1.697-.1.698-.1.7-.1.7.1.703-.1.704-.1.705-.1.707-.1.708-.1.71-.1.71.1.713-.1.714-.1.715-.1.717-.1.718-.1.72-.1.72.1.723-.1.724-.1.725-.1.727-.1.728-.1.73-.1.73.1.733-.1.734-.1.735-.1.737-.1.738-.1.74-.1.74.1.743-.1.744-.1.745-.1.747-.1.748-.1.75-.1.75.1.753-.1.754-.1.755-.1.757-.1.758-.1.76-.1.76.1.763-.1.764-.1.765-.1.767-.1.768-.1.77-.1.77.1.773-.1.774-.1.775-.1.777-.1.778-.1.78-.1.78.1.783-.1.784-.1.785-.1.787-.1.788-.1.79-.1.79.1.793-.1.794-.1.795-.1.797-.1.798-.1.8-.1.8.1.803-.1.804-.1.805-.1.807-.1.808-.1.81-.1.81.1.813-.1.814-.1.815-.1.817-.1.818-.1.82-.1.82.1.823-.1.824-.1.825-.1.827-.1.828-.1.83-.1.83.1.833-.1.834-.1.835-.1.837-.1.838-.1.84-.1.84.1.843-.1.844-.1.845-.1.847-.1.848-.1.85-.1.85.1.853-.1.854-.1.855-.1.857-.1.858-.1.86-.1.86.1.863-.1.864-.1.865-.1.867-.1.868-.1.87-.1.87.1.873-.1.874-.1.875-.1.877-.1.878-.1.88-.1.88.1.883-.1.884-.1.885-.1.887-.1.888-.1.89-.1.89.1.893-.1.894-.1.895-.1.897-.1.898-.1.9-.1.9.1.903-.1.904-.1.905-.1.907-.1.908-.1.91-.1.91.1.913-.1.914-.1.915-.1.917-.1.918-.1.92-.1.92.1.923-.1.924-.1.925-.1.927-.1.928-.1.93-.1.93.1.933-.1.934-.1.935-.1.937-.1.938-.1.94-.1.94.1.943-.1.944-.1.945-.1.947-.1.948-.1.95-.1.95.1.953-.1.954-.1.955-.1.957-.1.958-.1.96-.1.96.1.963-.1.964-.1.965-.1.967-.1.968-.1.97-.1.97.1.973-.1.974-.1.975-.1.977-.1.978-.1.98-.1.98.1.983-.1.984-.1.985-.1.987-.1.988-.1.99-.1.99.1.993-.1.994-.1.995-.1.997-.1.998l-.003-.002z"/></svg>
               </a>
             )}
             {displayCard.whatsapp_url && (
               <a href={displayCard.whatsapp_url} target="_blank" rel="noopener noreferrer" className={`${templateStyle.link}`} aria-label="WhatsApp">
                 {/* WhatsApp Icon SVG */}
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.871 1.213 3.07 2.031 3.157 4.928 4.354.995.462 1.332.494.94.315 1.461.288 1.758-.78 2.006-1.525.248-.72.173-1.35-.075-.198z"/></svg>
               </a>
             )}
             {/* Add other social icons as needed */}
           </div>

         </div>

         {/* Footer - Branding */}
         <footer className="mt-6 text-center">
           <p className="text-xs text-gray-500">
             Powered by <a href="https://ntmy.com" target="_blank" rel="noopener noreferrer" className="font-medium text-indigo-600 hover:text-indigo-800">NTMY</a>
           </p>
         </footer>
       </main>
     </>
   );
 };

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  // Use `username` from params now
  const { username } = params || {};

  console.log('============================================');
  console.log('Fetching card with username:', username); // Log username

  if (!username || typeof username !== 'string') {
    console.error('Invalid card username:', username);
    return {
      props: {
        card: null,
        error: 'Card username is missing or invalid',
        statusCode: 400,
        debug: { requestedUsername: username }
      }
    };
  }

  try {
    // Fetching card from MongoDB API
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/cards/username/${username}`;
    console.log('Fetching from API URL:', apiUrl);
    
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    if (!response.ok) {
      console.error(`Error response from API: ${response.status}`, data);
      
      // Checking if we should look in localStorage on client side
      if (response.status === 404) {
        return {
          props: {
            card: null,
            error: data.error || `Card with username "${username}" not found.`,
            statusCode: 404,
            checkLocalStorage: true,
            debug: {
              message: data.error,
              requestedUsername: username
            }
          },
        };
      }

      return {
        props: {
          card: null,
          error: data.error || 'An error occurred while fetching the card.',
          statusCode: response.status,
          debug: {
            message: data.error,
            requestedUsername: username
          }
        },
      };
    }

    console.log(`Successfully fetched card data for username: ${username}`);

    // Data Validation
    if (!data.name || !data.username) {
      console.warn(`Card for username: ${username} is missing essential data (name or username).`);
    }

    return {
      props: {
        card: data // API returns serialized data
      }
    };

  } catch (error) {
    console.error('Unexpected error in getServerSideProps:', error);
    return {
      props: {
        card: null,
        error: 'An unexpected error occurred while fetching the card.',
        statusCode: 500,
        checkLocalStorage: true, // Проверяем localStorage при ошибке
        debug: { error: String(error), requestedUsername: username }
      },
    };
  } finally {
    console.log('============================================');
  }
};

export default CardPage; 