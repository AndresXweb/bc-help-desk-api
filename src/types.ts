// ============================================
// TYPES — Contratos de respuesta
// ============================================
// Los documentos de dominio salen de los models de Mongoose.
// Aquí solo viven contratos HTTP genéricos.

export interface SingleResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}
