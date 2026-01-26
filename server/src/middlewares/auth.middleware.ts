import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import { UserRole } from "../lib/constants";
import { unauthorizedResponse, forbiddenResponse } from "../lib/response";

// Middleware to require authentication
export const requireAuth = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return unauthorizedResponse(c, "Authentication required");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

// Middleware to require admin role
export const requireAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return unauthorizedResponse(c, "Authentication required");
  }

  if (session.user.role !== UserRole.ADMIN) {
    return forbiddenResponse(c, "Admin access required");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

export const requireTeacher = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return unauthorizedResponse(c, "Authentication required");
  }

  if (session.user.role !== UserRole.TEACHER) {
    return forbiddenResponse(c, "Teacher access required");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};
// Middleware to require teacher or admin role
export const requireTeacherOrAdmin = async (c: Context, next: Next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return unauthorizedResponse(c, "Authentication required");
  }

  const role = session.user.role;
  if (role !== UserRole.ADMIN && role !== UserRole.TEACHER) {
    return forbiddenResponse(c, "Teacher or Admin access required");
  }

  c.set("user", session.user);
  c.set("session", session.session);

  await next();
};

