// ============================================
// REPOSITORY — Capa de acceso a datos
// ============================================
// Único punto de acceso al store en memoria. Todos los métodos son
// async y retornan copias defensivas (nunca la referencia interna).

import { Ticket } from '../types';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';

const store: Ticket[] = [
  {
    id: 1,
    title: 'Fallo en conexión VPN',
    description: 'El usuario no logra conectarse a la VPN corporativa desde casa.',
    status: 'open',
    priority: 'high',
    agentId: 'AGT-10',
    estimatedHours: 2,
    createdAt: '2026-07-20T09:00:00.000Z',
  },
  {
    id: 2,
    title: 'Impresora de red no responde',
    description: 'La impresora del piso 3 no imprime desde ningún equipo.',
    status: 'in_progress',
    priority: 'medium',
    agentId: 'AGT-12',
    estimatedHours: 1.5,
    createdAt: '2026-07-21T11:30:00.000Z',
  },
  {
    id: 3,
    title: 'Correo no sincroniza en el celular',
    description: 'El usuario no recibe correos nuevos en la app móvil de Outlook.',
    status: 'open',
    priority: 'low',
    estimatedHours: 1,
    createdAt: '2026-07-22T14:15:00.000Z',
  },
  {
    id: 4,
    title: 'Laptop muy lenta al iniciar',
    description: 'El equipo tarda más de 5 minutos en estar listo para trabajar.',
    status: 'closed',
    priority: 'medium',
    agentId: 'AGT-08',
    estimatedHours: 3,
    createdAt: '2026-07-18T08:45:00.000Z',
  },
  {
    id: 5,
    title: 'Solicitud de restablecimiento de contraseña',
    description: 'El usuario olvidó su contraseña de dominio y no puede iniciar sesión.',
    status: 'open',
    priority: 'low',
    estimatedHours: 0.5,
    createdAt: '2026-07-23T16:00:00.000Z',
  },
];
let nextId = 6;

export async function findAll(): Promise<Ticket[]> {
  return [...store];
}

export async function findById(id: number): Promise<Ticket | undefined> {
  const found = store.find((t) => t.id === id);
  return found ? { ...found } : undefined;
}

export async function create(dto: CreateTicketDto): Promise<Ticket> {
  const ticket: Ticket = { id: nextId++, ...dto, createdAt: new Date().toISOString() };
  store.push(ticket);
  return { ...ticket };
}

export async function update(id: number, dto: UpdateTicketDto): Promise<Ticket | undefined> {
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  store[index] = { ...store[index]!, ...dto };
  return { ...store[index]! };
}

export async function remove(id: number): Promise<boolean> {
  const index = store.findIndex((t) => t.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}
