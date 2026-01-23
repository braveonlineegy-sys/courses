import { z } from "zod";

export const createUniversity = z.object({
  id: z.uuid(),
  name: z.string(),
});

export const updateUniversity = z.object({
  id: z.uuid(),
  name: z.string(),
  isActive: z.boolean(),
});

export const deleteUniversity = z.object({
  id: z.uuid(),
});

export const getUniversity = z.object({
  id: z.uuid(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
});

// types
export type CreateUniversity = z.infer<typeof createUniversity>;
export type UpdateUniversity = z.infer<typeof updateUniversity>;
export type DeleteUniversity = z.infer<typeof deleteUniversity>;
export type GetUniversity = z.infer<typeof getUniversity>;
export type PaginationInput = z.infer<typeof paginationSchema>;
