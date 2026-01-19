import type { Context } from "hono";
import type { ApiResponse, ApiSuccessResponse, ApiErrorResponse } from "shared";

// Success response helper
export const successResponse = <T>(
  c: Context,
  data: T,
  message = "Success",
  statusCode = 200,
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    error: null,
    statusCode,
  };
  return c.json(response, statusCode as any);
};

// Error response helper
export const errorResponse = (
  c: Context,
  error: string,
  statusCode = 400,
  message = "Error",
) => {
  const response: ApiResponse<null> = {
    success: false,
    message,
    data: null,
    error,
    statusCode,
  };
  return c.json(response, statusCode as any);
};

// Common error responses
export const unauthorizedResponse = (c: Context, error = "Unauthorized") => {
  return errorResponse(c, error, 401, "Authentication required");
};

export const forbiddenResponse = (c: Context, error = "Forbidden") => {
  return errorResponse(c, error, 403, "Access denied");
};

export const notFoundResponse = (c: Context, error = "Not found") => {
  return errorResponse(c, error, 404, "Resource not found");
};

export const badRequestResponse = (c: Context, error: string) => {
  return errorResponse(c, error, 400, "Bad request");
};

export const serverErrorResponse = (
  c: Context,
  error = "Internal server error",
) => {
  return errorResponse(c, error, 500, "Server error");
};

// Pagination response helper
export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const paginatedResponse = <T>(
  c: Context,
  items: T[],
  total: number,
  page: number,
  limit: number,
  message = "Success",
) => {
  const totalPages = Math.ceil(total / limit);
  const data: PaginatedData<T> = {
    items,
    total,
    page,
    limit,
    totalPages,
  };
  return successResponse(c, data, message);
};
