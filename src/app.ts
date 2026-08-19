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

// 1. Middlewares generales
app.use(express.json());
app.use(morganMiddleware);

// 2. Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', week: '04', project: 'validacion-errores-logging', domain: 'help-desk' });
});

// 3. Rutas del dominio
app.use('/api/v1/tickets', ticketsRouter);

// 4. 404 — después de todas las rutas
app.use(notFound);

// 5. Error handler global — SIEMPRE el último app.use(), 4 parámetros
app.use(errorHandler);

export default app;
