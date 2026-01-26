import { Hono } from "hono";
import {
  createCourseValidator,
  getCourseValidator,
  getCoursesValidator,
  updateCourseValidator,
} from "./course.schema";
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
    const data = c.req.valid("json");

    // Teachers can only create courses for themselves
    // Admins can create courses for any teacher
    const teacherId = user.role === UserRole.ADMIN ? data.teacherId : user.id;

    const course = await createCourse({
      ...data,
      teacherId,
    });

    return successResponse(c, course, "Course created successfully", 201);
  })

  // ============ UPDATE COURSE ============
  .patch("/:id", requireTeacherOrAdmin, updateCourseValidator, async (c) => {
    const user = c.get("user")!;
    const id = c.req.param("id");
    const data = c.req.valid("json");

    // Check existence first
    const existing = await getCourse({ id });
    if (!existing) {
      return notFoundResponse(c, "Course not found");
    }

    // Teachers can only update their own courses
    if (user.role === UserRole.TEACHER && existing.teacherId !== user.id) {
      return forbiddenResponse(c, "You can only update your own courses");
    }

    const updated = await updateCourse(data, id);
    return successResponse(c, updated, "Course updated successfully");
  })

  // ============ DELETE COURSE ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getCourse({ id });
    if (!existing) {
      return notFoundResponse(c, "Course not found");
    }

    await deleteCourse({ id });
    return successResponse(c, null, "Course deleted successfully");
  });

export default app;
