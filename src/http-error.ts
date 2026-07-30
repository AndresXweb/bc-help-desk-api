// Error con código HTTP asociado, para que el error handler global
// sepa qué status code responder (400, 404, etc.) en lugar de asumir 500.
export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'HttpError';
  }
}
