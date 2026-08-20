// ============================================
// APP — Configuración Express
// Middlewares y rutas registrados en el ORDEN correcto.
// ============================================
import express from 'express';
import { morganMiddleware } from './config/logger';
import { ticketsRouter } from './routes/tickets.routes';
import { notFound } from './middlewares/notFound';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(morganMiddleware);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    week: '05',
    project: 'postgresql-prisma',
    domain: 'help-desk',
  });
});

app.use('/api/v1/tickets', ticketsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
