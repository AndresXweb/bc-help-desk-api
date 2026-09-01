// ============================================
// REPOSITORY — Ticket (Mongoose + populate)
// ============================================
import { Ticket } from '../models/ticket.model';
import { CreateTicketDto, UpdateTicketDto } from '../schemas/ticket.schema';
import { AppError } from '../errors/app-error';
import { handleMongoReadError, handleMongoWriteError } from './mongo-errors';

const CATEGORY_POPULATE = { path: 'category', select: 'name description createdAt updatedAt' };

export async function findAll(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Ticket.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(CATEGORY_POPULATE)
      .lean(),
    Ticket.countDocuments(),
  ]);
  const totalPages = Math.ceil(total / limit) || 1;
  return { data, total, page, totalPages };
}

export async function findById(id: string) {
  try {
    return await Ticket.findById(id).populate(CATEGORY_POPULATE).lean();
  } catch (err) {
    handleMongoReadError(err);
  }
}

export async function create(dto: CreateTicketDto) {
  try {
    const doc = await Ticket.create(dto);
    const created = await Ticket.findById(doc._id).populate(CATEGORY_POPULATE).lean();
    if (!created) throw new AppError(500, 'No se pudo leer el ticket creado');
    return created;
  } catch (err) {
    handleMongoWriteError(err);
  }
}

export async function update(id: string, dto: UpdateTicketDto) {
  try {
    return await Ticket.findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .populate(CATEGORY_POPULATE)
      .lean();
  } catch (err) {
    handleMongoWriteError(err);
  }
}

export async function remove(id: string) {
  try {
    return await Ticket.findByIdAndDelete(id).lean();
  } catch (err) {
    handleMongoReadError(err);
  }
}
