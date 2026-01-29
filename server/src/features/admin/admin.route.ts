import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAdmin } from "../../middlewares/auth.middleware";
import { UserRole, type UserRoleType } from "../../lib/constants";
import {
  createUser,
  getAllUsers,
  getAllTeachers,
  getUserById,
  banUser,
  unbanUser,
  getPendingRecoveryRequests,
  approveRecoveryRequest,
  rejectRecoveryRequest,
  deleteUser,
  updateUser,
  changeUserPassword,
  getAllStudents,
  getStudentById,
  updateStudentLevel,
  bulkUpdateStudentLevels,
} from "./admin.service";
import {
  createUserValidator,
  banUserValidator,
  updateUserValidator,
  changePasswordValidator,
  getTeachersValidator,
  getStudentsValidator,
  updateStudentLevelValidator,
  bulkUpdateStudentLevelsValidator,
} from "./admin.schema";

// ============ ADMIN ROUTES ============
export const adminRoute = new Hono()
  // Apply admin middleware to all routes

  // CREATE USER
  .post("/users", requireAdmin, createUserValidator, async (c) => {
    const input = c.req.valid("json");

    const user = await createUser(input);

    return c.json(
      {
        success: true,
        message: "User created successfully",
        data: { user },
      },
      201,
    );
  })

  // GET ALL USERS
  .get("/users", requireAdmin, async (c) => {
    const { role } = c.req.query();
    const users = await getAllUsers({ role: role as UserRoleType });
    return c.json({
      success: true,
      message: "Users retrieved successfully",
      data: { users },
    });
  })

  // get All teachers
  .get("/teachers", requireAdmin, getTeachersValidator, async (c) => {
    const { page, limit, isBanned, search } = c.req.valid("query");
    const result = await getAllTeachers({
      page: parseInt(page),
      limit: parseInt(limit),
      isBanned: isBanned as "true" | "false" | "all",
      search,
    });
    return c.json({
      success: true,
      message: "Teachers retrieved successfully",
      data: result,
    });
  })

  // GET USER BY ID
  .get("/users/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");
    const user = await getUserById(id);

    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }

    return c.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  })

  // BAN USER
  .patch("/users/:id/ban", requireAdmin, banUserValidator, async (c) => {
    const id = c.req.param("id");
    const { reason } = c.req.valid("json");
    const user = await banUser(id, reason);
    return c.json({
      success: true,
      message: "User banned successfully",
      data: { user },
    });
  })

  // UNBAN USER
  .patch("/users/:id/unban", requireAdmin, async (c) => {
    const id = c.req.param("id");
    const user = await unbanUser(id);
    return c.json({
      success: true,
      message: "User unbanned successfully",
      data: { user },
    });
  })

  // GET RECOVERY REQUESTS
  .get("/recovery-requests", requireAdmin, async (c) => {
    const requests = await getPendingRecoveryRequests();
    return c.json({
      success: true,
      message: "Recovery requests retrieved successfully",
      data: { requests },
    });
  })

  // APPROVE RECOVERY
  .patch("/recovery-requests/:id/approve", requireAdmin, async (c) => {
    const id = c.req.param("id");
    let adminNote: string | undefined;

    try {
      const body = await c.req.json();
      adminNote = body?.adminNote;
    } catch {
      // No body sent, which is fine
    }

    await approveRecoveryRequest(id, adminNote);
    return c.json({ success: true, message: "Recovery request approved" });
  })

  // REJECT RECOVERY
  .patch("/recovery-requests/:id/reject", requireAdmin, async (c) => {
    const id = c.req.param("id");
    let adminNote: string | undefined;

    try {
      const body = await c.req.json();
      adminNote = body?.adminNote;
    } catch {
      // No body sent, which is fine
    }

    await rejectRecoveryRequest(id, adminNote);
    return c.json({ success: true, message: "Recovery request rejected" });
  })

  // UPDATE USER
  .patch("/users/:id", requireAdmin, updateUserValidator, async (c) => {
    const id = c.req.param("id");
    const input = c.req.valid("json");
    const user = await updateUser(id, input);
    return c.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  })

  // CHANGE PASSWORD
  .patch(
    "/users/:id/password",
    requireAdmin,
    changePasswordValidator,
    async (c) => {
      const id = c.req.param("id");
      const { password } = c.req.valid("json");
      await changeUserPassword(id, password);
      return c.json({
        success: true,
        message: "Password updated successfully",
      });
    },
  )

  // DELETE USER
  .delete("/users/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");
    await deleteUser(id);
    return c.json({
      success: true,
      message: "User deleted successfully",
    });
  })

  // ============ STUDENT ROUTES ============

  // GET ALL STUDENTS
  .get("/students", requireAdmin, getStudentsValidator, async (c) => {
    const {
      page,
      limit,
      isBanned,
      search,
      levelId,
      departmentId,
      collegeId,
      universityId,
    } = c.req.valid("query");
    const result = await getAllStudents({
      page: parseInt(page),
      limit: parseInt(limit),
      isBanned: isBanned as "true" | "false" | "all",
      search,
      levelId,
      departmentId,
      collegeId,
      universityId,
    });
    return c.json({
      success: true,
      message: "Students retrieved successfully",
      data: result,
    });
  })

  // GET STUDENT BY ID
  .get("/students/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");
    const student = await getStudentById(id);

    if (!student) {
      throw new HTTPException(404, { message: "Student not found" });
    }

    return c.json({
      success: true,
      message: "Student retrieved successfully",
      data: { student },
    });
  })

  // UPDATE STUDENT LEVEL
  .patch(
    "/students/:id/level",
    requireAdmin,
    updateStudentLevelValidator,
    async (c) => {
      const id = c.req.param("id");
      const { levelId } = c.req.valid("json");
      const student = await updateStudentLevel(id, levelId);
      return c.json({
        success: true,
        message: "Student level updated successfully",
        data: { student },
      });
    },
  )

  // BULK UPDATE STUDENT LEVELS
  .patch(
    "/students/bulk-level",
    requireAdmin,
    bulkUpdateStudentLevelsValidator,
    async (c) => {
      const { userIds, levelId } = c.req.valid("json");
      const result = await bulkUpdateStudentLevels(userIds, levelId);
      return c.json({
        success: true,
        message: `Updated ${result.count} students' levels successfully`,
        data: { count: result.count },
      });
    },
  );
