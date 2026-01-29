import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
} from "./chapter.schema";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  getChaptersByCourse,
  getChapter,
  reorderChapters,
} from "./chapter.service";
import { successResponse, errorResponse } from "../../lib/response";
import { z } from "zod";
import {
  createChapterValidator,
  updateChapterValidator,
  getChaptersByCourseValidator,
  deleteChapterValidator,
  reorderChaptersValidator,
} from "./chapter.schema";

const chapterRoute = new Hono()
  // Create Chapter
  .post("/", createChapterValidator, async (c) => {
    try {
      const data = c.req.valid("json");
      const chapter = await createChapter(data);
      return successResponse(c, chapter, "تم إنشاء الفصل بنجاح", 201);
    } catch (error) {
      return errorResponse(c, "فشل في إنشاء الفصل", 500);
    }
  })

  // Get Chapters by Course
  .get(
    "/",
    getChaptersByCourseValidator,
    async (c) => {
      try {
        const { courseId } = c.req.valid("query");
        const chapters = await getChaptersByCourse(courseId);
        return successResponse(c, chapters, "تم جلب الفصول بنجاح");
      } catch (error) {
        return errorResponse(c, "فشل في جلب الفصول", 500);
      }
    },
  )

  // Get Single Chapter
  .get("/:id", deleteChapterValidator, async (c) => {
    try {
      const id = c.req.param("id");
      const chapter = await getChapter(id);
      if (!chapter) {
        return errorResponse(c, "الفصل غير موجود", 404);
      }
      return successResponse(c, chapter, "تم جلب الفصل بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في جلب الفصل", 500);
    }
  })

  // Update Chapter
  .patch("/:id", updateChapterValidator, async (c) => {
    try {
      const id = c.req.param("id");
      const data = c.req.valid("json");
      const chapter = await updateChapter(id, data);
      return successResponse(c, chapter, "تم تحديث الفصل بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في تحديث الفصل", 500);
    }
  })

  // Delete Chapter
  .delete("/:id", deleteChapterValidator, async (c) => {
    try {
      const id = c.req.param("id");
      await deleteChapter(id);
      return successResponse(c, null, "تم حذف الفصل بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في حذف الفصل", 500);
    }
  })

  // Reorder Chapters
  .post("/reorder", reorderChaptersValidator, async (c) => {
    try {
      const data = c.req.valid("json");
      await reorderChapters(data);
      return successResponse(c, null, "تم إعادة ترتيب الفصول بنجاح");
    } catch (error) {
      return errorResponse(c, "فشل في إعادة ترتيب الفصول", 500);
    }
  });

export default chapterRoute;
