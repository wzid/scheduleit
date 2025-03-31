import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_AUTH_TOKEN) {
  throw new Error('Missing Turso database environment variables');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_DB_AUTH_TOKEN
  }
});
