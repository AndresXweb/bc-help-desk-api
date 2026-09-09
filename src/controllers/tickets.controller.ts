// ============================================
// CONTROLLER — Ticket
// ============================================
import { Request, Response, NextFunction } from 'express';
import * as ticketsService from '../services/tickets.service';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.schema';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tickets = await ticketsService.getAll();
    res.status(200).json(tickets);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ticket = await ticketsService.getById(req.params.id as string);
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = createTicketSchema.parse(req.body);
    const userId = req.user!.sub;
    const ticket = await ticketsService.create(dto, userId);
    res.status(201).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = updateTicketSchema.parse(req.body);
    const ticket = await ticketsService.update(req.params.id as string, dto);
    res.status(200).json(ticket);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ticketsService.remove(req.params.id as string);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
