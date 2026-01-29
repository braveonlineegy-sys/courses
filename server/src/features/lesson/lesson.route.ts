import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createLessonValidator,
  updateLessonValidator,
  getLessonsByChapterValidator,
  getLessonValidator,
  deleteLessonValidator,
  reorderLessonsValidator,
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
  .post("/", createLessonValidator, async (c) => {
    try {
      const data = c.req.valid("json");
      const lesson = await createLesson(data);
      return successResponse(c, lesson, "تم إنشاء الدرس بنجاح", 201);
    } catch (error) {
      return errorResponse(c, "فشل في إنشاء الدرس", 500);
    }
  })

  // Get Lessons by Chapter
  .get("/", getLessonsByChapterValidator, async (c) => {
    try {
      const { chapterId } = c.req.valid("query");
      const lessons = await getLessonsByChapter(chapterId);
      return successResponse(c, lessons, "تم جلب الدروس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في جلب الدروس", 500);
    }
  })

  // Get Single Lesson
  .get("/:id", getLessonValidator, async (c) => {
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
  .patch("/:id", updateLessonValidator, async (c) => {
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
  .delete("/:id", deleteLessonValidator, async (c) => {
    try {
      const id = c.req.param("id");
      await deleteLesson(id);
      return successResponse(c, null, "تم حذف الدرس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في حذف الدرس", 500);
    }
  })

  // Reorder Lessons
  .post("/reorder", reorderLessonsValidator, async (c) => {
    try {
      const data = c.req.valid("json");
      await reorderLessons(data);
      return successResponse(c, null, "تم إعادة ترتيب الدروس بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في إعادة ترتيب الدروس", 500);
    }
  });

export default lessonRoute;
