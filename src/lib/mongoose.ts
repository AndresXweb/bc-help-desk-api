// ============================================
// LIB — Conexión MongoDB (una sola vez)
// ============================================
import mongoose from 'mongoose';
import { logger } from '../config/logger';

export async function connectDB(): Promise<void> {
  const uri = process.env['MONGODB_URI'];
  if (!uri) {
    throw new Error('MONGODB_URI is not defined');
  }
  await mongoose.connect(uri);
  logger.info('MongoDB connected');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
