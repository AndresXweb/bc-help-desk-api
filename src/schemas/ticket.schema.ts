// ============================================
// SCHEMAS — Ticket (dominio Help Desk)
// ============================================
import { z } from 'zod';

export const createTicketSchema = z.object({
  title: z
    .string({ error: 'title es obligatorio' })
    .min(3, 'title debe tener al menos 3 caracteres')
    .trim(),
  description: z
    .string({ error: 'description es obligatorio' })
    .min(1, 'description no puede estar vacío')
    .trim(),
  status: z.enum(['open', 'in_progress', 'closed'], {
    error: 'status es obligatorio y debe ser open, in_progress o closed',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    error: 'priority es obligatorio y debe ser low, medium o high',
  }),
  agentId: z.string().trim().optional(),
  // Horas estimadas para resolver el ticket — opcional, por defecto 1
  estimatedHours: z.number().positive('estimatedHours debe ser mayor a 0').default(1),
});

// Reutiliza el schema de creación con .partial() — todos los campos opcionales
export const updateTicketSchema = createTicketSchema.partial();

// Tipos inferidos desde los schemas (single source of truth)
export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
