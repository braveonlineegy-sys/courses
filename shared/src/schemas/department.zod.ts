import { z } from "zod";

export const createDepartment = z.object({
  id: z.uuid(),
  name: z.string(),
  universityId: z.uuid(),
});

export const updateDepartment = z.object({
  id: z.uuid(),
  name: z.string(),
  universityId: z.uuid(),
});

export const deleteDepartment = z.object({
  id: z.uuid(),
});

export const getDepartment = z.object({
  id: z.uuid(),
});

export const getDepartments = z.object({
  universityId: z.uuid(),
});

export const getDepartmentsByUniversityId = z.object({
  universityId: z.uuid(),
});

// types

export type CreateDepartment = z.infer<typeof createDepartment>;
export type UpdateDepartment = z.infer<typeof updateDepartment>;
export type DeleteDepartment = z.infer<typeof deleteDepartment>;
export type GetDepartment = z.infer<typeof getDepartment>;
export type GetDepartments = z.infer<typeof getDepartments>;
export type GetDepartmentsByUniversityId = z.infer<
  typeof getDepartmentsByUniversityId
>;
