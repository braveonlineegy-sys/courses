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
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: passwordSchema,
  role: z.enum(["TEACHER", "USER"]),
});

export const banUserSchema = z.object({
  reason: z.string().min(1, "Ban reason is required"),
});

export const recoveryActionSchema = z.object({
  adminNote: z.string().optional(),
});

// ============ VALIDATORS ============
export const createUserValidator = zValidator(
  "json",
  createUserSchema,
  validationHook
);
export const banUserValidator = zValidator(
  "json",
  banUserSchema,
  validationHook
);
export const recoveryActionValidator = zValidator(
  "json",
  recoveryActionSchema,
  validationHook
);

// ============ TYPES ============
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
export type RecoveryActionInput = z.infer<typeof recoveryActionSchema>;
