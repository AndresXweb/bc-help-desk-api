// ============================================
// MODEL — Ticket (entidad principal, ref Category)
// ============================================
import { Schema, model, type InferSchemaType } from 'mongoose';

const ticketSchema = new Schema(
  {
    code: {
      type: String,
      required: [true, 'El code es requerido'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{2,4}-\d{4,8}$/, 'code debe tener formato ABC-1234, ej: TKT-1001'],
    },
    title: {
      type: String,
      required: [true, 'El title es requerido'],
      trim: true,
      minlength: [3, 'El title debe tener al menos 3 caracteres'],
      maxlength: [120, 'El title no puede superar 120 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'La description es requerida'],
      trim: true,
      minlength: [1, 'La description no puede estar vacía'],
      maxlength: [1000, 'La description no puede superar 1000 caracteres'],
    },
    status: {
      type: String,
      required: [true, 'El status es requerido'],
      enum: {
        values: ['open', 'in_progress', 'closed'],
        message: 'status debe ser open, in_progress o closed',
      },
    },
    priority: {
      type: String,
      required: [true, 'El priority es requerido'],
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'priority debe ser low, medium o high',
      },
    },
    estimatedHours: {
      type: Number,
      default: 1,
      min: [0.1, 'estimatedHours debe ser mayor a 0'],
    },
    agentId: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es requerida'],
    },
  },
  { timestamps: true }
);

export type TicketDoc = InferSchemaType<typeof ticketSchema>;
export const Ticket = model('Ticket', ticketSchema);
