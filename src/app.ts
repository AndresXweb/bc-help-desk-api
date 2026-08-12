// ============================================
// APP — Configuración Express
// ============================================
import express from 'express';
import { ticketsRouter } from './routes/tickets.routes';
import { ErrorResponse } from './types';
import { AppError } from './errors/app-error';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', week: '03', project: 'api-arquitectura', domain: 'help-desk' });
});

app.use('/api/v1/tickets', ticketsRouter);

// Handler para rutas no encontradas
app.use((_req: express.Request, res: express.Response) => {
  const response: ErrorResponse = { error: 'Not Found', message: 'Route not found' };
  res.status(404).json(response);
});

// Error handler global — SIEMPRE el último app.use(), 4 parámetros
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const errorLabel = statusCode === 400 ? 'Bad Request' : 'Internal Server Error';
  console.error(`[error] ${statusCode} - ${err.message}`);
  const response: ErrorResponse = { error: errorLabel, message: err.message };
  res.status(statusCode).json(response);
});

export default app;
