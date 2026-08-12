// ============================================
// SERVER — Entry point
// ============================================
import app from './app';

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

const server = app.listen(PORT, () => {
  console.log(`[server] Running on http://localhost:${PORT}`);
  console.log(`[server] Health: http://localhost:${PORT}/health`);
  console.log(`[server] API v1: http://localhost:${PORT}/api/v1/tickets`);
});

function shutdown(signal: string): void {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close(() => {
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
