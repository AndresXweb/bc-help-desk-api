import { Request, Response, NextFunction } from 'express';

function stripDangerousKeys(obj: unknown): void {
  if (obj === null || typeof obj !== 'object') return;
  for (const key of Object.keys(obj as Record<string, unknown>)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete (obj as Record<string, unknown>)[key];
      continue;
    }
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null) {
      stripDangerousKeys(value);
    }
  }
}

export function sanitize(req: Request, _res: Response, next: NextFunction): void {
  stripDangerousKeys(req.body);
  stripDangerousKeys(req.params);
  stripDangerousKeys(req.query); // muta el objeto existente, nunca reasigna req.query
  next();
}