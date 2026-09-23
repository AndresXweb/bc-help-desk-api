import 'dotenv/config';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import cors from 'cors';
import { sanitize } from './middlewares/sanitize';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import ticketRoutes from './routes/ticket.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { globalLimiter, corsOptions } from './config/security';

const app: Express = express();

// Security layers — order matters
app.use(helmet());
app.use(globalLimiter);
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize inputs AFTER parsing, BEFORE routes
app.use(sanitize);

// Health check
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// Error handling (always last)
app.use(notFound);
app.use(errorHandler);

export { app };
