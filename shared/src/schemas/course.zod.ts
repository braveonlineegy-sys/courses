import z from "zod";

export const courseSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  fileKey: z.string().min(1),
  cashNumbers: z.array(z.string()).optional(),
  instapayUsername: z.string().optional(),
  teacherId: z.string(),
  pdfLink: z.string().optional(),
  levelId: z.string(),

  price: z.number().int().min(0),
  duration: z.number().int().min(1),
  smallDescription: z.string().min(1),
  term: z.enum(["REGULAR", "SUMMER"]),
  status: z.enum(["PUBLISHED", "ARCHIVED"]),
});

export const createCourseSchema = courseSchema.omit({ id: true });

export const updateCourseSchema = courseSchema.omit({ id: true }).partial();
export const getCoursesSchema = z.object({
  levelId: z.string().optional(),
  teacherId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
});
export const deleteCourseSchema = z.object({
  id: z.string(),
});

export const getCourseSchema = z.object({
  id: z.string(),
});

// types

export type CreateCourse = z.infer<typeof createCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type GetCourses = z.infer<typeof getCoursesSchema>;
export type DeleteCourse = z.infer<typeof deleteCourseSchema>;
export type GetCourse = z.infer<typeof getCourseSchema>;
