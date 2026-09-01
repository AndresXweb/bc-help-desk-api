// ============================================
// MODEL — Category (entidad secundaria)
// ============================================
import { Schema, model, type InferSchemaType } from 'mongoose';

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      unique: true,
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede superar 50 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'La descripción no puede superar 200 caracteres'],
    },
  },
  { timestamps: true }
);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model('Category', categorySchema);
