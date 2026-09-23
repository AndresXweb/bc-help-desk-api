import rateLimit from 'express-rate-limit';
import cors, { CorsOptions } from 'cors';

// En tests, muchos `it()` seguidos golpean /auth/register o /auth/login
// más veces de lo que el límite real permitiría — no es fuerza bruta,
// es la propia suite. Desactivamos el conteo solo en NODE_ENV=test.
const skipInTests = (): boolean => process.env.NODE_ENV === 'test';

// Global limiter — all endpoints: 100 req / 15 min
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many requests, please try again later' },
});

// Auth limiter — login/register only: 5 req / 15 min (brute force protection)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: skipInTests,
  message: { error: 'Too many login attempts, please try again later' },
});

// CORS whitelist — add your frontend origin here
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3001',
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
