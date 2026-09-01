// ============================================
// MIDDLEWARES — notFound
// ============================================
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/app-error';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, `Ruta ${req.method} ${req.path} no encontrada`));
}
