import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import prisma from "../../lib/db";
import { auth } from "../../lib/auth";
import {
  loginSchema,
  signupSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
  recoveryRequestSchema,
  emailQuerySchema,
} from "./auth.schema";
import {
  checkDeviceBinding,
  bindDevice,
  createRecoveryRequest,
  getLatestRecoveryStatus,
} from "./auth.service";

// ============ AUTH ROUTES ============
export const authRoute = new Hono()
  // ============ LOGIN ============
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password, deviceId } = c.req.valid("json");

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return c.json({ success: false, message: "Invalid credentials" }, 401);
      }

      if (user.isBanned) {
        return c.json(
          { success: false, message: user.banReason || "Account is banned" },
          403
        );
      }

      // Device binding only for USER role (students)
      if (user.role === "USER") {
        const deviceCheck = await checkDeviceBinding(user.id, deviceId);

        if (!deviceCheck.allowed) {
          return c.json(
            {
              success: false,
              message: deviceCheck.reason || "Device not allowed",
            },
            403
          );
        }

        if (deviceCheck.needsBinding) {
          await bindDevice(user.id, deviceId);
        }
      }

      const response = await auth.api.signInEmail({
        body: { email, password },
      });

      return c.json({
        success: true,
        message: "Login successful",
        data: { user: response.user, token: response.token },
      });
    } catch (error) {
      console.error("Login error:", error);
      return c.json({ success: false, message: "Invalid credentials" }, 401);
    }
  })

  // ============ SIGNUP ============
  .post("/signup", zValidator("json", signupSchema), async (c) => {
    const { email, password, name } = c.req.valid("json");

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (existingUser) {
        return c.json(
          { success: false, message: "Email already registered" },
          400
        );
      }

      const response = await auth.api.signUpEmail({
        body: { email, password, name },
      });

      // Auto-verify email
      if (response.user?.id) {
        await prisma.user.update({
          where: { id: response.user.id },
          data: { emailVerified: true },
        });
      }

      return c.json(
        {
          success: true,
          message: "Account created successfully",
          data: {
            user: { ...response.user, emailVerified: true },
            token: response.token,
          },
        },
        201
      );
    } catch (error) {
      console.error("Signup error:", error);
      return c.json({ success: false, message: "Signup failed" }, 500);
    }
  })

  // ============ GOOGLE LOGIN ============
  .post("/google", zValidator("json", googleAuthSchema), async (c) => {
    const { idToken, deviceId } = c.req.valid("json");

    try {
      // For mobile apps, the client already has the Google ID token
      // Better-auth handles Google OAuth via its built-in routes
      // This endpoint is for mobile clients that use Google Sign-In SDK

      // Redirect to better-auth's Google OAuth handler
      // The actual Google auth is handled by better-auth at /auth/signin/google
      return c.json({
        success: true,
        message: "Use /api/auth/signin/google for Google authentication",
        data: {
          authUrl: "/api/auth/signin/google",
          callbackUrl: "/api/auth/callback/google",
        },
      });
    } catch (error) {
      console.error("Google auth error:", error);
      return c.json(
        { success: false, message: "Google authentication failed" },
        400
      );
    }
  })

  // ============ FORGOT PASSWORD ============
  .post(
    "/forgot-password",
    zValidator("json", forgotPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        await auth.api.requestPasswordReset({
          body: { email, redirectTo: "/reset-password" },
        });
      } catch (error) {
        console.error("Forgot password error:", error);
      }

      // Always return success to prevent email enumeration
      return c.json({
        success: true,
        message: "If email exists, a reset link will be sent",
      });
    }
  )

  // ============ RESET PASSWORD ============
  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token, newPassword } = c.req.valid("json");

      try {
        await auth.api.resetPassword({ body: { token, newPassword } });
        return c.json({
          success: true,
          message: "Password reset successfully",
        });
      } catch (error) {
        console.error("Reset password error:", error);
        return c.json(
          { success: false, message: "Failed to reset password" },
          400
        );
      }
    }
  )

  // ============ RECOVERY REQUEST ============
  .post(
    "/recovery/request",
    zValidator("json", recoveryRequestSchema),
    async (c) => {
      try {
        const { email, message, deviceId } = c.req.valid("json");

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, isBanned: true },
        });

        if (!user) {
          return c.json({ success: false, message: "User not found" }, 404);
        }

        if (!user.isBanned) {
          return c.json(
            { success: false, message: "Account is not banned" },
            400
          );
        }

        const request = await createRecoveryRequest(user.id, {
          message,
          deviceId,
        });

        return c.json(
          {
            success: true,
            message: "Recovery request submitted successfully",
            data: { requestId: request.id },
          },
          201
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to submit recovery request";
        return c.json({ success: false, message: errorMessage }, 400);
      }
    }
  )

  // ============ RECOVERY STATUS ============
  .get("/recovery/status", zValidator("query", emailQuerySchema), async (c) => {
    const { email } = c.req.valid("query");

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return c.json({ success: false, message: "User not found" }, 404);
    }

    const status = await getLatestRecoveryStatus(user.id);

    if (!status) {
      return c.json(
        { success: false, message: "No recovery request found" },
        404
      );
    }

    return c.json({
      success: true,
      message: "Recovery status retrieved",
      data: { status },
    });
  });
