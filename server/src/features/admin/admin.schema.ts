import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";

// ============ REUSABLE SCHEMAS ============
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

// ============ ADMIN SCHEMAS ============
export const createUserSchema = z.object({
  email: z.email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: passwordSchema,
  role: z.enum(["TEACHER", "USER"]),
});

export const banUserSchema = z.object({
  reason: z.string().min(1, "Ban reason is required"),
});

export const recoveryActionSchema = z
  .object({
    adminNote: z.string().optional(),
  })
  .optional()
  .default({});

// ============ VALIDATORS ============
export const createUserValidator = zValidator(
  "json",
  createUserSchema,
  validationHook,
);
export const banUserValidator = zValidator(
  "json",
  banUserSchema,
  validationHook,
);
export const recoveryActionValidator = zValidator(
  "json",
  recoveryActionSchema,
  validationHook,
);

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["TEACHER", "USER"]).optional(),
  password: passwordSchema.optional(), // Admin can update password directly if needed
});

export const changePasswordSchema = z.object({
  password: passwordSchema,
});

export const updateUserValidator = zValidator(
  "json",
  updateUserSchema,
  validationHook,
);

export const changePasswordValidator = zValidator(
  "json",
  changePasswordSchema,
  validationHook,
);

// ============ TYPES ============
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type RecoveryActionInput = z.infer<typeof recoveryActionSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const getTeachersSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  isBanned: z.enum(["true", "false", "all"]).optional().default("all"),
  search: z.string().optional(),
});

export const getTeachersValidator = zValidator(
  "query",
  getTeachersSchema,
  validationHook,
);

export type GetTeachersInput = z.infer<typeof getTeachersSchema>;

// ============ STUDENT SCHEMAS ============

export const getStudentsSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  isBanned: z.enum(["true", "false", "all"]).optional().default("all"),
  search: z.string().optional(),
  levelId: z.string().optional(),
  departmentId: z.string().optional(),
  collegeId: z.string().optional(),
  universityId: z.string().optional(),
});

export const getStudentsValidator = zValidator(
  "query",
  getStudentsSchema,
  validationHook,
);

export type GetStudentsInput = z.infer<typeof getStudentsSchema>;

export const updateStudentLevelSchema = z.object({
  levelId: z.string().nullable(),
});

export const updateStudentLevelValidator = zValidator(
  "json",
  updateStudentLevelSchema,
  validationHook,
);

export type UpdateStudentLevelInput = z.infer<typeof updateStudentLevelSchema>;

export const bulkUpdateStudentLevelsSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user ID is required"),
  levelId: z.string().nullable(),
});

export const bulkUpdateStudentLevelsValidator = zValidator(
  "json",
  bulkUpdateStudentLevelsSchema,
  validationHook,
);

export type BulkUpdateStudentLevelsInput = z.infer<
  typeof bulkUpdateStudentLevelsSchema
>;
