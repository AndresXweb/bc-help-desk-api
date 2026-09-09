// ============================================
// REPOSITORY — Ticket
// ============================================
import { TicketModel, ITicket } from '../models/ticket.model';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import { AppError } from '../errors/AppError';

interface CreateTicketData extends CreateTicketDto {
  createdBy: string;
}

export async function findAll(): Promise<ITicket[]> {
  return TicketModel.find().sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<ITicket | null> {
  try {
    return await TicketModel.findById(id);
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      throw new AppError(400, `ID inválido: ${id}`);
    }
    throw err;
  }
}

export async function create(data: CreateTicketData): Promise<ITicket> {
  try {
    return await TicketModel.create(data);
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000) {
      throw new AppError(409, `Ya existe un ticket con code "${data.code}"`);
    }
    throw err;
  }
}

export async function updateById(id: string, data: UpdateTicketDto): Promise<ITicket | null> {
  try {
    return await TicketModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'CastError') {
      throw new AppError(400, `ID inválido: ${id}`);
    }
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000) {
      throw new AppError(409, 'Ya existe un ticket con ese code');
    }
    throw err;
  }
}

export async function deleteById(id: string): Promise<boolean> {
  try {
    const result = await TicketModel.findByIdAndDelete(id);
    return result !== null;
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      throw new AppError(400, `ID inválido: ${id}`);
    }
    throw err;
  }
}
