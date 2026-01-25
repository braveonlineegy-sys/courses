import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";
import {
  createLevel,
  updateLevel,
  deleteLevel,
  getLevel,
  getLevels,
} from "shared";

export {
  type CreateLevel,
  type UpdateLevel,
  type DeleteLevel,
  type GetLevel,
  type GetLevels,
} from "shared";

export const createLevelValidator = zValidator(
  "json",
  createLevel,
  validationHook,
);
export const updateLevelValidator = zValidator(
  "json",
  updateLevel,
  validationHook,
);
export const deleteLevelValidator = zValidator(
  "json",
  deleteLevel,
  validationHook,
);
export const getLevelValidator = zValidator("param", getLevel, validationHook);
export const getLevelsValidator = zValidator(
  "query",
  getLevels,
  validationHook,
);
