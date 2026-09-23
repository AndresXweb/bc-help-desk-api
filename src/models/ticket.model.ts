// ============================================
// MODELO — Ticket (recurso principal del dominio Help Desk)
// ============================================
import { Schema, model, Document } from 'mongoose';

export type TicketStatus = 'open' | 'in_progress' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high';

export interface ITicket extends Document {
  code: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  estimatedHours: number;
  agentId?: string;
  active: boolean;
  createdBy: string; // user ID — usado para la regla "dueño O admin" en PATCH
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    code: {
      type: String,
      required: [true, 'code es obligatorio'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2,4}-\d{4,8}$/, 'code debe tener formato ABC-1234 (ej: TKT-1001)'],
    },
    title: {
      type: String,
      required: [true, 'title es obligatorio'],
      trim: true,
      minlength: [3, 'title debe tener al menos 3 caracteres'],
      maxlength: [120, 'title no puede superar 120 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'description es obligatorio'],
      trim: true,
    },
    status: {
      type: String,
      enum: { values: ['open', 'in_progress', 'closed'], message: 'status debe ser open, in_progress o closed' },
      default: 'open',
    },
    priority: {
      type: String,
      enum: { values: ['low', 'medium', 'high'], message: 'priority debe ser low, medium o high' },
      default: 'low',
    },
    estimatedHours: {
      type: Number,
      required: [true, 'estimatedHours es obligatorio'],
      min: [0.5, 'estimatedHours debe ser mayor o igual a 0.5'],
    },
    agentId: { type: String, trim: true },
    active: { type: Boolean, default: true },
    createdBy: { type: String, required: true }, // user ID
  },
  { timestamps: true }
);

export const Ticket = model<ITicket>('Ticket', ticketSchema);
