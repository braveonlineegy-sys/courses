import { z } from "zod";

const createCollegeSchema = z.object({
  id: z.string(),
  name: z.string(),
  universityId: z.string(),
});

const updateCollegeSchema = z.object({
  id: z.string(),
  name: z.string(),
  universityId: z.string(),
});

const deleteCollegeSchema = z.object({
  id: z.string(),
});

const getCollegeSchema = z.object({
  id: z.string(),
});

const getCollegesSchema = z.object({
  universityId: z.string(),
});

export {
  createCollegeSchema,
  updateCollegeSchema,
  deleteCollegeSchema,
  getCollegeSchema,
  getCollegesSchema,
};

export type CreateCollege = z.infer<typeof createCollegeSchema>;
export type UpdateCollege = z.infer<typeof updateCollegeSchema>;
export type DeleteCollege = z.infer<typeof deleteCollegeSchema>;
export type GetCollege = z.infer<typeof getCollegeSchema>;
export type GetColleges = z.infer<typeof getCollegesSchema>;
