import type { Context } from "hono";
import type { ZodError } from "zod";

/**
 * Validation hook for zValidator
 * Returns flattened error response on validation failure
 *
 * Usage:
 * export const myValidator = zValidator("json", mySchema, validationHook);
 */
export const validationHook = async (
  result: { success: boolean; error?: ZodError<unknown> },
  c: Context
) => {
  if (!result.success && result.error) {
    return c.json({ error: result.error.flatten() }, 400);
  }
};
