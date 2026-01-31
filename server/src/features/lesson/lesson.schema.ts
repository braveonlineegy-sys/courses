import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { validationHook } from "../../lib/zod";
import {
  getLessonSchema,
  getLessonsByChapterSchema,
  deleteLessonSchema,
  reorderLessonsSchema,
} from "shared";

export {
  type CreateLesson,
  type UpdateLesson,
  type GetLessonsByChapter,
  type GetLesson,
  type DeleteLesson,
  type ReorderLessons,
} from "shared";

// Form schemas for file uploads
export const createLessonFormSchema = z.object({
  title: z.string().min(1),
  chapterId: z.string().uuid(),
  description: z.string().optional(),
  video: z.string().optional(),
  pdfLink: z.any().optional(), // File
  thumbnail: z.any().optional(), // File
  isFree: z
    .string()
    .transform((v) => v === "true")
    .optional(), // Boolean as string in form data
});

export const updateLessonFormSchema = createLessonFormSchema
  .partial()
  .omit({ chapterId: true });

export const createLessonValidator = zValidator(
  "form",
  createLessonFormSchema,
  validationHook,
);

export const updateLessonValidator = zValidator(
  "form",
  updateLessonFormSchema,
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
