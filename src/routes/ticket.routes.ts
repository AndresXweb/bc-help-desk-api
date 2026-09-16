// ============================================
// ROUTES — Ticket
// ============================================
// Decisión de diseño: Help Desk es un sistema interno, no un catálogo
// público — por eso NINGUNA ruta es pública, todas requieren sesión.
//
//   GET  /            → autenticado (cualquier rol)
//   GET  /:id          → autenticado (cualquier rol)
//   POST /            → autenticado (cualquier rol puede reportar un ticket)
//   PATCH /:id          → autenticado; el service verifica dueño O admin
//   DELETE /:id          → SOLO admin
import { Router } from 'express';
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from '../controllers/ticket.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/requireRole';

const router: Router = Router();

router.use(authMiddleware);

router.get('/', getTickets);
router.get('/:id', getTicketById);
router.post('/', createTicket);
router.patch('/:id', updateTicket);
router.delete('/:id', requireRole('admin'), deleteTicket);

export default router;
