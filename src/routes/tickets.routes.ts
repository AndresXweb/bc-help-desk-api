import { Router } from 'express';
import * as store from '../store.js';
import { HttpError } from '../http-error.js';
import type { CreateTicketDto, UpdateTicketDto } from '../types.js';

export const ticketsRouter = Router();

// Campos obligatorios al crear un ticket
const REQUIRED_FIELDS = ['title', 'description', 'status', 'priority'] as const;

function validateCreateDto(body: Partial<CreateTicketDto>): void {
  const missing = REQUIRED_FIELDS.filter((field) => body[field] === undefined);
  if (missing.length > 0) {
    throw new HttpError(400, `Faltan campos requeridos: ${missing.join(', ')}`);
  }
}

const VALID_STATUSES = ['open', 'in_progress', 'closed'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];

// Validación para PUT: el body no puede venir vacío, y si trae status/priority
// deben ser valores válidos del dominio (no se exige que estén todos los campos).
function validateUpdateDto(body: UpdateTicketDto): void {
  if (!body || Object.keys(body).length === 0) {
    throw new HttpError(400, 'El cuerpo de la petición no puede estar vacío');
  }
  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    throw new HttpError(400, `status inválido: "${body.status}". Valores permitidos: ${VALID_STATUSES.join(', ')}`);
  }
  if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
    throw new HttpError(400, `priority inválido: "${body.priority}". Valores permitidos: ${VALID_PRIORITIES.join(', ')}`);
  }
}

// GET /api/v1/tickets — Listar todos los tickets
// Status: 200
ticketsRouter.get('/', (_req, res) => {
  res.status(200).json(store.getAll());
});

// GET /api/v1/tickets/:id — Obtener ticket por ID
// Status: 200 si existe | 404 si no existe
ticketsRouter.get('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const ticket = store.getById(id);
  if (!ticket) {
    return next(new HttpError(404, `Ticket con id ${id} no encontrado`));
  }
  res.status(200).json(ticket);
});

// POST /api/v1/tickets — Crear nuevo ticket
// Status: 201 con el recurso creado | 400 si faltan campos
ticketsRouter.post('/', (req, res, next) => {
  try {
    validateCreateDto(req.body ?? {});
    const newTicket = store.create(req.body as CreateTicketDto);
    res.status(201).json(newTicket);
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/tickets/:id — Actualizar ticket completo
// Status: 200 con el recurso actualizado | 400 si el body es inválido | 404 si no existe
ticketsRouter.put('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const body = (req.body ?? {}) as UpdateTicketDto;
    validateUpdateDto(body);

    const updated = store.update(id, body);
    if (!updated) {
      return next(new HttpError(404, `Ticket con id ${id} no encontrado`));
    }
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/tickets/:id — Eliminar ticket
// Status: 204 sin body | 404 si no existe
ticketsRouter.delete('/:id', (req, res, next) => {
  const id = Number(req.params.id);
  const removed = store.remove(id);
  if (!removed) {
    return next(new HttpError(404, `Ticket con id ${id} no encontrado`));
  }
  res.status(204).send();
});
