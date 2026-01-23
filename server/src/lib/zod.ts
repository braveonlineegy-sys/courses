import type { Context } from "hono";
import { z } from "zod";
/**
 * Validation hook for zValidator
 * Returns flattened error response on validation failure
 */
export const validationHook = async (result: any, c: Context) => {
  if (!result.success) {
    return c.json({ error: z.flattenError(result.error) }, 400);
  }
};
