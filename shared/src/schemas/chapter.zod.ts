import z from "zod";

// ============ CREATE ============
export const createChapterSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب"),
  courseId: z.string().uuid("معرف الكورس غير صالح"),
});

// ============ UPDATE ============
export const updateChapterSchema = z.object({
  title: z.string().min(1, "العنوان مطلوب").optional(),
});

// ============ GET ============
export const getChaptersByCourseSchema = z.object({
  courseId: z.string().uuid("معرف الكورس غير صالح"),
});

// ============ DELETE ============
export const deleteChapterSchema = z.object({
  id: z.string().uuid("معرف الفصل غير صالح"),
});

// ============ REORDER ============
export const reorderChaptersSchema = z.object({
  courseId: z.string().uuid("معرف الكورس غير صالح"),
  chapters: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int().min(1),
    }),
  ),
});

// ============ TYPES ============
export type CreateChapter = z.infer<typeof createChapterSchema>;
export type UpdateChapter = z.infer<typeof updateChapterSchema>;
export type GetChaptersByCourse = z.infer<typeof getChaptersByCourseSchema>;
export type DeleteChapter = z.infer<typeof deleteChapterSchema>;
export type ReorderChapters = z.infer<typeof reorderChaptersSchema>;
