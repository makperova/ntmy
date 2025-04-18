# NTMY - цифровая визитка нового поколения

NTMY (Nice To Meet You) - современный веб-сервис для создания и управления цифровыми визитками с возможностью поделиться через NFC, QR-код и персональную страницу.

## Возможности MVP

### Авторизованная зона (личный кабинет)
- Регистрация с подтверждением email
- Авторизация в личном кабинете
- Создание веб-страницы визитки с базовой информацией и ссылками на социальные сети
- Выбор шаблонов для публичной страницы
- Редактирование и публикация страницы
- Доступ по ссылке ntmy.pro/username
- Генерация QR-кода для визитки
- Экспорт визитки в Apple Wallet и Google Wallet
- Привязка физической NFC карты к профилю
- Просмотр базовой аналитики посещений

### Неавторизованная зона (публичная страница)
- Просмотр информации о визитке
- Сохранение контакта в адресную книгу (.vcf файл)
- Кнопки: авторизация, поделиться (QR-код, ссылка), подписка на обновления

## Технический стек

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **База данных**: PostgreSQL (Supabase)
- **Аутентификация**: Supabase Auth
- **Хранилище файлов**: Supabase Storage / Cloudinary
- **ORM**: Prisma
- **Генерация QR**: qrcode.react
- **Генерация визиток**: vCard (.vcf)
- **Аналитика**: Chart.js

## Инструкция по установке и запуску

### Требования
- Node.js 18.x или выше
- npm или yarn

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/your-username/ntmy.git
cd ntmy

# Установить зависимости
npm install
# или
yarn install

# Настроить переменные окружения
cp .env.example .env.local
# Заполнить .env.local необходимыми значениями

# Запустить миграции Prisma
npx prisma migrate dev

# Запустить проект в режиме разработки
npm run dev
# или
yarn dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Структура проекта

```
ntmy/
├── src/
│   ├── components/     # React компоненты
│   ├── pages/          # Next.js страницы и маршруты
│   ├── api/            # API эндпоинты
│   ├── hooks/          # React хуки
│   ├── lib/            # Библиотеки и утилиты
│   ├── styles/         # CSS стили
│   └── utils/          # Вспомогательные функции
├── public/             # Статические файлы
├── prisma/             # Схема и миграции Prisma
└── ...
```

## Лицензия

MIT 

## MongoDB Integration

This project now uses MongoDB as the primary database for storing card data. Here's how to set it up:

### Setup

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (the free tier is sufficient)

2. **Create a Database User**
   - In the Security tab, create a database user with read/write permissions

3. **Allow Network Access**
   - In Network Access, add your IP address or allow access from anywhere for development

4. **Get Your Connection String**
   - Go to Clusters > Connect > Connect Your Application
   - Copy the connection string

5. **Update Environment Variables**
   - Edit `.env.local` and update the `MONGODB_URI` variable:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ntmy?retryWrites=true&w=majority
   ```
   - Replace `<username>`, `<password>`, and `<cluster>` with your values

### API Endpoints

The following API endpoints are available for card management:

- `GET /api/cards` - Get all cards (or filtered by userId)
- `GET /api/cards?username=<username>` - Get a card by username
- `POST /api/cards` - Create a new card
- `GET /api/cards/<id>` - Get a card by ID
- `PUT /api/cards/<id>` - Update a card
- `DELETE /api/cards/<id>` - Delete a card

### Local Development with MongoDB

For local development, you can:

1. **Use MongoDB Atlas**
   - Configure with your MongoDB Atlas connection string

2. **Use a local MongoDB server**
   - Install MongoDB Community Edition locally
   - Start the MongoDB server: `mongod --dbpath=/data`
   - Use connection string: `mongodb://localhost:27017/ntmy`

### Data Migration

Для миграции данных из Supabase в MongoDB выполните следующие шаги:

1. Установите необходимые зависимости:
   ```bash
   npm install @supabase/supabase-js mongoose dotenv fs path
   ```

2. Создайте файл `.env.migration` на основе примера:
   ```bash
   cp .env.migration.example .env.migration
   ```

3. Отредактируйте `.env.migration`, указав корректные данные для доступа к Supabase и MongoDB:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your-supabase-service-key
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ntmy
   ```

4. Запустите скрипт миграции:
   ```bash
   node scripts/migrate-supabase-to-mongodb.js
   ```

5. Создайте тестовые карточки (включая карточки для "carter", "osho" и другие):
   ```bash
   node scripts/create-test-cards.js
   ```

6. Проверьте результаты миграции с помощью скрипта верификации:
   ```bash
   node scripts/verify-mongodb.js
   ```

7. При необходимости создайте или обновите отдельную карточку:
   ```bash
   node scripts/create-carter-card.js
   ```

8. Создайте резервную копию данных из MongoDB:
   ```bash
   node scripts/backup-mongodb.js
   ```

Все резервные копии данных сохраняются в папке `backups/`.

### Backup & Restore

Регулярно создавайте резервные копии данных MongoDB:

```bash
# Резервное копирование через скрипт
node scripts/backup-mongodb.js

# Резервное копирование через mongodump
mongodump --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ntmy"

# Восстановление данных
mongorestore --uri="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ntmy" dump/
``` 