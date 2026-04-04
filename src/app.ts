import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { httpLogger } from './utils/logger';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(httpLogger);

  app.use('/', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

