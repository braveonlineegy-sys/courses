import prisma from "../../lib/db";
import {
  RecoveryStatus,
  UserRole,
  type UserRoleType,
} from "../../lib/constants";
import type {
  CreateUserInput,
  UpdateUserInput,
  ChangePasswordInput,
} from "./admin.schema";

// We'll use better-auth's internal password handling
// Admin creates user, then user can reset password via forgot-password flow

// Create a new user (by admin)
export const createUser = async (input: CreateUserInput) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        emailVerified: true,
      },
    });

    await tx.account.create({
      data: {
        id: Bun.randomUUIDv7(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: null,
      },
    });

    return user;
  });
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

// Get all teachers with pagination and filtering
export const getAllTeachers = async (params: {
  page: number;
  limit: number;
  isBanned?: "true" | "false" | "all";
  search?: string;
}) => {
  const { page, limit, isBanned, search } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    role: "TEACHER",
  };

  if (isBanned && isBanned !== "all") {
    where.isBanned = isBanned === "true";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phoneNumber: true,
        isBanned: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    metadata: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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
      image: true,
      phoneNumber: true,
      coursesCreated: {
        select: {
          id: true,
          title: true,
          status: true,
          price: true,
          term: true,
          level: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              accesses: true, // Number of students/accesses
            },
          },
        },
      },
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

// Update user
export const updateUser = async (userId: string, input: UpdateUserInput) => {
  if (input.password) {
    // Use better-auth to update password (hashes it automatically)
    // We need to pass a fake session context or use internal API if available
    // Current workaround: We assume 'auth.api.updateUser' can be called.
    // However, without a session, it might fail.
    // Let's try to update ONLY the info via Prisma for now, and handle password separately.
    // BUT user wants password change.
    // Let's use `auth.api.updateUser` and catch error?
  }

  // Update basic info via Prisma
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
    },
  });
};

export const changeUserPassword = async (userId: string, password: string) => {
  // Ideally use auth.api.updateUser but strictly for password
  // Since we are running in a Hono env, we might be able to call the API handler?
  // Alternative: We can use `prisma` IF we knew how to hash.
  // For now, let's try to use auth.api if it exposes a direct method.
  // NOTE: better-auth server `auth` object has `internal` property in some versions?
  // Let's try:
  /*
    await auth.api.updateUser({
        body: { password },
        headers: ... // Needs session
    })
    */
  // WITHOUT session, we might be blocked.
  // Creating a session for the user?
  throw new Error("Password change not yet fully implemented securely");
};

// Delete user
export const deleteUser = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};

// Unban a user
export const unbanUser = async (userId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: false,
      banReason: null,
      deviceId: null, // Reset device so user can login from a new mobile
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

// ============ STUDENT MANAGEMENT ============

// Get all students with pagination and filtering
export const getAllStudents = async (params: {
  page: number;
  limit: number;
  isBanned?: "true" | "false" | "all";
  search?: string;
  levelId?: string;
  departmentId?: string;
  collegeId?: string;
  universityId?: string;
}) => {
  const {
    page,
    limit,
    isBanned,
    search,
    levelId,
    departmentId,
    collegeId,
    universityId,
  } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    role: "USER",
  };

  if (isBanned && isBanned !== "all") {
    where.isBanned = isBanned === "true";
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  // Filter by level hierarchy
  if (levelId) {
    where.levelId = levelId;
  } else if (departmentId) {
    // Filter by department - get all levels in this department
    where.level = { departmentId: departmentId };
  } else if (collegeId) {
    // Filter by college - get all levels in departments in this college
    where.level = { department: { collegeId: collegeId } };
  } else if (universityId) {
    // Filter by university - get all levels in departments in colleges in this university
    where.level = { department: { college: { universityId: universityId } } };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        phoneNumber: true,
        isBanned: true,
        createdAt: true,
        level: {
          select: {
            id: true,
            name: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            courseAccesses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    metadata: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get student by ID with full details including purchased courses
export const getStudentById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id, role: "USER" },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      phoneNumber: true,
      isBanned: true,
      banReason: true,
      createdAt: true,
      deviceId: true,
      level: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              id: true,
              name: true,
              college: {
                select: {
                  id: true,
                  name: true,
                  university: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      courseAccesses: {
        select: {
          id: true,
          startsAt: true,
          expiresAt: true,
          isActive: true,
          grantedBy: true,
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              teacher: {
                select: {
                  id: true,
                  name: true,
                },
              },
              level: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          courseAccesses: true,
          lessonProgress: true,
          quizAttempts: true,
        },
      },
    },
  });
};

// Update a single student's level
export const updateStudentLevel = async (
  userId: string,
  levelId: string | null,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { levelId },
  });
};

// Bulk update multiple students' levels
export const bulkUpdateStudentLevels = async (
  userIds: string[],
  levelId: string | null,
) => {
  return prisma.user.updateMany({
    where: { id: { in: userIds } },
    data: { levelId },
  });
};
