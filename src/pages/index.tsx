import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        <title>NTMY - Цифровая визитка для нетворкинга</title>
        <meta name="description" content="NTMY - создайте профессиональную цифровую визитку за несколько секунд с помощью AI" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Навигация */}
      <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-white">NTMY</span>
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
                Возможности
              </Link>
              <Link href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
                Как это работает
              </Link>
              <Link href="#for-who" className="text-gray-300 hover:text-white transition-colors">
                Для кого
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                Тарифы
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/signin"
                className="hidden sm:inline-flex px-4 py-2 rounded text-sm font-medium text-white border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                Войти
              </Link>
              <Link 
                href="/signup"
                className="hidden sm:inline-flex px-4 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Попробовать
              </Link>
              <button 
                className="md:hidden text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="bg-gray-900 h-full w-4/5 max-w-xs p-4 flex flex-col">
          <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
            <span className="text-xl font-bold text-white">NTMY</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-col space-y-4">
            <Link 
              href="#features" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Возможности
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Как это работает
            </Link>
            <Link 
              href="#for-who" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Для кого
            </Link>
            <Link 
              href="#pricing" 
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Тарифы
            </Link>
          </div>
          <div className="mt-auto border-t border-gray-800 pt-4 flex flex-col space-y-3">
            <Link 
              href="/signin"
              className="px-4 py-2 rounded text-sm font-medium text-white border border-gray-600 hover:bg-gray-800 transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Войти
            </Link>
            <Link 
              href="/signup"
              className="px-4 py-2 rounded text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Попробовать
            </Link>
          </div>
        </div>
      </div>

      {/* Главный блок */}
      <main>
        {/* Hero секция */}
        <div className="pt-20 pb-16 bg-black relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 -right-10 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl"></div>
            <div className="absolute top-20 -left-10 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-indigo-600">
              Цифровая визитка для<br />нетворкинга
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              AI создаст вашу профессиональную визитку за несколько секунд –<br className="hidden sm:inline" />
              просто добавьте ссылки на соцсети или сайт.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup"
                className="px-8 py-4 text-center rounded-lg text-black font-medium bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 transition-colors"
              >
                Попробовать бесплатно
              </Link>
              <Link 
                href="/create"
                className="px-8 py-4 text-center rounded-lg text-white font-medium border border-gray-600 hover:bg-gray-800 transition-colors"
              >
                Создать без регистрации
              </Link>
            </div>
          </div>
        </div>

        {/* Изображение демонстрации */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-24">
          <div className="relative mx-auto rounded-lg overflow-hidden shadow-2xl">
            <div 
              className="w-full h-auto aspect-video bg-gradient-to-r from-gray-800 to-gray-900 flex items-center justify-center"
            >
              <div className="relative flex items-center">
                <div className="w-64 h-[500px] bg-black rounded-3xl border-4 border-gray-700 relative overflow-hidden shadow-2xl mx-auto">
                  <div className="absolute top-0 left-0 right-0 h-20 bg-black flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                      <div className="text-white text-center font-bold">NTMY</div>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                    <p className="font-bold">Цифровая визитка</p>
                    <p className="text-gray-400 text-sm">для профессионалов</p>
                  </div>
                </div>
                <div className="absolute -right-32 top-1/2 transform -translate-y-1/2 w-40 h-[350px] bg-gray-800 rounded-xl border-2 border-gray-700 shadow-lg flex items-center justify-center hidden md:flex">
                  <div className="text-white text-center p-3">
                    <div className="text-lg font-bold mb-2">NICE TO MEET YOU</div>
                    <div className="w-16 h-16 rounded-full bg-green-400 mx-auto flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Секция возможностей */}
        <div className="py-24 bg-black relative" id="features">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute top-1/2 left-0 w-72 h-72 bg-indigo-500 rounded-full filter blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
                Возможности NTMY
              </h2>
              <p className="mt-4 text-xl text-gray-400">
                Все необходимое для создания профессиональной цифровой визитки
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Здесь добавить карточки с возможностями */}
              {/* Пример карточки */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 transition duration-300 hover:-translate-y-2">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-white">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Создание карточки за секунды</h3>
                <p className="text-gray-400">AI автоматически создаст профессиональную визитку на основе ваших ссылок</p>
              </div>
            </div>
          </div>
        </div>

        {/* Как это работает */}
        <div className="py-24 bg-gray-900 relative" id="how-it-works">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-1/2 w-72 h-72 bg-purple-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500 rounded-full filter blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Как это работает
              </h2>
              <p className="mt-4 text-xl text-gray-400">
                Три простых шага для создания вашей цифровой визитки
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Шаг 1 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative transition duration-300 hover:-translate-y-2">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white">1</div>
                <h3 className="text-xl font-bold text-white mb-4 mt-2">Регистрация</h3>
                <p className="text-gray-400">Создайте аккаунт за 30 секунд и получите доступ к платформе</p>
              </div>
              
              {/* Шаг 2 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative transition duration-300 hover:-translate-y-2">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white">2</div>
                <h3 className="text-xl font-bold text-white mb-4 mt-2">Добавьте ссылки</h3>
                <p className="text-gray-400">Укажите ссылки на ваши соцсети, сайт и другие онлайн-ресурсы</p>
              </div>
              
              {/* Шаг 3 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 relative transition duration-300 hover:-translate-y-2">
                <div className="absolute -top-5 -left-5 w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center font-bold text-white">3</div>
                <h3 className="text-xl font-bold text-white mb-4 mt-2">Готово!</h3>
                <p className="text-gray-400">AI создаст вашу визитку, которой можно делиться с кем угодно</p>
              </div>
            </div>
          </div>
        </div>

        {/* Для кого */}
        <div className="py-24 bg-black relative" id="for-who">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-0 w-72 h-72 bg-green-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-teal-500 rounded-full filter blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-600">
                Для кого подходит NTMY
              </h2>
              <p className="mt-4 text-xl text-gray-400">
                Наше решение идеально для профессионалов в различных сферах
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Карточки целевой аудитории */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 flex items-start transition duration-300 hover:-translate-y-2">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Бизнес-профессионалы</h3>
                  <p className="text-gray-400">Менеджеры, консультанты, маркетологи и другие бизнес-специалисты могут использовать NTMY для эффективного нетворкинга на конференциях и бизнес-встречах.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Тарифы */}
        <div className="py-24 bg-gray-900 relative" id="pricing">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-1/4 left-0 w-72 h-72 bg-orange-500 rounded-full filter blur-3xl"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-600">
                Тарифные планы
              </h2>
              <p className="mt-4 text-xl text-gray-400">
                Выберите тариф, который подходит именно вам
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Бесплатный план */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 transition duration-300 hover:-translate-y-2">
                <div className="text-gray-400 uppercase text-sm font-bold tracking-wider mb-4">Бесплатно</div>
                <h3 className="text-3xl font-bold text-white mb-4">0 ₽</h3>
                <p className="text-gray-400 mb-6">Для начинающих пользователей</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    1 цифровая визитка
                  </li>
                  <li className="flex items-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Основные функции
                  </li>
                </ul>
                <Link 
                  href="/signup"
                  className="block w-full py-3 px-4 text-center text-white bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  Начать бесплатно
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Футер */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-white">NTMY</span>
              <p className="mt-4 text-gray-400 text-sm">
                Современное решение для создания профессиональных цифровых визиток с помощью искусственного интеллекта.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Компания</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">О нас</a></li>
                <li><a href="#" className="hover:text-white transition">Блог</a></li>
                <li><a href="#" className="hover:text-white transition">Карьера</a></li>
                <li><a href="#" className="hover:text-white transition">Контакты</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Поддержка</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Помощь</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Связаться с нами</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Правовая информация</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Условия использования</a></li>
                <li><a href="#" className="hover:text-white transition">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} NTMY. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 