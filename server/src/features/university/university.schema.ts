import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";
import {
  createUniversity,
  deleteUniversity,
  getUniversity,
  updateUniversity,
  paginationSchema,
} from "shared";

export {
  type CreateUniversity,
  type DeleteUniversity,
  type GetUniversity,
  type UpdateUniversity,
  type PaginationInput,
} from "shared";

export const createUniversityValidator = zValidator(
  "json",
  createUniversity,
  validationHook,
);

export const updateUniversityValidator = zValidator(
  "json",
  updateUniversity,
  validationHook,
);

export const deleteUniversityValidator = zValidator(
  "json",
  deleteUniversity,
  validationHook,
);

export const getUniversityValidator = zValidator(
  "param", // Changed to param for ID
  getUniversity,
  validationHook,
);

export const paginationValidator = zValidator(
  "query",
  paginationSchema,
  validationHook,
);
