import type { Context } from "hono";

/**
 * Validation hook for zValidator
 * Returns flattened error response on validation failure
 */
export const validationHook = async (result: any, c: Context) => {
  if (!result.success) {
    return c.json(
      { error: result.error.flatten() },
      400
    );
  }
};
