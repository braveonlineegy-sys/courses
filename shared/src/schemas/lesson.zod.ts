import z from "zod";

// ============ CREATE ============
export const createLessonSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  chapterId: z.string().uuid("معرف الفصل غير صالح"),
  description: z.string().optional(),
  video: z.string().url("رابط الفيديو غير صالح").optional().or(z.literal("")),
  pdfLink: z.string().url("رابط PDF غير صالح").optional().or(z.literal("")),
  thumbnail: z.string().optional(),
  isFree: z.boolean().optional(),
});

// ============ UPDATE ============
export const updateLessonSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").optional(),
  description: z.string().optional(),
  video: z.string().url("رابط الفيديو غير صالح").optional().or(z.literal("")),
  pdfLink: z.string().url("رابط PDF غير صالح").optional().or(z.literal("")),
  thumbnail: z.string().optional(),
  isFree: z.boolean().optional(),
});

// ============ GET ============
export const getLessonsByChapterSchema = z.object({
  chapterId: z.string().uuid("معرف الفصل غير صالح"),
});

export const getLessonSchema = z.object({
  id: z.string().uuid("معرف الدرس غير صالح"),
});

// ============ DELETE ============
export const deleteLessonSchema = z.object({
  id: z.string().uuid("معرف الدرس غير صالح"),
});

// ============ REORDER ============
export const reorderLessonsSchema = z.object({
  chapterId: z.string().uuid("معرف الفصل غير صالح"),
  lessons: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(1),
    }),
  ),
});

// ============ TYPES ============
export type CreateLesson = z.infer<typeof createLessonSchema>;
export type UpdateLesson = z.infer<typeof updateLessonSchema>;
export type GetLessonsByChapter = z.infer<typeof getLessonsByChapterSchema>;
export type GetLesson = z.infer<typeof getLessonSchema>;
export type DeleteLesson = z.infer<typeof deleteLessonSchema>;
export type ReorderLessons = z.infer<typeof reorderLessonsSchema>;
