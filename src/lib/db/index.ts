import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

const client = createClient({ url: env.TURSO_DB_URL, authToken: env.TURSO_DB_AUTH_TOKEN });

export const db = drizzle(client, { schema });
