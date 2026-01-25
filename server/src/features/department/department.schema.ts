import { z } from "zod";
import {
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
} from "shared";
import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";
export {
  type CreateDepartment,
  type UpdateDepartment,
  type DeleteDepartment,
  type GetDepartment,
  type GetDepartments,
} from "shared";

export const createDepartmentValidator = zValidator(
  "json",
  createDepartment,
  validationHook,
);

export const updateDepartmentValidator = zValidator(
  "json",
  updateDepartment,
  validationHook,
);

export const deleteDepartmentValidator = zValidator(
  "json",
  deleteDepartment,
  validationHook,
);

export const getDepartmentValidator = zValidator(
  "param",
  getDepartment,
  validationHook,
);

export const getDepartmentsValidator = zValidator(
  "query",
  z.object({ collegeId: z.string() }),
  validationHook,
);
