import { Hono } from "hono";
import {
  createCourseValidator,
  getCoursesValidator,
  getCourseValidator,
  updateCourseValidator,
} from "./course.schema";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
  uploadToCloudinary,
} from "../../lib/cloudinary";
import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourse,
  getCoursesByTeacher,
  updateCourse,
} from "./course.service";
import {
  paginatedResponse,
  successResponse,
  notFoundResponse,
  forbiddenResponse,
} from "../../lib/response";
import {
  requireAuth,
  requireAdmin,
  requireTeacherOrAdmin,
  requireTeacher,
} from "../../middlewares/auth.middleware";
import { UserRole } from "../../lib/constants";

import { type AuthType } from "../../lib/auth";

const app = new Hono<{ Variables: AuthType }>()
  // ============ LIST COURSES ============
  .get("/", requireAuth, getCoursesValidator, async (c) => {
    const { page, limit, search, levelId } = c.req.valid("query");
    const result = await getAllCourses({ page, limit, search, levelId });

    return paginatedResponse(
      c,
      result.items,
      result.total,
      result.page,
      result.limit,
      "Courses retrieved successfully",
    );
  })

  // ============ GET MY COURSES (Teacher) ============
  .get("/my-courses", requireTeacher, getCoursesValidator, async (c) => {
    const user = c.get("user")!;
    const { page, limit, search } = c.req.valid("query");

    const result = await getCoursesByTeacher(user.id, { page, limit, search });

    return paginatedResponse(
      c,
      result.items,
      result.total,
      result.page,
      result.limit,
      "Courses retrieved successfully",
    );
  })

  // ============ GET COURSE BY ID ============
  .get("/:id", requireAuth, getCourseValidator, async (c) => {
    const { id } = c.req.valid("param");
    const course = await getCourse({ id });

    if (!course) {
      return notFoundResponse(c, "Course not found");
    }

    return successResponse(c, course, "Course retrieved successfully");
  })

  // ============ CREATE COURSE ============
  .post("/", requireTeacherOrAdmin, createCourseValidator, async (c) => {
    const user = c.get("user")!;
    const data = c.req.valid("form");

    // Teachers can only create courses for themselves
    // Admins can create courses for any teacher
    const teacherId = user.role === UserRole.ADMIN ? data.teacherId : user.id;

    // Upload Files
    console.log("Create Course - Data received:", {
      ...data,
      fileKey: data.fileKey ? "File Present" : "Missing",
    });
    const imageFile = data.fileKey as File;

    let imageLink: string;
    try {
      console.log("Create Course - Uploading image...");
      // Check if imageFile has arrayBuffer (is it a File?)
      if (typeof imageFile.arrayBuffer !== "function") {
        console.error(
          "Create Course - fileKey is not a File object:",
          imageFile,
        );
        throw new Error("Invalid file format for fileKey");
      }
      const uploadResult = await uploadToCloudinary(imageFile, "courses");
      imageLink = uploadResult.secure_url;
      console.log("Create Course - Image uploaded:", imageLink);
    } catch (error) {
      console.error("Create Course - Upload failed:", error);
      throw error; // Re-throw to cause 500 but now we have logs
    }

    let pdfLink: string | undefined = undefined;
    if (data.pdfLink) {
      const pdfFile = data.pdfLink as File;
      // Defensive check for file type
      if (typeof pdfFile.arrayBuffer === "function") {
        try {
          const { secure_url } = await uploadToCloudinary(pdfFile, "courses");
          pdfLink = secure_url;
          console.log("Create Course - PDF uploaded:", pdfLink);
        } catch (e) {
          console.error("Create Course - PDF upload failed:", e);
          // Optional: decide if we fail the whole request or just skip PDF.
          // For now, let's fail to be safe as user expects it.
          throw e;
        }
      } else {
        console.warn(
          "Create Course - pdfLink provided but not a File with arrayBuffer:",
          pdfLink,
        );
      }
    }

    const cashNumbers = data.cashNumbers
      ? JSON.parse(data.cashNumbers)
      : undefined;

    const course = await createCourse({
      ...data,
      fileKey: imageLink!, // We know imageLink is set because we threw if failed
      pdfLink,
      cashNumbers,
      teacherId,
    });

    return successResponse(c, course, "Course created successfully", 201);
  })

  // ============ UPDATE COURSE ============
  .patch("/:id", requireTeacherOrAdmin, updateCourseValidator, async (c) => {
    const user = c.get("user")!;
    const id = c.req.param("id");
    const data = c.req.valid("form");

    // Check existence first
    const existing = await getCourse({ id });
    if (!existing) {
      return notFoundResponse(c, "Course not found");
    }

    // Teachers can only update their own courses
    if (user.role === UserRole.TEACHER && existing.teacherId !== user.id) {
      return forbiddenResponse(c, "You can only update your own courses");
    }

    let imageLink = existing.fileKey;
    if (data.fileKey) {
      const imageFile = data.fileKey as File;
      const { secure_url } = await uploadToCloudinary(imageFile, "courses");
      imageLink = secure_url;

      // Delete old image
      const oldPublicId = getPublicIdFromUrl(existing.fileKey);
      if (oldPublicId) {
        await deleteFromCloudinary(oldPublicId);
      }
    }

    let pdfLink = existing.pdfLink;
    if (data.pdfLink) {
      const pdfFile = data.pdfLink as File;
      const { secure_url } = await uploadToCloudinary(pdfFile, "courses");
      pdfLink = secure_url;

      // Delete old PDF
      if (existing.pdfLink) {
        const oldPublicId = getPublicIdFromUrl(existing.pdfLink);
        if (oldPublicId) {
          await deleteFromCloudinary(oldPublicId);
        }
      }
    }

    const cashNumbers = data.cashNumbers
      ? JSON.parse(data.cashNumbers)
      : undefined;

    const updated = await updateCourse(
      {
        ...data,
        fileKey: imageLink,
        pdfLink: pdfLink || undefined,
        cashNumbers,
      },
      id,
    );
    return successResponse(c, updated, "Course updated successfully");
  })

  // ============ DELETE COURSE ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getCourse({ id });
    if (!existing) {
      return notFoundResponse(c, "Course not found");
    }

    // Delete associated files
    const imagePublicId = getPublicIdFromUrl(existing.fileKey);
    if (imagePublicId) {
      await deleteFromCloudinary(imagePublicId);
    }

    if (existing.pdfLink) {
      const pdfPublicId = getPublicIdFromUrl(existing.pdfLink);
      if (pdfPublicId) {
        await deleteFromCloudinary(pdfPublicId);
      }
    }

    await deleteCourse({ id });
    return successResponse(c, null, "Course deleted successfully");
  });

export default app;
