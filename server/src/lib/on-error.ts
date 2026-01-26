import { HTTPException } from "hono/http-exception";
import type { Hono } from "hono";
import type { ApiResponse } from "shared";
import { Prisma } from "@prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const applyOnError = (app: Hono<any, any, any>) => {
  app.onError((err, c) => {
    // Handle HTTPException (thrown intentionally)

    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return c.json(
        {
          success: false,
          message: "Conflict",
          error: "Resource already exists",
          data: null,
          statusCode: 409,
        },
        409,
      );
    }

    if (err instanceof HTTPException) {
      const response: ApiResponse<null> = {
        success: false,
        message: "Request failed",
        data: null,
        error: err.message,
        statusCode: err.status,
      };
      return c.json(response, err.status);
    }

    // Log unexpected errors
    console.error("Unhandled error:", err);

    // Handle all other errors
    const response: ApiResponse<null> = {
      success: false,
      message: "Internal server error",
      data: null,
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
      statusCode: 500,
    };
    return c.json(response, 500);
  });

  // Handle 404 - Not Found
  app.notFound((c) => {
    const response: ApiResponse<null> = {
      success: false,
      message: "Not found",
      data: null,
      error: `Route ${c.req.method} ${c.req.path} not found`,
      statusCode: 404,
    };
    return c.json(response, 404);
  });
};
