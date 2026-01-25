import { Hono } from "hono";
import {
  createLevelValidator,
  deleteLevelValidator,
  getLevelValidator,
  getLevelsValidator,
  updateLevelValidator,
} from "./level.schema";
import {
  createLevel,
  deleteLevel,
  getLevel,
  getLevels,
  updateLevel,
} from "./level.service";
import { successResponse, notFoundResponse } from "../../lib/response";

import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";

const app = new Hono()
  // ============ LIST LEVELS (by Department ID) ============
  .get("/", requireAuth, getLevelsValidator, async (c) => {
    const { departmentId } = c.req.valid("query");
    const result = await getLevels({ departmentId });
    if (result.length === 0) {
      return successResponse(c, result, "There's no levels yet", 200);
    }

    return successResponse(c, result, "Levels retrieved successfully", 200);
  })

  // ============ GET LEVEL BY ID ============
  .get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return notFoundResponse(c, "Level not found");
    }

    const level = await getLevel({ id });

    if (!level) {
      return notFoundResponse(c, "Level not found");
    }

    return successResponse(c, level, "Level retrieved successfully");
  })

  // ============ CREATE LEVEL ============
  .post("/", requireAdmin, createLevelValidator, async (c) => {
    const data = c.req.valid("json");
    const level = await createLevel(data);
    return successResponse(c, level, "Level created successfully", 201);
  })

  // ============ UPDATE LEVEL ============
  .patch("/:id", requireAdmin, updateLevelValidator, async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const existing = await getLevel({ id });
    if (!existing) {
      return notFoundResponse(c, "Level not found");
    }

    const updated = await updateLevel(data, id);
    return successResponse(c, updated, "Level updated successfully");
  })

  // ============ DELETE LEVEL ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getLevel({ id });
    if (!existing) {
      return notFoundResponse(c, "Level not found");
    }

    await deleteLevel({ id });
    return successResponse(c, null, "Level deleted successfully");
  });

export default app;
