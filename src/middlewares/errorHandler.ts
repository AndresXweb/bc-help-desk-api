// ============================================
// MIDDLEWARES — errorHandler (4 parámetros)
// ============================================
// Express detecta los error handlers por la cantidad de parámetros:
// con 3 parámetros lo trataría como middleware normal, por eso _next
// se mantiene aunque no se use.
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error';
import { logger } from '../config/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // 1. Errores de validación de Zod (p.ej. si en algún punto se usa .parse() en vez de .safeParse())
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Datos de entrada inválidos',
      issues: err.issues.map((issue) => ({ field: issue.path.join('.') || 'root', message: issue.message })),
    });
    return;
  }

  // 2. Errores operacionales del dominio
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${err.statusCode} - ${err.message}`);
    res.status(err.statusCode).json({
      error: 'Application Error',
      message: err.message,
    });
    return;
  }

  // 3. Error genérico / no controlado (bug real, no operacional)
  const isProduction = process.env['NODE_ENV'] === 'production';
  const message = err instanceof Error ? err.message : 'Error desconocido';
  const stack = err instanceof Error ? err.stack : undefined;

  logger.error(`[Unhandled] ${message}${stack ? `\n${stack}` : ''}`);

  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Ha ocurrido un error inesperado' : message,
    ...(isProduction ? {} : { stack }),
  });
}
