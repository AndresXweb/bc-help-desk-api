// ============================================
// REPOSITORY — Category (Mongoose)
// ============================================
import { Category } from '../models/category.model';
import { CreateCategoryDto, UpdateCategoryDto } from '../schemas/category.schema';
import { handleMongoReadError, handleMongoWriteError } from './mongo-errors';

export async function findAll() {
  return Category.find().sort({ name: 1 }).lean();
}

export async function findById(id: string) {
  try {
    return await Category.findById(id).lean();
  } catch (err) {
    handleMongoReadError(err);
  }
}

export async function create(dto: CreateCategoryDto) {
  try {
    const doc = await Category.create(dto);
    return doc.toObject();
  } catch (err) {
    handleMongoWriteError(err);
  }
}

export async function update(id: string, dto: UpdateCategoryDto) {
  try {
    return await Category.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean();
  } catch (err) {
    handleMongoWriteError(err);
  }
}

export async function remove(id: string) {
  try {
    return await Category.findByIdAndDelete(id).lean();
  } catch (err) {
    handleMongoReadError(err);
  }
}
