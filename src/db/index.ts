import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// We use the non-pooling neon-http driver which is perfect for serverless (Next.js)
// Make sure to add DATABASE_URL to your .env.local file
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
