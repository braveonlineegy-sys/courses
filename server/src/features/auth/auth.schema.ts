import { zValidator } from "@hono/zod-validator";
import { validationHook } from "../../lib/zod";

// Re-export schemas and types from shared
export {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  recoveryRequestSchema,
  emailQuerySchema,
  passwordSchema,
  type LoginInput,
  type SignupInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
  type GoogleAuthInput,
  type RecoveryRequestInput,
} from "shared";

import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  recoveryRequestSchema,
  emailQuerySchema,
} from "shared";

// ============ VALIDATORS ============
export const loginValidator = zValidator("json", loginSchema, validationHook);
export const signupValidator = zValidator("json", signupSchema, validationHook);
export const forgotPasswordValidator = zValidator(
  "json",
  forgotPasswordSchema,
  validationHook,
);
export const resetPasswordValidator = zValidator(
  "json",
  resetPasswordSchema,
  validationHook,
);
export const googleAuthValidator = zValidator(
  "json",
  googleAuthSchema,
  validationHook,
);
export const recoveryRequestValidator = zValidator(
  "json",
  recoveryRequestSchema,
  validationHook,
);
export const emailQueryValidator = zValidator(
  "query",
  emailQuerySchema,
  validationHook,
);
