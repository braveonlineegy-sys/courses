// Standard API Response Types (shared between frontend and backend)
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  error: null;
  statusCode: number;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  error: string;
  statusCode: number;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper type to extract error message from API response
export const getApiErrorMessage = (
  err: unknown,
  fallback = "Something went wrong",
): string => {
  if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as ApiErrorResponse).message === "string"
  ) {
    return (err as ApiErrorResponse).message;
  }
  if (
    typeof err === "object" &&
    err !== null &&
    "error" in err &&
    typeof (err as ApiErrorResponse).error === "string"
  ) {
    return (err as ApiErrorResponse).error;
  }
  return fallback;
};

