import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

import { applyOnError } from "./lib/on-error";
import { CorsMiddleware } from "./middlewares/cors.middleware";
import { auth } from "./lib/auth";
import { adminRoute } from "./features/admin/admin.route";
import { recoveryRoute } from "./features/recovery/recovery.route";
import { authRoute } from "./features/auth/auth.route";
import env from "./lib/config";

// Create base app with OpenAPIHono
const app = new OpenAPIHono().basePath("/api");
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

// CORS for all routes
app.use("/*", CorsMiddleware);

// Health check
app.get("/", (c) => c.json({ status: "ok", message: "API is running" }));

// Custom auth routes (MUST be before better-auth wildcard)
app.route("/auth/custom", authRoute);

// Better-auth routes (catch-all for other auth endpoints)
app.on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw));

// Admin routes
app.route("/admin", adminRoute);

// Recovery account routes
app.route("/recovery", recoveryRoute);

// ============ OPENAPI DOCS ============
app.doc("/openapi.json", (c) => ({
  openapi: "3.1.0",
  info: {
    title: "Courses API",
    version: "1.0.0",
    description: "API documentation for Courses mobile application",
  },
  tags: [
    {
      name: "Auth",
      description: "Authentication (login, signup, password reset)",
    },
    { name: "Admin", description: "Admin-only user management endpoints" },
    { name: "Recovery", description: "Account recovery for banned users" },
  ],
  servers: [{ url: new URL(c.req.url).origin, description: "Current server" }],
}));

app.get(
  "/docs",
  Scalar({
    url: "/api/openapi.json",
    pageTitle: "Courses API Documentation",
    theme: "purple",
  })
);

// Apply error handler
applyOnError(app);

export default {
  port: env.PORT || 3000,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};

// ============ CLIENT TYPES ============
// Create a typed representation for the client (using regular Hono for proper type inference)
const typedApp = new Hono()
  .basePath("/api")
  .get("/", (c) => c.json({ status: "ok", message: "API is running" }))
  .route("/auth/custom", authRoute)
  .route("/admin", adminRoute)
  .route("/recovery", recoveryRoute);

export type AppType = typeof typedApp;
