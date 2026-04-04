import process from 'node:process';
import { env } from './config/env';
import { pool } from './db/pool';
import { createApp } from './app';
import { logger } from './utils/logger';

const app = createApp();

async function ensureDbConnection() {
  // Fail fast if the DB credentials are wrong.
  await pool.query('SELECT 1');
}

async function start() {
  try {
    await ensureDbConnection();

    const server = app.listen(env.PORT, () => {
      logger.info(`API listening on :${env.PORT}`);
    });

    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down...`);
      server.close(() => logger.info('HTTP server closed'));
      await pool.end();
      process.exit(0);
    };

    process.on('SIGINT', () => void shutdown('SIGINT'));
    process.on('SIGTERM', () => void shutdown('SIGTERM'));
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

void start();

