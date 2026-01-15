import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAdmin } from "../../middlewares/auth.middleware";
import {
  createUser,
  getAllUsers,
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
  .use("/*", requireAdmin)

  // CREATE USER
  .post("/users", createUserValidator, async (c) => {
    const input = c.req.valid("json");
    const user = await createUser(input);
    return c.json(
      { success: true, message: "User created successfully", data: { user } },
      201
    );
  })

  // GET ALL USERS
  .get("/users", async (c) => {
    const users = await getAllUsers();
    return c.json({
      success: true,
      message: "Users retrieved successfully",
      data: { users },
    });
  })

  // GET USER BY ID
  .get("/users/:id", async (c) => {
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
  .patch("/users/:id/ban", banUserValidator, async (c) => {
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
  .patch("/users/:id/unban", async (c) => {
    const id = c.req.param("id");
    const user = await unbanUser(id);
    return c.json({
      success: true,
      message: "User unbanned successfully",
      data: { user },
    });
  })

  // GET RECOVERY REQUESTS
  .get("/recovery-requests", async (c) => {
    const requests = await getPendingRecoveryRequests();
    return c.json({
      success: true,
      message: "Recovery requests retrieved successfully",
      data: { requests },
    });
  })

  // APPROVE RECOVERY
  .patch("/recovery-requests/:id/approve", async (c) => {
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
  .patch("/recovery-requests/:id/reject", async (c) => {
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
