export {
  type CreateCourse,
  type UpdateCourse,
  type GetCourses,
  type DeleteCourse,
  type GetCourse,
} from "shared";

import {
  createCourseSchema,
  updateCourseSchema,
  getCoursesSchema,
  deleteCourseSchema,
  getCourseSchema,
} from "shared";
import { validationHook } from "../../lib/zod";

import { zValidator } from "@hono/zod-validator";

import { z } from "zod";

export const createCourseFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  fileKey: z.any(), // File
  cashNumbers: z.string().optional(), // JSON string or comma separated? Usually form data sends multiple values with same key or one string. Let's assume JSON string if array, or handle multiple.
  instapayUsername: z.string().optional(),
  teacherId: z.string(),
  pdfLink: z.any().optional(), // File
  levelId: z.string(),

  price: z.coerce.number().int().min(0),
  duration: z.coerce.number().int().min(1),
  smallDescription: z.string().min(1),
  term: z.enum(["REGULAR", "SUMMER"]),
  status: z.enum(["PUBLISHED", "ARCHIVED"]),
});

export const updateCourseFormSchema = createCourseFormSchema
  .partial()
  .omit({ teacherId: true });

export const createCourseValidator = zValidator(
  "form",
  createCourseFormSchema,
  validationHook,
);

export const updateCourseValidator = zValidator(
  "form",
  updateCourseFormSchema,
  validationHook,
);

export const deleteCourseValidator = zValidator(
  "json",
  deleteCourseSchema,
  validationHook,
);

export const getCourseValidator = zValidator(
  "param",
  getCourseSchema,
  validationHook,
);

export const getCoursesValidator = zValidator(
  "query",
  getCoursesSchema,
  validationHook,
);
