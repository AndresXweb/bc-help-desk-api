// ============================================
// ROUTES — Mapeo de URLs a controllers
// ============================================
// Solo conecta URL + método HTTP → función del controller.
// Sin lógica, sin acceso a services ni repositories.

import { Router } from 'express';
import * as controller from '../controllers/tickets.controller';

export const ticketsRouter = Router();

ticketsRouter.get('/', controller.getAll);
ticketsRouter.get('/:id', controller.getById);
ticketsRouter.post('/', controller.create);
ticketsRouter.put('/:id', controller.update);
ticketsRouter.delete('/:id', controller.remove);
