import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  createUniversityValidator,
  deleteUniversityValidator,
  getUniversityValidator,
  paginationValidator,
  updateUniversityValidator,
} from "./university.schema";
import {
  createUniversity,
  deleteUniversity,
  getAllUniversities,
  getUniversity,
  updateUniversity,
} from "./university.service";
import {
  paginatedResponse,
  successResponse,
  notFoundResponse,
} from "../../lib/response";

import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";

const app = new Hono()
  // ============ LIST UNIVERSITIES ============
  .get("/", requireAuth, paginationValidator, async (c) => {
    const { page, limit, search } = c.req.valid("query");
    const result = await getAllUniversities({ page, limit, search });

    return paginatedResponse(
      c,
      result.items,
      result.total,
      result.page,
      result.limit,
      "Universities retrieved successfully",
    );
  })
  // ============ GET UNIVERSITY BY ID ============
  .get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const university = await getUniversity({ id });

    if (!university) {
      return notFoundResponse(c, "University not found");
    }

    return successResponse(c, university, "University retrieved successfully");
  })

  // ============ CREATE UNIVERSITY ============
  .post("/", requireAdmin, createUniversityValidator, async (c) => {
    const data = c.req.valid("json");
    const university = await createUniversity(data);
    return successResponse(
      c,
      university,
      "University created successfully",
      201,
    );
  })

  // ============ UPDATE UNIVERSITY ============
  .patch("/:id", requireAdmin, updateUniversityValidator, async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    // Check existence first if needed, or let Prisma throw
    const existing = await getUniversity({ id });
    if (!existing) {
      return notFoundResponse(c, "University not found");
    }

    const updated = await updateUniversity(data, id);
    return successResponse(c, updated, "University updated successfully");
  })

  // ============ DELETE UNIVERSITY ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getUniversity({ id });
    if (!existing) {
      return notFoundResponse(c, "University not found");
    }

    await deleteUniversity({ id });
    return successResponse(c, null, "University deleted successfully");
  });

export default app;
