// ============================================
// SERVICE — Ticket
// ============================================
import { Ticket, ITicket } from '../models/ticket.model';
import type { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import { AppError } from '../errors/AppError';

export async function findAll(): Promise<ITicket[]> {
  return Ticket.find({ active: true }).sort({ createdAt: -1 });
}

export async function findById(id: string): Promise<ITicket | null> {
  try {
    return await Ticket.findById(id);
  } catch (err) {
    if (err instanceof Error && err.name === 'CastError') {
      throw new AppError(400, `ID inválido: ${id}`);
    }
    throw err;
  }
}

export async function create(data: CreateTicketDto, userId: string): Promise<ITicket> {
  try {
    return await Ticket.create({ ...data, createdBy: userId });
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: number }).code === 11000) {
      throw new AppError(409, `Ya existe un ticket con code "${data.code}"`);
    }
    throw err;
  }
}

// Un usuario solo puede editar SU ticket; admin puede editar cualquiera.
export async function update(
  id: string,
  data: UpdateTicketDto,
  requesterId: string,
  requesterRole: string
): Promise<ITicket | null> {
  const ticket = await findById(id);
  if (!ticket) return null;

  if (requesterRole !== 'admin' && ticket.createdBy !== requesterId) {
    throw new Error('FORBIDDEN'); // capturado en el controller → AppError(403)
  }

  return Ticket.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function remove(id: string): Promise<ITicket | null> {
  return Ticket.findByIdAndDelete(id);
}
