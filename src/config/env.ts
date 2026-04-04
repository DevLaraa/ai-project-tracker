import dotenv from 'dotenv';

dotenv.config();

function required(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseNumber(name: string, value: string | undefined, fallback: number): number {
  if (value === undefined || value === '') return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`Environment variable ${name} must be a number`);
  return n;
}

function parseString(value: string | undefined, fallback: string): string {
  if (value === undefined || value.trim() === '') return fallback;
  return value;
}

function optionalString(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  return value;
}

const DATABASE_URL_FROM_ENV = process.env.DATABASE_URL;

const canBuildFromParts =
  process.env.DB_USER &&
  process.env.DB_HOST &&
  process.env.DB_NAME &&
  (process.env.DB_PASSWORD !== undefined);

const DATABASE_URL = (() => {
  if (DATABASE_URL_FROM_ENV) return DATABASE_URL_FROM_ENV;

  if (!canBuildFromParts) {
    // Let required() throw a helpful message.
    return undefined;
  }

  const passwordPart = process.env.DB_PASSWORD ? `:${process.env.DB_PASSWORD}` : '';
  const portPart = process.env.DB_PORT ?? '5432';
  return `postgresql://${process.env.DB_USER}${passwordPart}@${process.env.DB_HOST}:${portPart}/${process.env.DB_NAME}`;
})();

export const env = {
  NODE_ENV: required('NODE_ENV', process.env.NODE_ENV),
  PORT: parseNumber('PORT', process.env.PORT, 3000),

  DATABASE_URL: required('DATABASE_URL', DATABASE_URL),
  JWT_SECRET: required('JWT_SECRET', process.env.JWT_SECRET),
  JWT_EXPIRES_IN: parseString(process.env.JWT_EXPIRES_IN, '1h'),
  BCRYPT_SALT_ROUNDS: parseNumber('BCRYPT_SALT_ROUNDS', process.env.BCRYPT_SALT_ROUNDS, 10),
  AI_API_BASE_URL: parseString(process.env.AI_API_BASE_URL, 'https://api.openai.com/v1'),
  AI_MODEL: parseString(process.env.AI_MODEL, 'gpt-4o-mini'),
  AI_API_KEY: optionalString(process.env.AI_API_KEY),

  // Tuning for the API; adjust to taste.
  DEFAULT_PAGE_LIMIT: parseNumber('DEFAULT_PAGE_LIMIT', process.env.DEFAULT_PAGE_LIMIT, 25),
  MAX_PAGE_LIMIT: parseNumber('MAX_PAGE_LIMIT', process.env.MAX_PAGE_LIMIT, 100)
} as const;

