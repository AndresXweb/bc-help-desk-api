// ============================================
// CONTROLLER — Interfaz HTTP (thin controller)
// ============================================
// Exactamente 3 pasos por función: extraer → llamar service → responder.
// Sin lógica de negocio. Los 404 se traducen aquí porque son parte de
// la traducción resultado-de-dominio → respuesta HTTP, no de negocio.

import { Request, Response, NextFunction } from 'express';
import * as service from '../services/tickets.service';
import { CreateTicketDto, UpdateTicketDto, ErrorResponse } from '../types';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await service.findAll({ page, limit });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const ticket = await service.findById(id);
    if (!ticket) {
      const response: ErrorResponse = { error: 'Not Found', message: `Ticket ${id} not found` };
      res.status(404).json(response);
      return;
    }
    res.status(200).json({ data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = req.body as CreateTicketDto;
    const ticket = await service.create(dto);
    res.status(201).json({ data: ticket });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const dto = req.body as UpdateTicketDto;
    const updated = await service.update(id, dto);
    if (!updated) {
      const response: ErrorResponse = { error: 'Not Found', message: `Ticket ${id} not found` };
      res.status(404).json(response);
      return;
    }
    res.status(200).json({ data: updated });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Number(req.params['id']);
    const removed = await service.remove(id);
    if (!removed) {
      const response: ErrorResponse = { error: 'Not Found', message: `Ticket ${id} not found` };
      res.status(404).json(response);
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
