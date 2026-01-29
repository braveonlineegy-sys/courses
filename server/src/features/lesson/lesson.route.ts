import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
} from "./lesson.schema";
import {
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByChapter,
  getLesson,
  reorderLessons,
} from "./lesson.service";
import { successResponse, errorResponse } from "../../lib/response";
import { z } from "zod";

const lessonRoute = new Hono()
  // Create Lesson
  .post("/", zValidator("json", createLessonSchema), async (c) => {
    try {
      const data = c.req.valid("json");
      const lesson = await createLesson(data);
      return successResponse(c, lesson, "تم إنشاء الدرس بنجاح", 201);
    } catch (error) {
      return errorResponse(c, "فشل في إنشاء الدرس", 500);
    }
  })

  // Get Lessons by Chapter
  .get(
    "/",
    zValidator("query", z.object({ chapterId: z.string() })),
    async (c) => {
      try {
        const { chapterId } = c.req.valid("query");
        const lessons = await getLessonsByChapter(chapterId);
        return successResponse(c, lessons, "تم جلب الدروس بنجاح");
      } catch (error) {
        return errorResponse(c, "فشل في جلب الدروس", 500);
      }
    },
  )

  // Get Single Lesson
  .get("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const lesson = await getLesson(id);
      if (!lesson) {
        return errorResponse(c, "الدرس غير موجود", 404);
      }
      return successResponse(c, lesson, "تم جلب الدرس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في جلب الدرس", 500);
    }
  })

  // Update Lesson
  .patch("/:id", zValidator("json", updateLessonSchema), async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");
      const lesson = await updateLesson(id, data);
      return successResponse(c, lesson, "تم تحديث الدرس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في تحديث الدرس", 500);
    }
  })

  // Delete Lesson
  .delete("/:id", async (c) => {
    try {
      const id = c.req.param("id");
      await deleteLesson(id);
      return successResponse(c, null, "تم حذف الدرس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في حذف الدرس", 500);
    }
  })

  // Reorder Lessons
  .post("/reorder", zValidator("json", reorderLessonsSchema), async (c) => {
    try {
      const data = c.req.valid("json");
      await reorderLessons(data);
      return successResponse(c, null, "تم إعادة ترتيب الدروس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في إعادة ترتيب الدروس", 500);
    }
  });

export default lessonRoute;
