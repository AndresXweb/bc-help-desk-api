// ============================================
// SCHEMA — Ticket
// ============================================
import { z } from 'zod';

// Sin caracteres < > — previene que HTML/scripts se guarden en la DB (XSS)
const noHtml = /^[^<>]*$/;

export const createTicketSchema = z.object({
  body: z.object({
    code: z
      .string({ error: 'code es obligatorio' })
      .regex(/^[A-Z]{2,4}-\d{4,8}$/i, 'code debe tener formato ABC-1234 (ej: TKT-1001)'),
    title: z
      .string({ error: 'title es obligatorio' })
      .trim()
      .min(3, 'title debe tener al menos 3 caracteres')
      .max(120)
      .regex(noHtml, 'title no puede contener caracteres HTML'),
    description: z
      .string({ error: 'description es obligatorio' })
      .trim()
      .min(1, 'description no puede estar vacío')
      .max(1000)
      .regex(noHtml, 'description no puede contener caracteres HTML'),
    status: z.enum(['open', 'in_progress', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    estimatedHours: z.number().positive('estimatedHours debe ser mayor a 0'),
    agentId: z.string().trim().optional(),
  }),
});

export const updateTicketSchema = z.object({
  body: z.object({
    title: z.string().trim().min(3).max(120).regex(noHtml).optional(),
    description: z.string().trim().min(1).max(1000).regex(noHtml).optional(),
    status: z.enum(['open', 'in_progress', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    estimatedHours: z.number().positive().optional(),
    agentId: z.string().trim().optional(),
    active: z.boolean().optional(),
  }),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>['body'];
export type UpdateTicketDto = z.infer<typeof updateTicketSchema>['body'];
