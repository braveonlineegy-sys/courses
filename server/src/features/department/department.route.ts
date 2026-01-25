import { Hono } from "hono";
import {
  createDepartmentValidator,
  deleteDepartmentValidator,
  getDepartmentsValidator,
  updateDepartmentValidator,
} from "./department.schema";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
} from "./department.service";
import { successResponse, notFoundResponse } from "../../lib/response";

import { requireAdmin, requireAuth } from "../../middlewares/auth.middleware";

const app = new Hono()
  // ============ LIST DEPARTMENTS (by University ID) ============
  .get("/", requireAuth, getDepartmentsValidator, async (c) => {
    const { collegeId } = c.req.valid("query");
    const result = await getDepartments({ collegeId });

    return successResponse(c, result, "Departments retrieved successfully");
  })

  // ============ GET DEPARTMENT BY ID ============
  .get("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    if (!id) {
      return notFoundResponse(c, "Department not found");
    }
    const department = await getDepartment({ id });

    if (!department) {
      return notFoundResponse(c, "Department not found");
    }

    return successResponse(c, department, "Department retrieved successfully");
  })

  // ============ CREATE DEPARTMENT ============
  .post("/", requireAdmin, createDepartmentValidator, async (c) => {
    const data = c.req.valid("json");
    const department = await createDepartment(data);
    return successResponse(
      c,
      department,
      "Department created successfully",
      201,
    );
  })

  // ============ UPDATE DEPARTMENT ============
  .patch("/:id", requireAdmin, updateDepartmentValidator, async (c) => {
    const id = c.req.param("id");
    const data = c.req.valid("json");

    const existing = await getDepartment({ id });
    if (!existing) {
      return notFoundResponse(c, "Department not found");
    }

    const updated = await updateDepartment(data, id);
    return successResponse(c, updated, "Department updated successfully");
  })

  // ============ DELETE DEPARTMENT ============
  .delete("/:id", requireAdmin, async (c) => {
    const id = c.req.param("id");

    const existing = await getDepartment({ id });
    if (!existing) {
      return notFoundResponse(c, "Department not found");
    }

    await deleteDepartment({ id });
    return successResponse(c, null, "Department deleted successfully");
  });

export default app;
