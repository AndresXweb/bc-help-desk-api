import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes';
import ticketsRouter from './routes/tickets.routes';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';

export const app: Express = express();

app.use(express.json());
app.use(cookieParser());

// Rutas de autenticación
app.use('/api/v1/auth', authRouter);

// Recurso principal del dominio Help Desk
app.use('/api/v1/tickets', ticketsRouter);

// Middlewares de errores (siempre al final)
app.use(notFound);
app.use(errorHandler);
