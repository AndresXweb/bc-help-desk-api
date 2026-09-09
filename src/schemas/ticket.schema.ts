// ============================================
// SCHEMA — Ticket
// ============================================
import { z } from 'zod';

export const createTicketSchema = z.object({
  code: z
    .string({ error: 'code es obligatorio' })
    .regex(/^[A-Z]{2,4}-\d{4,8}$/i, 'code debe tener formato ABC-1234 (ej: TKT-1001)'),
  title: z.string({ error: 'title es obligatorio' }).trim().min(3, 'title debe tener al menos 3 caracteres'),
  description: z.string({ error: 'description es obligatorio' }).trim().min(1, 'description no puede estar vacío'),
  status: z.enum(['open', 'in_progress', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedHours: z.number().positive('estimatedHours debe ser mayor a 0'),
  agentId: z.string().trim().optional(),
});

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
