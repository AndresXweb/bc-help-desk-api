// ============================================
// MIDDLEWARES — notFound
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

// 3 parámetros → middleware normal (no error handler). Se registra
// DESPUÉS de todas las rutas: si llegó hasta aquí, ninguna coincidió.
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Ruta ${req.method} ${req.path} no encontrada`));
}
