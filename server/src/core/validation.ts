import type { Context } from "hono";
import type { ZodError } from "zod";

/**
 * Shared validation hook for Hono zValidator
 * Returns formatted error response on validation failure
 */
export const validationHook = (
  result: { success: boolean; error?: ZodError<unknown>; data?: unknown },
  c: Context
): Response | undefined => {
  if (!result.success && result.error) {
    const fieldErrors = result.error.flatten().fieldErrors;

    // Create simple message from first error
    const firstError = result.error.errors[0];
    const message = firstError
      ? `${firstError.path.join(".")}: ${firstError.message}`
      : "Validation failed";

    return c.json(
      {
        success: false,
        message,
        errors: fieldErrors,
      },
      400
    );
  }
  return undefined;
};
