import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use local SQLite database file
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, "../database.sqlite");

export const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL"); // Enable WAL mode for better concurrency

export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  migrate(db, { migrationsFolder: path.join(__dirname, "../migrations") });
} catch (error) {
  // Migrations folder might not exist yet, that's okay
  console.log("Migrations folder not found, skipping migrations");
}
