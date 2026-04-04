import { Pool } from 'pg';
import { env } from '../config/env';

// A single shared pool for the whole process.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === 'production'
      ? {
          // Many managed Postgres providers require SSL.
          rejectUnauthorized: false
        }
      : undefined
});

