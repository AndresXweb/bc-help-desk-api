// ============================================
// REPOSITORY — Acceso a datos con Prisma
// ============================================
// Único punto de acceso a PostgreSQL. Maneja errores P2002 y P2025.

import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { prisma } from '../lib/prisma';
import { AppError } from '../errors/app-error';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';

export async function findAll(page: number, limit: number) {
  const [data, total] = await Promise.all([
    prisma.ticket.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    }),
    prisma.ticket.count(),
  ]);
  return { data, total, page, limit };
}

export async function findById(id: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!ticket) {
    throw new AppError(404, `Ticket ${id} not found`);
  }
  return ticket;
}

export async function create(dto: CreateTicketDto) {
  try {
    return await prisma.ticket.create({
      data: {
        code: dto.code,
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        estimatedHours: dto.estimatedHours ?? 1,
        agentId: dto.agentId,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe un registro con ese valor único');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(400, 'La categoría indicada no existe');
    }
    throw err;
  }
}

export async function update(id: string, dto: UpdateTicketDto) {
  try {
    return await prisma.ticket.update({
      where: { id },
      data: dto as Prisma.TicketUpdateInput,
      include: { category: true },
    });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, `Ticket ${id} not found`);
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      throw new AppError(409, 'Ya existe un registro con ese valor único');
    }
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new AppError(400, 'La categoría indicada no existe');
    }
    throw err;
  }
}

export async function remove(id: string) {
  try {
    await prisma.ticket.delete({ where: { id } });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new AppError(404, `Ticket ${id} not found`);
    }
    throw err;
  }
}
