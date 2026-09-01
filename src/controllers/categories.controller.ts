// ============================================
// CONTROLLER — Categories
// ============================================
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as service from '../services/categories.service';
import { createCategorySchema, updateCategorySchema, objectIdSchema } from '../schemas/category.schema';
import { SingleResponse } from '../types';

function formatIssues(error: z.ZodError): Array<{ field: string; message: string }> {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'id',
    message: issue.message,
  }));
}

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await service.findAll();
    res.status(200).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = objectIdSchema.safeParse(req.params['id']);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsed.error),
      });
      return;
    }
    const category = await service.findById(parsed.data);
    res.status(200).json({ data: category } satisfies SingleResponse<typeof category>);
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = createCategorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const category = await service.create(result.data);
    res.status(201).json({ data: category } satisfies SingleResponse<typeof category>);
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedId = objectIdSchema.safeParse(req.params['id']);
    if (!parsedId.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Parámetro inválido',
        issues: formatIssues(parsedId.error),
      });
      return;
    }
    const result = updateCategorySchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Datos de entrada inválidos',
        issues: formatIssues(result.error),
      });
      return;
    }
    const category = await service.update(parsedId.data, result.data);
    res.status(200).json({ data: category } satisfies SingleResponse<typeof category>);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = objectIdSchema.safeParse(req.params['id']);
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
