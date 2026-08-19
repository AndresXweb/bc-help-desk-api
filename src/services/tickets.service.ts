// ============================================
// SERVICE — Lógica de negocio
// ============================================
// Cero imports de Express. La validación de forma/tipo de los datos
// ya la hizo Zod en el controller; aquí solo vive la lógica de dominio
// (paginación, existencia del recurso) — lanza AppError cuando corresponde.

import { Ticket, PaginatedResponse, PaginationParams } from '../types';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import * as repo from '../repositories/tickets.repository';
import { AppError } from '../errors/app-error';

export async function findAll(params: PaginationParams): Promise<PaginatedResponse<Ticket>> {
  const { page, limit } = params;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Ticket> {
  const ticket = await repo.findById(id);
  if (!ticket) throw new AppError(404, `Ticket ${id} not found`);
  return ticket;
}

export async function create(dto: CreateTicketDto): Promise<Ticket> {
  return repo.create(dto);
}

export async function update(id: number, dto: UpdateTicketDto): Promise<Ticket> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Ticket ${id} not found`);
  const updated = await repo.update(id, dto);
  return updated!;
}

export async function remove(id: number): Promise<void> {
  const exists = await repo.findById(id);
  if (!exists) throw new AppError(404, `Ticket ${id} not found`);
  await repo.remove(id);
}
