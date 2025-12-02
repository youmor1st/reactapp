# Настройка PostgreSQL

## Создание базы данных

### 1. Установите PostgreSQL (если еще не установлен)

**Windows:**
- Скачайте с https://www.postgresql.org/download/windows/
- Или используйте установщик: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Создайте базу данных "projectapp"

Откройте терминал и выполните:

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE projectapp;

# Выйдите
\q
```

Или одной командой:
```bash
createdb -U postgres projectapp
```

### 3. Настройте переменную окружения

Создайте файл `.env` в корне проекта:

```env
DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/projectapp
SESSION_SECRET=ваш-секретный-ключ-для-сессий
NODE_ENV=development
BASE_URL=http://localhost:5000
```

**Формат DATABASE_URL:**
```
postgresql://username:password@host:port/database_name
```

Пример:
```
postgresql://postgres:mypassword@localhost:5432/projectapp
```

### 4. Примените миграции

```bash
npm run db:push
```

Это создаст все таблицы в базе данных.

### 5. Запустите проект

```bash
npm run dev
```

## Для production (Vercel, Railway, и т.д.)

Установите переменную окружения `DATABASE_URL` на вашей платформе:

**Vercel:**
- Settings → Environment Variables
- Добавьте `DATABASE_URL` с вашим PostgreSQL connection string

**Railway:**
- Создайте PostgreSQL сервис
- Railway автоматически создаст переменную `DATABASE_URL`

**Формат для облачных сервисов:**
```
postgresql://user:password@host:port/projectapp?sslmode=require
```

## Проверка подключения

После запуска проекта проверьте логи - должно быть сообщение о успешном подключении к базе данных.

