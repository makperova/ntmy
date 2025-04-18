#!/bin/bash

# Настройки Supabase
SUPABASE_URL="https://phfdwwehrkajvlsihqgj.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoZmR3d2VocmthanZsc2locWdqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUzMDA5NiwiZXhwIjoyMDU5MTA2MDk2fQ.gdLb7pg31mPY1qDmtcz96kvN2bsTlU1GdP3PhUEVKh0"

# SQL-запрос для добавления политики
SQL_QUERY="CREATE POLICY \"Cards are publicly readable by username\" ON cards FOR SELECT USING (true);"

echo "Пытаемся добавить политику безопасности..."
echo "SQL-запрос: $SQL_QUERY"

# Выполняем SQL-запрос через REST API
curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL_QUERY\"}"

echo -e "\nЗапрос выполнен. Проверьте ответ выше."
echo "Если вы видите ответ 'exec_sql is not a valid function' или другую ошибку,"
echo "выполните SQL-запрос через SQL Editor в веб-интерфейсе Supabase." 