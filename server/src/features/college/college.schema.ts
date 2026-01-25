import {
  createCollegeSchema,
  updateCollegeSchema,
  deleteCollegeSchema,
  getCollegeSchema,
  getCollegesSchema,
  paginationSchema,
} from "shared";
import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";

export {
  type CreateCollege,
  type UpdateCollege,
  type DeleteCollege,
  type GetCollege,
  type GetColleges,
  type PaginationInput,
} from "shared";

export const createCollegeValidator = zValidator(
  "json",
  createCollegeSchema,
  validationHook,
);

export const updateCollegeValidator = zValidator(
  "json",
  updateCollegeSchema,
  validationHook,
);

export const deleteCollegeValidator = zValidator(
  "json",
  deleteCollegeSchema,
  validationHook,
);

export const getCollegeValidator = zValidator(
  "param", // Changed to param for ID
  getCollegeSchema,
  validationHook,
);

export const getCollegesValidator = zValidator(
  "query",
  getCollegesSchema,
  validationHook,
);

export const paginationValidator = zValidator(
  "query",
  paginationSchema,
  validationHook,
);
