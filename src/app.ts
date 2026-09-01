// ============================================
// APP — Configuración Express
// ============================================
import express from 'express';
import { morganMiddleware } from './config/logger';
import { ticketsRouter } from './routes/tickets.routes';
import { categoriesRouter } from './routes/categories.routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(morganMiddleware);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    week: '06',
    project: 'mongodb-mongoose',
    domain: 'help-desk',
  });
});

app.use('/api/v1/tickets', ticketsRouter);
app.use('/api/v1/categories', categoriesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
