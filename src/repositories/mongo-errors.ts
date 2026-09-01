// ============================================
// REPOSITORY HELPERS — errores Mongo/Mongoose
// ============================================
import mongoose from 'mongoose';
import { AppError } from '../errors/app-error';

function isDuplicateKeyError(
  err: unknown
): err is { code: number; keyValue?: Record<string, unknown> } {
  return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 11000;
}

export function handleMongoWriteError(err: unknown): never {
  if (isDuplicateKeyError(err)) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo';
    throw new AppError(409, `El ${field} ya está registrado`);
  }
  if (err instanceof mongoose.Error.CastError) {
    throw new AppError(400, 'ID inválido');
  }
  throw err;
}

export function handleMongoReadError(err: unknown): never {
  if (err instanceof mongoose.Error.CastError) {
    throw new AppError(400, 'ID inválido');
  }
  throw err;
}
