import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";

// ============ REUSABLE SCHEMAS ============
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number");

// ============ AUTH SCHEMAS ============
export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: passwordSchema,
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required"),
  deviceId: z.string().min(1, "Device ID is required"),
});

// ============ RECOVERY SCHEMAS ============
export const recoveryRequestSchema = z.object({
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  deviceId: z.string().min(1, "Device ID is required"),
});

export const emailQuerySchema = z.object({
  email: z.string().email("Invalid email"),
});

// ============ VALIDATORS ============
export const loginValidator = zValidator("json", loginSchema, validationHook);
export const signupValidator = zValidator("json", signupSchema, validationHook);
export const forgotPasswordValidator = zValidator(
  "json",
  forgotPasswordSchema,
  validationHook
);
export const resetPasswordValidator = zValidator(
  "json",
  resetPasswordSchema,
  validationHook
);
export const googleAuthValidator = zValidator(
  "json",
  googleAuthSchema,
  validationHook
);
export const recoveryRequestValidator = zValidator(
  "json",
  recoveryRequestSchema,
  validationHook
);
export const emailQueryValidator = zValidator(
  "query",
  emailQuerySchema,
  validationHook
);

// ============ TYPES ============
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;
export type RecoveryRequestInput = z.infer<typeof recoveryRequestSchema>;
