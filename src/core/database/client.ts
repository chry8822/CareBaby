import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const expoDb = openDatabaseSync('carebaby.db', { enableChangeListener: true });

expoDb.execSync('PRAGMA journal_mode = WAL;');

function ensureTables(): void {
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS feedings (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      duration_minutes INTEGER,
      amount_ml REAL,
      note TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS sleeps (
      id TEXT PRIMARY KEY NOT NULL,
      start_time INTEGER NOT NULL,
      end_time INTEGER,
      quality TEXT,
      note TEXT,
      created_at INTEGER NOT NULL
    );
  `);
  expoDb.execSync(`
    CREATE TABLE IF NOT EXISTS diapers (
      id TEXT PRIMARY KEY NOT NULL,
      timestamp INTEGER NOT NULL,
      type TEXT NOT NULL,
      color TEXT,
      note TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

ensureTables();

export const db = drizzle(expoDb, { schema });
