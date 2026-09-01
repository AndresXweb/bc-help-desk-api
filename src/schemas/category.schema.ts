// ============================================
// SCHEMAS — Category (Zod)
// ============================================
import { z } from 'zod';

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'El id debe ser un ObjectId válido');

export const createCategorySchema = z.object({
  name: z
    .string({ error: 'name es obligatorio' })
    .min(2, 'name debe tener al menos 2 caracteres')
    .max(50, 'name no puede superar 50 caracteres')
    .trim(),
  description: z.string().max(200).trim().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
