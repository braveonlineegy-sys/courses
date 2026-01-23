// OpenAPI specification for the API
export const openApiSpec = {
  openapi: "3.1.0",
  info: {
    title: "Courses API",
    version: "1.0.0",
    description: "API documentation for Courses mobile application",
  },
  tags: [
    {
      name: "Auth",
      description:
        "Authentication (login, signup, Google, password reset, recovery)",
    },
    { name: "Admin", description: "Admin-only user management endpoints" },
  ],
  paths: {
    // ============ AUTH ROUTES ============
    "/api/auth/custom/login": {
      post: {
        tags: ["Auth"],
        summary: "Login with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "deviceId"],
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string" },
                  deviceId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Login successful" },
          401: { description: "Invalid credentials" },
          403: { description: "Account banned or device mismatch" },
        },
      },
    },
    "/api/auth/custom/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "password"],
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Account created successfully" },
          400: { description: "Email already registered" },
        },
      },
    },
    "/api/auth/custom/google": {
      post: {
        tags: ["Auth"],
        summary: "Google authentication info",
        responses: {
          200: { description: "Returns Google OAuth URLs" },
        },
      },
    },
    "/api/auth/custom/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Reset link sent if email exists" },
        },
      },
    },
    "/api/auth/custom/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token", "newPassword"],
                properties: {
                  token: { type: "string" },
                  newPassword: { type: "string", minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password reset successfully" },
          400: { description: "Invalid token" },
        },
      },
    },
    "/api/auth/custom/recovery/request": {
      post: {
        tags: ["Auth"],
        summary: "Submit recovery request (for banned users)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "message", "deviceId"],
                properties: {
                  email: { type: "string", format: "email" },
                  message: { type: "string", minLength: 10 },
                  deviceId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Recovery request submitted" },
          400: { description: "Account not banned" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/auth/custom/recovery/status": {
      get: {
        tags: ["Auth"],
        summary: "Check recovery request status",
        parameters: [
          {
            name: "email",
            in: "query",
            required: true,
            schema: { type: "string", format: "email" },
          },
        ],
        responses: {
          200: { description: "Recovery status returned" },
          404: { description: "No recovery request found" },
        },
      },
    },
    // ============ ADMIN ROUTES ============
    "/api/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Get all users",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "List of users" },
          403: { description: "Admin only" },
        },
      },
      post: {
        tags: ["Admin"],
        summary: "Create a new user",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "name", "password", "role"],
                properties: {
                  email: { type: "string", format: "email" },
                  name: { type: "string" },
                  password: { type: "string" },
                  role: { type: "string", enum: ["TEACHER", "USER"] },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User created" },
          400: { description: "Email exists" },
        },
      },
    },
    "/api/admin/users/{id}": {
      get: {
        tags: ["Admin"],
        summary: "Get user by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "User details" },
          404: { description: "User not found" },
        },
      },
    },
    "/api/admin/users/{id}/ban": {
      patch: {
        tags: ["Admin"],
        summary: "Ban a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["reason"],
                properties: { reason: { type: "string" } },
              },
            },
          },
        },
        responses: { 200: { description: "User banned" } },
      },
    },
    "/api/admin/users/{id}/unban": {
      patch: {
        tags: ["Admin"],
        summary: "Unban a user",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "User unbanned" } },
      },
    },
    "/api/admin/recovery-requests": {
      get: {
        tags: ["Admin"],
        summary: "Get pending recovery requests",
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: "List of pending requests" } },
      },
    },
    "/api/admin/recovery-requests/{id}/approve": {
      patch: {
        tags: ["Admin"],
        summary: "Approve recovery request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Request approved" } },
      },
    },
    "/api/admin/recovery-requests/{id}/reject": {
      patch: {
        tags: ["Admin"],
        summary: "Reject recovery request",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "Request rejected" } },
      },
    },
    // ============ UNIVERSITY ROUTES ============
    "/api/university": {
      get: {
        tags: ["University"],
        summary: "Get all universities",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", default: 10 },
          },
          {
            name: "search",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: { 200: { description: "List of universities" } },
      },
      post: {
        tags: ["University"],
        summary: "Create a new university (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "University created" } },
      },
    },
    "/api/university/{id}": {
      get: {
        tags: ["University"],
        summary: "Get university by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "University details" },
          404: { description: "University not found" },
        },
      },
      patch: {
        tags: ["University"],
        summary: "Update university (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  isActive: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "University updated" } },
      },
      delete: {
        tags: ["University"],
        summary: "Delete university (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "University deleted" } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
      },
    },
  },
};
