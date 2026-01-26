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
} from "./admin.service";
import { createUserValidator, banUserValidator } from "./admin.schema";

// ============ ADMIN ROUTES ============
export const adminRoute = new Hono()
  // Apply admin middleware to all routes

  // CREATE USER
  .post("/users", requireAdmin, createUserValidator, async (c) => {
    const input = c.req.valid("json");
    const user = await createUser(input);
    return c.json(
      { success: true, message: "User created successfully", data: { user } },
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
  .get("/teachers", requireAdmin, async (c) => {
    const users = await getAllTeachers();
    return c.json({
      success: true,
      message: "Teachers retrieved successfully",
      data: { users },
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
  });
