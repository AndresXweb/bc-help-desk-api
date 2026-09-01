// ============================================
// ROUTES — Categories
// ============================================
import { Router } from 'express';
import * as controller from '../controllers/categories.controller';

export const categoriesRouter = Router();

categoriesRouter.get('/', controller.getAll);
categoriesRouter.get('/:id', controller.getById);
categoriesRouter.post('/', controller.create);
categoriesRouter.put('/:id', controller.update);
categoriesRouter.delete('/:id', controller.remove);
