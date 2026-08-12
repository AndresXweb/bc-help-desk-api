// ============================================
// APP ERROR — error de dominio con status HTTP asociado
// ============================================
// Sin dependencia de Express: puede lanzarse desde el service
// sin romper la regla "cero imports de Express en la capa service".
export class AppError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
