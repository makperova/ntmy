import { GetServerSideProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import PublicProfile from '../components/profile/PublicProfile';
import { Profile, SocialLink } from '../types/profile';
import { PrismaClient } from '@prisma/client';

interface ProfilePageProps {
  profile: Profile | null;
  socialLinks: SocialLink[];
  isOwner: boolean;
  username: string;
  error?: string;
}

const ProfilePage: NextPage<ProfilePageProps> = ({ profile, socialLinks, isOwner, username, error }) => {
  const router = useRouter();
  const [pageError, setPageError] = useState<string | null>(error || null);

  // Запись посещения профиля
  useEffect(() => {
    const recordVisit = async () => {
      if (profile && !isOwner) {
        try {
          // Получение информации о устройстве
          const deviceType = getDeviceType();
          const referer = document.referrer;

          // Запись данных аналитики
          await fetch('/api/analytics/record-visit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              profileId: profile.id,
              userId: profile.userId,
              deviceType,
              referer,
            }),
          });
        } catch (error) {
          console.error('Error recording visit:', error);
        }
      }
    };

    if (profile) {
      recordVisit();
    }
  }, [profile, isOwner]);

  // Если страница не найдена
  if (pageError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Профиль не найден</h1>
          <p className="text-gray-600 mb-6">
            Профиль с именем пользователя "{username}" не существует или был удален.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Если профиль не опубликован и пользователь не владелец
  if (profile && !profile.isPublished && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Профиль не доступен</h1>
          <p className="text-gray-600 mb-6">
            Этот профиль еще не опубликован.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Если профиль не загружен (что странно, т.к. он загружен на сервере)
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{profile.name} | NTMY</title>
        <meta name="description" content={profile.bio || `${profile.name}'s digital business card`} />
        <meta property="og:title" content={`${profile.name} | NTMY`} />
        <meta property="og:description" content={profile.bio || `${profile.name}'s digital business card`} />
        {profile.image && <meta property="og:image" content={profile.image} />}
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_BASE_URL}/${username}`} />
      </Head>

      <main className="min-h-screen bg-gray-50 py-6">
        <PublicProfile
          profile={profile}
          socialLinks={socialLinks}
          isOwner={isOwner}
          username={username}
        />
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const username = context.params?.username as string;
    
    if (!username) {
      return {
        props: {
          profile: null,
          socialLinks: [],
          isOwner: false,
          username: '',
          error: 'Профиль не найден'
        }
      };
    }

    // Инициализация Prisma клиента
    const prisma = new PrismaClient();
    
    // Поиск пользователя по username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return {
        props: {
          profile: null,
          socialLinks: [],
          isOwner: false,
          username,
          error: 'Профиль не найден'
        }
      };
    }

    // Получение опубликованного профиля пользователя
    const profile = await prisma.profile.findFirst({
      where: {
        userId: user.id,
        isPublished: true
      }
    });
    
    // Проверка авторизован ли текущий пользователь и является ли он владельцем профиля
    let isOwner = false;
    
    // Получение кук сессии из запроса
    const { req } = context;
    
    // Создаем серверный клиент Supabase с cookie из запроса
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: {
          cookie: req.headers.cookie || '',
        },
      },
    });
    
    // Получаем сессию пользователя с учетом cookie
    const { data: { session } } = await supabaseServer.auth.getSession();
    const authUser = session?.user;
    
    if (authUser && authUser.id === user.id) {
      isOwner = true;

      // Если пользователь владелец, получить его профиль даже если не опубликован
      if (!profile) {
        const ownerProfile = await prisma.profile.findFirst({
          where: {
            userId: user.id
          }
        });
        
        if (ownerProfile) {
          // Получение ссылок на соцсети для профиля
          const socialLinks = await prisma.socialLink.findMany({
            where: {
              profileId: ownerProfile.id,
              isActive: true
            }
          });
          
          return {
            props: {
              profile: JSON.parse(JSON.stringify(ownerProfile)),
              socialLinks: JSON.parse(JSON.stringify(socialLinks)),
              isOwner,
              username
            }
          };
        }
      }
    }
    
    // Если профиль не найден
    if (!profile) {
      return {
        props: {
          profile: null,
          socialLinks: [],
          isOwner,
          username,
          error: isOwner ? 'У вас еще нет профиля' : 'Профиль не найден'
        }
      };
    }
    
    // Получение ссылок на соцсети для профиля
    const socialLinks = await prisma.socialLink.findMany({
      where: {
        profileId: profile.id,
        isActive: true
      }
    });
    
    await prisma.$disconnect();
    
    return {
      props: {
        profile: JSON.parse(JSON.stringify(profile)),
        socialLinks: JSON.parse(JSON.stringify(socialLinks)),
        isOwner,
        username
      }
    };
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    return {
      props: {
        profile: null,
        socialLinks: [],
        isOwner: false,
        username: context.params?.username || '',
        error: 'Произошла ошибка при загрузке профиля'
      }
    };
  }
};

// Вспомогательная функция для определения типа устройства
function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  
  if (/Android/i.test(userAgent)) {
    return 'Android';
  }
  
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'iOS';
  }
  
  if (/Windows/i.test(userAgent)) {
    return 'Windows';
  }
  
  if (/Mac/i.test(userAgent)) {
    return 'Mac';
  }
  
  return 'Unknown';
}

export default ProfilePage; 