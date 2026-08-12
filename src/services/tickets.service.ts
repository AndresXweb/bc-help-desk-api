// ============================================
// SERVICE — Lógica de negocio
// ============================================
// Cero imports de Express. Contiene paginación y validaciones de
// dominio. Retorna `undefined` cuando no encuentra; el controller
// decide cómo traducir eso a una respuesta HTTP.

import {
  CreateTicketDto,
  UpdateTicketDto,
  Ticket,
  TicketStatus,
  TicketPriority,
  PaginatedResponse,
  PaginationParams,
} from '../types';
import * as repo from '../repositories/tickets.repository';
import { AppError } from '../errors/app-error';

const VALID_STATUSES: TicketStatus[] = ['open', 'in_progress', 'closed'];
const VALID_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high'];
const REQUIRED_FIELDS: Array<keyof CreateTicketDto> = ['title', 'description', 'status', 'priority'];

function validateCreateDto(dto: Partial<CreateTicketDto>): void {
  const missing = REQUIRED_FIELDS.filter((field) => dto[field] === undefined);
  if (missing.length > 0) {
    throw new AppError(400, `Faltan campos requeridos: ${missing.join(', ')}`);
  }
  if (!VALID_STATUSES.includes(dto.status as TicketStatus)) {
    throw new AppError(400, `status inválido: "${dto.status}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);
  }
  if (!VALID_PRIORITIES.includes(dto.priority as TicketPriority)) {
    throw new AppError(400, `priority inválido: "${dto.priority}". Valores permitidos: ${VALID_PRIORITIES.join(', ')}`);
  }
}

function validateUpdateDto(dto: UpdateTicketDto): void {
  if (dto.status !== undefined && !VALID_STATUSES.includes(dto.status)) {
    throw new AppError(400, `status inválido: "${dto.status}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);
  }
  if (dto.priority !== undefined && !VALID_PRIORITIES.includes(dto.priority)) {
    throw new AppError(400, `priority inválido: "${dto.priority}". Valores permitidos: ${VALID_PRIORITIES.join(', ')}`);
  }
}

export async function findAll(params: PaginationParams): Promise<PaginatedResponse<Ticket>> {
  const { page, limit } = params;
  const all = await repo.findAll();
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);
  return { data, total: all.length, page, limit };
}

export async function findById(id: number): Promise<Ticket | undefined> {
  return repo.findById(id);
}

export async function create(dto: CreateTicketDto): Promise<Ticket> {
  validateCreateDto(dto);
  return repo.create(dto);
}

export async function update(id: number, dto: UpdateTicketDto): Promise<Ticket | undefined> {
  const exists = await repo.findById(id);
  if (!exists) return undefined;
  validateUpdateDto(dto);
  return repo.update(id, dto);
}

export async function remove(id: number): Promise<boolean> {
  const exists = await repo.findById(id);
  if (!exists) return false;
  return repo.remove(id);
}
