// ============================================
// ROUTES — Ticket (todas protegidas con authMiddleware)
// ============================================
import { Router } from 'express';
import * as ticketsController from '../controllers/tickets.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.use(authMiddleware);

router.get('/', ticketsController.getAll);
router.get('/:id', ticketsController.getById);
router.post('/', ticketsController.create);
router.patch('/:id', ticketsController.update);
router.delete('/:id', ticketsController.remove);

export default router;
