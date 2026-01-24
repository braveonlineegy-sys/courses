import { z } from "zod";

export const createUniversity = z.object({
  name: z.string(),
  isActive: z.boolean().default(true),
});

export const updateUniversity = z.object({
  name: z.string(),
  isActive: z.boolean().optional(),
});

export const deleteUniversity = z.object({
  id: z.uuid(),
});

export const getUniversity = z.object({
  id: z.uuid(),
});

// types
export type CreateUniversity = z.infer<typeof createUniversity>;
export type UpdateUniversity = z.infer<typeof updateUniversity>;
export type DeleteUniversity = z.infer<typeof deleteUniversity>;
export type GetUniversity = z.infer<typeof getUniversity>;
