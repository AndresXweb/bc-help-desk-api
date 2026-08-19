// ============================================
// SERVER — Entry point
// ============================================
import app from './app';
import { logger } from './config/logger';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
  logger.info(`Health: http://localhost:${PORT}/health`);
  logger.info(`API v1: http://localhost:${PORT}/api/v1/tickets`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    logger.info('Servidor cerrado correctamente.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
