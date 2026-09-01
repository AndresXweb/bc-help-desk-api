// ============================================
// SERVER — Entry point
// connectDB() ANTES de listen() — una sola vez
// ============================================
import 'dotenv/config';
import app from './app';
import { connectDB, disconnectDB } from './lib/mongoose';
import { logger } from './config/logger';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`Health: http://localhost:${PORT}/health`);
    logger.info(`Tickets: http://localhost:${PORT}/api/v1/tickets`);
    logger.info(`Categories: http://localhost:${PORT}/api/v1/categories`);
  });

  function shutdown(signal: string): void {
    logger.info(`${signal} recibido. Cerrando servidor...`);
    server.close(() => {
      void disconnectDB().finally(() => {
        logger.info('Servidor cerrado correctamente.');
        process.exit(0);
      });
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
