import express from 'express';
import type { Application, Request, Response, NextFunction } from 'express';
import { ticketsRouter } from './routes/tickets.routes.js';
import { HttpError } from './http-error.js';

export function createApp(): Application {
  const app = express();

  // 1. express.json() — parseo de body (requerido para POST/PUT)
  app.use(express.json());

  // 2. Logger personalizado — método, ruta, status y duración
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });

  // 3. Health check
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // 4. Rutas del recurso principal
  app.use('/api/v1/tickets', ticketsRouter);

  // 5. Handler para rutas no encontradas (404)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // 6. Error handler global — SIEMPRE el último app.use(), 4 parámetros
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof HttpError ? err.statusCode : 500;
    const message = statusCode === 500 ? 'Internal server error' : err.message;
    console.error(`[error] ${statusCode} - ${err.message}`);
    res.status(statusCode).json({ error: message });
  });

  return app;
}
