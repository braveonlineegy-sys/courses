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

export const createCourseValidator = zValidator(
  "json",
  createCourseSchema,
  validationHook,
);

export const updateCourseValidator = zValidator(
  "json",
  updateCourseSchema,
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
