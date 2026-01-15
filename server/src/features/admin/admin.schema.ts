import { z as zodOpenApi } from "@hono/zod-openapi";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../core/validation";

// ============ BASE SCHEMAS ============
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

// ============ VALIDATION SCHEMAS (for zValidator) ============
const createUserValidationSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: passwordSchema,
  role: z.enum(["TEACHER", "USER"], {
    message: "Role must be TEACHER or USER",
  }),
});

const banUserValidationSchema = z.object({
  reason: z.string().min(1, "Ban reason is required"),
});

const recoveryActionValidationSchema = z.object({
  adminNote: z.string().optional(),
});

// ============ OPENAPI SCHEMAS (for documentation) ============
export const createUserSchema = zodOpenApi
  .object({
    email: zodOpenApi.email().openapi({ example: "teacher@example.com" }),
    name: zodOpenApi.string().min(2).openapi({ example: "Teacher Name" }),
    password: zodOpenApi
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[a-z]/)
      .regex(/[0-9]/)
      .openapi({ example: "Password123" }),
    role: zodOpenApi.enum(["TEACHER", "USER"]).openapi({ example: "TEACHER" }),
  })
  .openapi("CreateUserInput");

export const banUserSchema = zodOpenApi
  .object({
    reason: zodOpenApi
      .string()
      .min(1)
      .openapi({ example: "Violation of terms" }),
  })
  .openapi("BanUserInput");

export const recoveryActionSchema = zodOpenApi
  .object({
    adminNote: zodOpenApi
      .string()
      .optional()
      .openapi({ example: "Approved after review" }),
  })
  .openapi("RecoveryActionInput");

export const idParamSchema = zodOpenApi.object({
  id: zodOpenApi
    .string()
    .openapi({ param: { name: "id", in: "path" }, example: "user-id-123" }),
});

// ============ VALIDATORS (Middleware) ============
export const createUserValidator = zValidator(
  "json",
  createUserValidationSchema,
  validationHook
);
export const banUserValidator = zValidator(
  "json",
  banUserValidationSchema,
  validationHook
);
export const recoveryActionValidator = zValidator(
  "json",
  recoveryActionValidationSchema,
  validationHook
);

// ============ TYPES ============
export type CreateUserInput = z.infer<typeof createUserValidationSchema>;
export type BanUserInput = z.infer<typeof banUserValidationSchema>;
export type RecoveryActionInput = z.infer<
  typeof recoveryActionValidationSchema
>;
