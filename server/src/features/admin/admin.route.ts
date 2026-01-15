import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
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
import {
  createUserSchema,
  banUserSchema,
  recoveryActionSchema,
} from "./admin.schema";

// ============ ADMIN ROUTES ============
export const adminRoute = new Hono()
  // Apply admin middleware to all routes
  .use("/*", requireAdmin)

  // CREATE USER
  .post("/users", zValidator("json", createUserSchema), async (c) => {
    try {
      const input = c.req.valid("json");
      const user = await createUser(input);
      return c.json(
        { success: true, message: "User created successfully", data: { user } },
        201
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create user";
      return c.json({ success: false, message }, 400);
    }
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
      return c.json({ success: false, message: "User not found" }, 404);
    }

    return c.json({
      success: true,
      message: "User retrieved successfully",
      data: { user },
    });
  })

  // BAN USER
  .patch("/users/:id/ban", zValidator("json", banUserSchema), async (c) => {
    const id = c.req.param("id");
    const { reason } = c.req.valid("json");

    try {
      const user = await banUser(id, reason);
      return c.json({
        success: true,
        message: "User banned successfully",
        data: { user },
      });
    } catch (error) {
      return c.json({ success: false, message: "Failed to ban user" }, 400);
    }
  })

  // UNBAN USER
  .patch("/users/:id/unban", async (c) => {
    const id = c.req.param("id");

    try {
      const user = await unbanUser(id);
      return c.json({
        success: true,
        message: "User unbanned successfully",
        data: { user },
      });
    } catch (error) {
      return c.json({ success: false, message: "Failed to unban user" }, 400);
    }
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
  .patch(
    "/recovery-requests/:id/approve",
    zValidator("json", recoveryActionSchema),
    async (c) => {
      const id = c.req.param("id");
      const input = c.req.valid("json");

      try {
        await approveRecoveryRequest(id, input?.adminNote);
        return c.json({ success: true, message: "Recovery request approved" });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to approve request";
        return c.json({ success: false, message }, 400);
      }
    }
  )

  // REJECT RECOVERY
  .patch(
    "/recovery-requests/:id/reject",
    zValidator("json", recoveryActionSchema),
    async (c) => {
      const id = c.req.param("id");
      const input = c.req.valid("json");

      try {
        await rejectRecoveryRequest(id, input?.adminNote);
        return c.json({ success: true, message: "Recovery request rejected" });
      } catch (error) {
        return c.json(
          { success: false, message: "Failed to reject request" },
          400
        );
      }
    }
  );
