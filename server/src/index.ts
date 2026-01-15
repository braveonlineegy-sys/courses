import { Hono } from "hono";
import { Scalar } from "@scalar/hono-api-reference";
import { logger } from "hono/logger";

import { applyOnError } from "./lib/on-error";
import { CorsMiddleware } from "./middlewares/cors.middleware";
import { auth } from "./lib/auth";
import { adminRoute } from "./features/admin/admin.route";
import { authRoute } from "./features/auth/auth.route";
import env from "./lib/config";

// Create base app
const app = new Hono().basePath("/api").use(logger());

// Apply CORS middleware
app.use("/*", CorsMiddleware);

// ============ ROUTES (chained for type inference) ============
const routes = app
  // Health check
  .get("/", (c) => c.json({ status: "ok", message: "API is running" }))

  // Custom auth routes (MUST be before better-auth wildcard)
  .route("/auth/custom", authRoute)

  // Better-auth routes (catch-all for other auth endpoints like Google OAuth)
  .on(["POST", "GET"], "/auth/*", (c) => auth.handler(c.req.raw))

  // Admin routes
  .route("/admin", adminRoute);

// ============ OPENAPI DOCS ============
import { openApiSpec } from "./lib/openapi";

app.get("/openapi.json", (c) => {
  const spec = {
    ...openApiSpec,
    servers: [
      { url: new URL(c.req.url).origin, description: "Current server" },
    ],
  };
  return c.json(spec);
});

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
export type AppType = typeof routes;
