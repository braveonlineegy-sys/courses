// Re-export from shared for consistency
export {
  type CreateLesson,
  type UpdateLesson,
  type GetLessonsByChapter,
  type GetLesson,
  type DeleteLesson,
  type ReorderLessons,
} from "shared";
import {
  createLessonSchema,
  updateLessonSchema,
  getLessonsByChapterSchema,
  getLessonSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
} from "shared";

import { validationHook } from "../../lib/zod";
import { zValidator } from "@hono/zod-validator";

export const createLessonValidator = zValidator(
  "json",
  createLessonSchema,
  validationHook,
);

export const updateLessonValidator = zValidator(
  "json",
  updateLessonSchema,
  validationHook,
);

export const getLessonsByChapterValidator = zValidator(
  "query",
  getLessonsByChapterSchema,
  validationHook,
);

export const getLessonValidator = zValidator(
  "param",
  getLessonSchema,
  validationHook,
);

export const deleteLessonValidator = zValidator(
  "param",
  deleteLessonSchema,
  validationHook,
);

export const reorderLessonsValidator = zValidator(
  "json",
  reorderLessonsSchema,
  validationHook,
);
