// ============================================
// SERVICE — Category
// ============================================
import * as repo from '../repositories/categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema';
import { AppError } from '../errors/app-error';

export async function findAll() {
  return repo.findAll();
}

export async function findById(id: string) {
  const category = await repo.findById(id);
  if (!category) throw new AppError(404, `Category ${id} not found`);
  return category;
}

export async function create(dto: CreateCategoryDto) {
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateCategoryDto) {
  const updated = await repo.update(id, dto);
  if (!updated) throw new AppError(404, `Category ${id} not found`);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await repo.remove(id);
  if (!deleted) throw new AppError(404, `Category ${id} not found`);
}
