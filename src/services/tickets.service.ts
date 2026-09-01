// ============================================
// SERVICE — Ticket
// ============================================
import * as repo from '../repositories/tickets.repository';
import * as categoriesRepo from '../repositories/categories.repository';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import { PaginationParams } from '../types';
import { AppError } from '../errors/app-error';

async function assertCategoryExists(categoryId?: string): Promise<void> {
  if (!categoryId) return;
  const category = await categoriesRepo.findById(categoryId);
  if (!category) throw new AppError(400, 'La categoría indicada no existe');
}

export async function findAll(params: PaginationParams) {
  return repo.findAll(params.page, params.limit);
}

export async function findById(id: string) {
  const ticket = await repo.findById(id);
  if (!ticket) throw new AppError(404, `Ticket ${id} not found`);
  return ticket;
}

export async function create(dto: CreateTicketDto) {
  await assertCategoryExists(dto.category);
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateTicketDto) {
  await assertCategoryExists(dto.category);
  const updated = await repo.update(id, dto);
  if (!updated) throw new AppError(404, `Ticket ${id} not found`);
  return updated;
}

export async function remove(id: string): Promise<void> {
  const deleted = await repo.remove(id);
  if (!deleted) throw new AppError(404, `Ticket ${id} not found`);
}
