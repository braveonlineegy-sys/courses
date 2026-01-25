import { z } from "zod";

export const createDepartment = z.object({
  id: z.string(),
  name: z.string(),
  collegeId: z.string(),
});

export const updateDepartment = z.object({
  id: z.string(),
  name: z.string(),
  collegeId: z.string(),
});

export const deleteDepartment = z.object({
  id: z.string(),
});

export const getDepartment = z.object({
  id: z.string(),
});

export const getDepartments = z.object({
  collegeId: z.string(),
});

export type CreateDepartment = z.infer<typeof createDepartment>;
export type UpdateDepartment = z.infer<typeof updateDepartment>;
export type DeleteDepartment = z.infer<typeof deleteDepartment>;
export type GetDepartment = z.infer<typeof getDepartment>;
export type GetDepartments = z.infer<typeof getDepartments>;
