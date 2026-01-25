import { Hono } from "hono";
import {
  createCollegeValidator,
  deleteCollegeValidator,
  getCollegeValidator,
  paginationValidator,
  updateCollegeValidator,
  getCollegesValidator,
} from "./college.schema";
import {
  createCollege,
  deleteCollege,
  getAllColleges,
  getCollege,
  updateCollege,
} from "./college.service";
import {
  paginatedResponse,
  successResponse,
  notFoundResponse,
} from "../../lib/response";

import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";

const app = new Hono()
  // ============ LIST COLLEGES (with Pagination) ============
  .get(
    "/",
    requireAuth,
    paginationValidator,
    getCollegesValidator,
    async (c) => {
      const { page, limit, search } = c.req.valid("query");
      // getCollegesValidator works on query too, so we can access universityId if passed
      const query = c.req.query();
      const universityId = query.universityId;

      const result = await getAllColleges({
        page,
        limit,
        search,
        universityId: universityId,
      });

      return paginatedResponse(
        c,
        result.items,
        result.total,
        result.page,
        result.limit,
        "Colleges retrieved successfully",
      );
    },
  )

  // ============ GET COLLEGE BY ID ============
  .get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return notFoundResponse(c, "College not found");
    }

    const college = await getCollege({ id });

    if (!college) {
      return notFoundResponse(c, "College not found");
    }

    return successResponse(c, college, "College retrieved successfully");
  })

  // ============ CREATE COLLEGE ============
  .post("/", requireAdmin, createCollegeValidator, async (c) => {
    const data = c.req.valid("json");
    const college = await createCollege(data);
    return successResponse(c, college, "College created successfully", 201);
  })

  // ============ UPDATE COLLEGE ============
  .patch("/:id", requireAdmin, updateCollegeValidator, async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const existing = await getCollege({ id });
    if (!existing) {
      return notFoundResponse(c, "College not found");
    }

    const updated = await updateCollege(data, id);
    return successResponse(c, updated, "College updated successfully");
  })

  // ============ DELETE COLLEGE ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getCollege({ id });
    if (!existing) {
      return notFoundResponse(c, "College not found");
    }

    await deleteCollege({ id });
    return successResponse(c, null, "College deleted successfully");
  });

export default app;
