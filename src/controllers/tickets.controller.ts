// ============================================
// CONTROLLER — Interfaz HTTP (thin controller)
// ============================================
// Extraer → validar con Zod → llamar service → responder.
// Los 404 ahora los lanza el service como AppError; aquí solo se
// capturan con next(err) y los resuelve el errorHandler global.

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/tickets.service';
import { createTicketSchema, updateTicketSchema } from '../schemas/ticket.schema';
import { SingleResponse, PaginatedResponse } from '../types';

// Schema para validar el parámetro :id
const idSchema = z.coerce.number().int().positive({
  message: 'El id debe ser un número entero positivo',
});

// Helper para formatear issues de un ZodError — evita duplicación
function formatIssues(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'id',
    message: issue.message,
  }));
}

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await service.findAll({ page, limit });
    res.status(200).json(result satisfies PaginatedResponse<(typeof result.data)[number]>);
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = idSchema.safeParse(req.params['id']);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsed.error),
      });
      return;
    }
    const ticket = await service.findById(parsed.data);
    res.status(200).json({ data: ticket } satisfies SingleResponse<typeof ticket>);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = createTicketSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const ticket = await service.create(result.data);
    res.status(201).json({ data: ticket } satisfies SingleResponse<typeof ticket>);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedId = idSchema.safeParse(req.params['id']);
    if (!parsedId.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsedId.error),
      });
      return;
    }
    const result = updateTicketSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const ticket = await service.update(parsedId.data, result.data);
    res.status(200).json({ data: ticket } satisfies SingleResponse<typeof ticket>);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = idSchema.safeParse(req.params['id']);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsed.error),
      });
      return;
    }
    await service.remove(parsed.data);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
