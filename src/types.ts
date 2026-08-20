// ============================================
// TYPES — Contratos de respuesta (Help Desk)
// ============================================
// Los tipos de Ticket y Category se derivan de Prisma Client
// (import { Ticket, Category } from '@prisma/client').
// No se duplican interfaces de dominio aquí.

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message: string;
  stack?: string;
}

export interface ValidationErrorResponse {
  error: string;
  message: string;
  issues: Array<{ field: string; message: string }>;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
