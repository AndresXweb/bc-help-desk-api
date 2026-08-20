// ============================================
// SERVICE — Lógica de negocio
// ============================================
// Cero imports de Express. La validación de forma/tipo de los datos
// ya la hizo Zod en el controller; aquí solo vive la lógica de dominio.

import { PaginationParams } from '../types';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import * as repo from '../repositories/tickets.repository';

export async function findAll(params: PaginationParams) {
  return repo.findAll(params.page, params.limit);
}

export async function findById(id: string) {
  return repo.findById(id);
}

export async function create(dto: CreateTicketDto) {
  return repo.create(dto);
}

export async function update(id: string, dto: UpdateTicketDto) {
  return repo.update(id, dto);
}

export async function remove(id: string): Promise<void> {
  await repo.remove(id);
}
