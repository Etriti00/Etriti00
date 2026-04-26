import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5432/playground';

// Reuse the postgres client across hot reloads in dev (Next.js boilerplate).
const globalForPg = globalThis as unknown as { client?: ReturnType<typeof postgres> };
const client = globalForPg.client ?? postgres(connectionString, { max: 5 });
if (process.env.NODE_ENV !== 'production') globalForPg.client = client;

export const db = drizzle(client, { schema });
