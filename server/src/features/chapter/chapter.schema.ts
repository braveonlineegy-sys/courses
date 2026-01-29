// Re-export from shared for consistency
export {
  createChapterSchema,
  updateChapterSchema,
  getChaptersByCourseSchema,
  deleteChapterSchema,
  reorderChaptersSchema,
  type CreateChapter,
  type UpdateChapter,
  type GetChaptersByCourse,
  type DeleteChapter,
  type ReorderChapters,
} from "shared";

import {
  createChapterSchema,
  updateChapterSchema,
  getChaptersByCourseSchema,
  deleteChapterSchema,
  reorderChaptersSchema,
} from "shared";

import { validationHook } from "../../lib/zod";
import { zValidator } from "@hono/zod-validator";

export const createChapterValidator = zValidator(
  "json",
  createChapterSchema,
  validationHook,
);

export const updateChapterValidator = zValidator(
  "json",
  updateChapterSchema,
  validationHook,
);

export const getChaptersByCourseValidator = zValidator(
  "query",
  getChaptersByCourseSchema,
  validationHook,
);

export const deleteChapterValidator = zValidator(
  "param",
  deleteChapterSchema,
  validationHook,
);

export const reorderChaptersValidator = zValidator(
  "json",
  reorderChaptersSchema,
  validationHook,
);
