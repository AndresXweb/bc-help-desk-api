// ============================================
// SCHEMAS — Ticket (dominio Help Desk)
// ============================================
import { z } from 'zod';

export const createTicketSchema = z.object({
  code: z
    .string({ error: 'code es obligatorio' })
    .regex(/^[A-Z]{2,4}-\d{4,8}$/, 'code debe tener formato ABC-1234, ej: TKT-1001'),
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
  estimatedHours: z.number().positive('estimatedHours debe ser mayor a 0').default(1),
  categoryId: z.string().uuid('categoryId debe ser un UUID válido').optional(),
});

export const updateTicketSchema = createTicketSchema.partial();

export type CreateTicketDto = z.infer<typeof createTicketSchema>;
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>;
