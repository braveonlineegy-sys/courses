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
    { name: "University", description: "University management" },
    { name: "College", description: "College management" },
    { name: "Department", description: "Department management" },
    { name: "Level", description: "Level management" },
    { name: "Course", description: "Course management" },
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
    // ============ COLLEGE ROUTES ============
    "/api/college": {
      get: {
        tags: ["College"],
        summary: "Get all colleges",
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
          {
            name: "universityId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "List of colleges" } },
      },
      post: {
        tags: ["College"],
        summary: "Create a new college (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "universityId"],
                properties: {
                  name: { type: "string" },
                  universityId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "College created" } },
      },
    },
    "/api/college/{id}": {
      get: {
        tags: ["College"],
        summary: "Get college by ID",
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
          200: { description: "College details" },
          404: { description: "College not found" },
        },
      },
      patch: {
        tags: ["College"],
        summary: "Update college (Admin only)",
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
                  universityId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "College updated" } },
      },
      delete: {
        tags: ["College"],
        summary: "Delete college (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "College deleted" } },
      },
    },
    // ============ DEPARTMENT ROUTES ============
    "/api/department": {
      get: {
        tags: ["Department"],
        summary: "Get all departments",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "collegeId",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "List of departments" } },
      },
      post: {
        tags: ["Department"],
        summary: "Create a new department (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "collegeId"],
                properties: {
                  name: { type: "string" },
                  collegeId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Department created" } },
      },
    },
    "/api/department/{id}": {
      get: {
        tags: ["Department"],
        summary: "Get department by ID",
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
          200: { description: "Department details" },
          404: { description: "Department not found" },
        },
      },
      patch: {
        tags: ["Department"],
        summary: "Update department (Admin only)",
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
                  collegeId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Department updated" } },
      },
      delete: {
        tags: ["Department"],
        summary: "Delete department (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Department deleted" } },
      },
    },
    // ============ LEVEL ROUTES ============
    "/api/level": {
      get: {
        tags: ["Level"],
        summary: "Get all levels",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "departmentId",
            in: "query",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "List of levels" } },
      },
      post: {
        tags: ["Level"],
        summary: "Create a new level (Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "order", "departmentId"],
                properties: {
                  name: { type: "string" },
                  order: { type: "integer" },
                  departmentId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Level created" } },
      },
    },
    "/api/level/{id}": {
      get: {
        tags: ["Level"],
        summary: "Get level by ID",
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
          200: { description: "Level details" },
          404: { description: "Level not found" },
        },
      },
      patch: {
        tags: ["Level"],
        summary: "Update level (Admin only)",
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
                required: ["name", "order", "departmentId"],
                properties: {
                  name: { type: "string" },
                  order: { type: "integer" },
                  departmentId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Level updated" } },
      },
      delete: {
        tags: ["Level"],
        summary: "Delete level (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Level deleted" } },
      },
    },
    // ============ COURSE ROUTES ============
    "/api/course": {
      get: {
        tags: ["Course"],
        summary: "Get all courses",
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
          {
            name: "levelId",
            in: "query",
            required: false,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "List of courses" } },
      },
      post: {
        tags: ["Course"],
        summary: "Create a new course (Teacher or Admin)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "title",
                  "description",
                  "fileKey",
                  "smallDescription",
                  "price",
                  "duration",
                  "term",
                  "status",
                  "teacherId",
                ],
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  fileKey: { type: "string" },
                  smallDescription: { type: "string" },
                  price: { type: "integer", minimum: 0 },
                  duration: { type: "integer", minimum: 1 },
                  term: { type: "string", enum: ["REGULAR", "SUMMER"] },
                  status: { type: "string", enum: ["PUBLISHED", "ARCHIVED"] },
                  teacherId: { type: "string" },
                  levelId: { type: "string", format: "uuid" },
                  cashNumbers: { type: "array", items: { type: "string" } },
                  instapayUsername: { type: "string" },
                  pdfLink: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 201: { description: "Course created" } },
      },
    },
    "/api/course/my-courses": {
      get: {
        tags: ["Course"],
        summary: "Get courses owned by the current teacher",
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
        responses: { 200: { description: "List of teacher's courses" } },
      },
    },
    "/api/course/{id}": {
      get: {
        tags: ["Course"],
        summary: "Get course by ID",
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
          200: { description: "Course details" },
          404: { description: "Course not found" },
        },
      },
      patch: {
        tags: ["Course"],
        summary: "Update course (Teacher for own courses, Admin for any)",
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
                  title: { type: "string" },
                  description: { type: "string" },
                  fileKey: { type: "string" },
                  smallDescription: { type: "string" },
                  price: { type: "integer", minimum: 0 },
                  duration: { type: "integer", minimum: 1 },
                  term: { type: "string", enum: ["REGULAR", "SUMMER"] },
                  status: { type: "string", enum: ["PUBLISHED", "ARCHIVED"] },
                  levelId: { type: "string", format: "uuid" },
                  cashNumbers: { type: "array", items: { type: "string" } },
                  instapayUsername: { type: "string" },
                  pdfLink: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Course updated" } },
      },
      delete: {
        tags: ["Course"],
        summary: "Delete course (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: { 200: { description: "Course deleted" } },
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
