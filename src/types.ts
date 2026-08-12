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
  createdAt: string;
}

// DTO para crear — sin campos auto-generados
export type CreateTicketDto = Omit<Ticket, 'id' | 'createdAt'>;

// DTO para actualizar — todos los campos opcionales
export type UpdateTicketDto = Partial<CreateTicketDto>;

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
}

export interface PaginationParams {
  page: number;
  limit: number;
}
