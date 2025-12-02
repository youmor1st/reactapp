import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("\n❌ ОШИБКА: DATABASE_URL не установлен!\n");
  console.error("Создайте файл .env в корне проекта со следующим содержимым:");
  console.error("DATABASE_URL=postgresql://postgres:ваш_пароль@localhost:5432/projectapp");
  console.error("SESSION_SECRET=ваш-секретный-ключ\n");
  throw new Error(
    "DATABASE_URL must be set. Format: postgresql://user:password@host:port/projectapp"
  );
}

// Create connection pool
// DATABASE_URL should include database name: postgresql://user:password@host:port/projectapp
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
