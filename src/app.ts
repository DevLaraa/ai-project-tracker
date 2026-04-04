import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { httpLogger } from './utils/logger';

export function createApp() {
  const app = express();

  app.use(express.json({ limit: '1mb' }));
  app.use(
    cors(
      env.CORS_ORIGIN
        ? {
            origin: env.CORS_ORIGIN
          }
        : undefined
    )
  );
  app.use(helmet());
  app.use(httpLogger);

  app.use('/', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

