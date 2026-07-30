// ============================================
// TYPES: Dominio Help Desk — recurso principal Ticket
// ============================================

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  agentId?: string;
}

// DTO usado para crear un nuevo ticket (sin id, se genera automáticamente)
export type CreateTicketDto = Omit<Ticket, 'id'>;

// DTO para actualización (todos los campos editables)
export type UpdateTicketDto = Partial<CreateTicketDto>;
