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
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "../../lib/cloudinary";

const lessonRoute = new Hono()
  // Create Lesson
  .post("/", createLessonValidator, async (c) => {
    try {
      const data = c.req.valid("form");

      let thumbnail: string | undefined = undefined;
      if (data.thumbnail instanceof File) {
        const uploadResult = await uploadToCloudinary(
          data.thumbnail,
          "lessons",
        );
        thumbnail = uploadResult.secure_url;
      } else if (typeof data.thumbnail === "string" && data.thumbnail) {
        // If it's a string (e.g. from frontend state if not changed but that's unlikely for create), use it.
        // But usually create sends File. If it sends string URL, pass it through?
        thumbnail = data.thumbnail;
      }

      let pdfLink: string | undefined = undefined;
      if (data.pdfLink instanceof File) {
        const uploadResult = await uploadToCloudinary(data.pdfLink, "lessons");
        pdfLink = uploadResult.secure_url;
      } else if (typeof data.pdfLink === "string" && data.pdfLink) {
        pdfLink = data.pdfLink;
      }

      const lesson = await createLesson({
        ...data,
        thumbnail,
        pdfLink,
      });
      return successResponse(c, lesson, "تم إنشاء الدرس بنجاح", 201);
    } catch (error) {
      console.error("Create Lesson Error:", error);
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
      const data = c.req.valid("form");

      // Check existence
      const existing = await getLesson(id);
      if (!existing) {
        return errorResponse(c, "الدرس غير موجود", 404);
      }

      let thumbnail = existing.thumbnail;
      if (data.thumbnail instanceof File) {
        const uploadResult = await uploadToCloudinary(
          data.thumbnail,
          "lessons",
        );
        thumbnail = uploadResult.secure_url;

        // Delete old
        if (existing.thumbnail) {
          const publicId = getPublicIdFromUrl(existing.thumbnail);
          if (publicId) await deleteFromCloudinary(publicId);
        }
      } else if (data.thumbnail === null) {
        // Explicit removal (if supported by frontend sending null/empty)
        // Note: Form data doesn't support null well, usually empty string.
        // If undefined, we keep existing.
        // If we want to support delete, frontend should send specific indicator or empty string?
        // Current logic: if 'thumbnail' key is missing, undefined -> no change.
        // If file, change.
      }

      let pdfLink = existing.pdfLink;
      if (data.pdfLink instanceof File) {
        const uploadResult = await uploadToCloudinary(data.pdfLink, "lessons");
        pdfLink = uploadResult.secure_url;

        // Delete old
        if (existing.pdfLink) {
          const publicId = getPublicIdFromUrl(existing.pdfLink);
          if (publicId) await deleteFromCloudinary(publicId);
        }
      }

      const lesson = await updateLesson(id, {
        ...data,
        thumbnail: thumbnail || undefined,
        pdfLink: pdfLink || undefined,
      });
      return successResponse(c, lesson, "تم تحديث الدرس بنجاح");
    } catch (error) {
      console.error("Update Lesson Error:", error);
      return errorResponse(c, "فشل في تحديث الدرس", 500);
    }
  })

  // Delete Lesson
  .delete("/:id", deleteLessonValidator, async (c) => {
    try {
      const id = c.req.param("id");

      const existing = await getLesson(id);
      if (existing) {
        // Delete files
        if (existing.thumbnail) {
          const publicId = getPublicIdFromUrl(existing.thumbnail);
          if (publicId) await deleteFromCloudinary(publicId);
        }
        if (existing.pdfLink) {
          const publicId = getPublicIdFromUrl(existing.pdfLink);
          if (publicId) await deleteFromCloudinary(publicId);
        }
      }

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
