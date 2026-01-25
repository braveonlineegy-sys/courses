import { z } from "zod";

const createLevel = z.object({
  id: z.string(),
  name: z.string(),
  order: z.number(),
  departmentId: z.string(),
});

const updateLevel = createLevel.omit({ id: true });

const deleteLevel = z.object({
  id: z.string(),
});

const getLevel = z.object({
  id: z.string(),
});

const getLevels = z.object({
  departmentId: z.string(),
});

export { createLevel, updateLevel, deleteLevel, getLevel, getLevels };

//types
export type CreateLevel = z.infer<typeof createLevel>;
export type UpdateLevel = z.infer<typeof updateLevel>;
export type DeleteLevel = z.infer<typeof deleteLevel>;
export type GetLevel = z.infer<typeof getLevel>;
export type GetLevels = z.infer<typeof getLevels>;
