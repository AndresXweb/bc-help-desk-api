import type { Ticket, CreateTicketDto, UpdateTicketDto } from './types.js';

// Store en memoria — simula una base de datos sin persistencia.
// Los datos se pierden al reiniciar el servidor (se usará BD a partir de week-05).
const tickets: Ticket[] = [
  {
    id: 1,
    title: 'Fallo en conexión VPN',
    description: 'El usuario no logra conectarse a la VPN corporativa desde casa.',
    status: 'open',
    priority: 'high',
    agentId: 'AGT-10',
  },
  {
    id: 2,
    title: 'Impresora de red no responde',
    description: 'La impresora del piso 3 no imprime desde ningún equipo.',
    status: 'in_progress',
    priority: 'medium',
    agentId: 'AGT-12',
  },
];
let nextId = 3;

export function getAll(): Ticket[] {
  return tickets;
}

export function getById(id: number): Ticket | undefined {
  return tickets.find((t) => t.id === id);
}

export function create(data: CreateTicketDto): Ticket {
  const newTicket: Ticket = { id: nextId++, ...data };
  tickets.push(newTicket);
  return newTicket;
}

export function update(id: number, data: UpdateTicketDto): Ticket | undefined {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return undefined;
  Object.assign(ticket, data);
  return ticket;
}

export function remove(id: number): boolean {
  const index = tickets.findIndex((t) => t.id === id);
  if (index === -1) return false;
  tickets.splice(index, 1);
  return true;
}
