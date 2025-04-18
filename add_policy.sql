-- Скрипт для добавления публичного доступа на чтение карточек
-- Можно выполнить в SQL Editor в интерфейсе Supabase

-- Добавление политики публичного чтения карточек по username
CREATE POLICY "Cards are publicly readable by username" 
ON cards FOR SELECT 
USING (true);

-- Альтернативные варианты политик (если нужно более тонкое управление):

-- 1. Политика чтения только опубликованных карточек (если добавить поле is_published):
-- CREATE POLICY "Published cards are publicly readable" 
-- ON cards FOR SELECT 
-- USING (is_published = true);

-- 2. Политика чтения карточек только по username:
-- CREATE POLICY "Cards are publicly readable by username only" 
-- ON cards FOR SELECT 
-- USING (username IS NOT NULL);

-- Для отладки можно временно отключить RLS (НЕ РЕКОМЕНДУЕТСЯ для production):
-- ALTER TABLE cards DISABLE ROW LEVEL SECURITY;

-- Проверка существующих политик:
-- SELECT * FROM pg_policies WHERE tablename = 'cards'; 