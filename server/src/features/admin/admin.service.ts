import prisma from "../../lib/db";
import {
  RecoveryStatus,
  UserRole,
  type UserRoleType,
} from "../../lib/constants";
import type { CreateUserInput } from "./admin.schema";

// We'll use better-auth's internal password handling
// Admin creates user, then user can reset password via forgot-password flow

// Create a new user (by admin)
export const createUser = async (input: CreateUserInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Create user without password - admin will send them a password reset link

  // Create user
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      role: input.role,
      emailVerified: true, // Admin-created accounts are auto-verified
    },
  });

  // Create account without password - user will set via password reset
  await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      accountId: user.id,
      providerId: "credential",
      userId: user.id,
      password: null, // Will be set when user resets password
    },
  });

  return user;
};

// Get all users (for admin)
export const getAllUsers = async (filters?: { role?: UserRoleType }) => {
  return prisma.user.findMany({
    where: {
      ...(filters?.role && { role: filters.role }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      deviceId: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get all teachers
export const getAllTeachers = async () => {
  return prisma.user.findMany({
    where: {
      role: "TEACHER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phoneNumber: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

// Get user by ID
export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      deviceId: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
    },
  });
};

// Ban a user
export const banUser = async (userId: string, reason: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      banReason: reason,
    },
  });
};

// Unban a user
export const unbanUser = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: false,
      banReason: null,
    },
  });
};

// Clear user's device binding (after recovery approval)
// User can then login from any device (old or new) - first login binds the device
export const clearUserDevice = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      deviceId: null, // Clear device binding
      isBanned: false,
      banReason: null,
    },
  });
};

// Get pending recovery requests
export const getPendingRecoveryRequests = async () => {
  return prisma.recoveryRequest.findMany({
    where: { status: RecoveryStatus.PENDING },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          deviceId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

// Approve recovery request
export const approveRecoveryRequest = async (
  requestId: string,
  adminNote?: string,
) => {
  const request = await prisma.recoveryRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new Error("Recovery request not found");
  }

  // Update recovery request status
  await prisma.recoveryRequest.update({
    where: { id: requestId },
    data: {
      status: RecoveryStatus.APPROVED,
      adminNote,
    },
  });

  // Clear device binding and unban user
  // User can now login from any device - first login will bind that device
  await clearUserDevice(request.userId);

  return { success: true };
};

// Reject recovery request
export const rejectRecoveryRequest = async (
  requestId: string,
  adminNote?: string,
) => {
  return prisma.recoveryRequest.update({
    where: { id: requestId },
    data: {
      status: RecoveryStatus.REJECTED,
      adminNote,
    },
  });
};
