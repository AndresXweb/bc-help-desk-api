// ============================================
// CONTROLLER — Ticket
// ============================================
import { Request, Response, NextFunction } from 'express';
import * as ticketService from '../services/ticket.service';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.schema';
import { AppError } from '../errors/AppError';

export async function getTickets(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await ticketService.findAll();
    res.json({ data: tickets, total: tickets.length });
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketService.findById(req.params.id);
    if (!ticket) throw new AppError(404, 'Ticket not found');
    res.json({ data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');

    const { body } = createTicketSchema.parse({ body: req.body });
    const ticket = await ticketService.create(body, req.user.sub);
    res.status(201).json({ message: 'Ticket created', data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function updateTicket(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new AppError(401, 'Not authenticated');

    const { body } = updateTicketSchema.parse({ body: req.body });
    const ticket = await ticketService.update(req.params.id, body, req.user.sub, req.user.role as string);

    if (!ticket) throw new AppError(404, 'Ticket not found');
    res.json({ message: 'Ticket updated', data: ticket });
  } catch (err) {
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return next(new AppError(403, 'You can only update your own tickets'));
    }
    next(err);
  }
}

export async function deleteTicket(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ticket = await ticketService.remove(req.params.id);
    if (!ticket) throw new AppError(404, 'Ticket not found');
    res.json({ message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
}
