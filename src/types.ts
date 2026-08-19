// ============================================
// TYPES — Dominio Help Desk (recurso: Ticket)
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  agentId?: string; // agente asignado, opcional
  estimatedHours: number; // horas estimadas para resolver el ticket
  createdAt: string;
}

// Nota: CreateTicketDto y UpdateTicketDto ya NO se definen aquí —
// se infieren desde los schemas de Zod (src/schemas/ticket.schema.ts)
// con z.infer<>, para que el schema sea la única fuente de verdad.

// Contratos de respuesta (no cambiar nombres — son genéricos)
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
