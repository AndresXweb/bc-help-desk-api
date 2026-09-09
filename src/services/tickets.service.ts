// ============================================
// SERVICE — Ticket
// ============================================
import { ITicket } from '../models/ticket.model';
import * as ticketsRepository from '../repositories/tickets.repository';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import { AppError } from '../errors/AppError';

export async function getAll(): Promise<ITicket[]> {
  return ticketsRepository.findAll();
}

export async function getById(id: string): Promise<ITicket> {
  const ticket = await ticketsRepository.findById(id);
  if (!ticket) throw new AppError(404, `Ticket ${id} no encontrado`);
  return ticket;
}

export async function create(dto: CreateTicketDto, userId: string): Promise<ITicket> {
  return ticketsRepository.create({ ...dto, createdBy: userId });
}

export async function update(id: string, dto: UpdateTicketDto): Promise<ITicket> {
  const ticket = await ticketsRepository.updateById(id, dto);
  if (!ticket) throw new AppError(404, `Ticket ${id} no encontrado`);
  return ticket;
}

export async function remove(id: string): Promise<void> {
  const deleted = await ticketsRepository.deleteById(id);
  if (!deleted) throw new AppError(404, `Ticket ${id} no encontrado`);
}
