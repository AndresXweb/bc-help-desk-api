// ============================================
// ERRORS — AppError (errores operacionales del dominio)
// ============================================
// Sin dependencia de Express: puede lanzarse desde el service
// sin romper la regla "cero imports de Express en la capa service".
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';

    // Mantiene la cadena de prototipos correcta al extender una clase nativa
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
