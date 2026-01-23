import prisma from "../../lib/db";
import { RecoveryStatus } from "../../lib/constants";

// ============ DEVICE BINDING ============
export const checkDeviceBinding = async (userId: string, deviceId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deviceId: true, email: true },
  });

  if (!user) {
    return { allowed: false, reason: "User not found" };
  }

  // First login - no device bound yet
  if (!user.deviceId) {
    return { allowed: true, needsBinding: true };
  }

  // Check if device matches
  if (user.deviceId !== deviceId) {
    // Ban the user for trying to login from a different device
    await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: true,
        banReason:
          "تم حظر حسابك بسبب محاولة تسجيل الدخول من جهاز مختلف. يرجى تقديم طلب استرداد لفك الحظر.",
      },
    });

    return {
      allowed: false,
      reason:
        "تم حظر حسابك لمحاولة تسجيل الدخول من جهاز مختلف. يرجى تقديم طلب استرداد.",
      banned: true,
    };
  }

  return { allowed: true, needsBinding: false };
};

export const bindDevice = async (userId: string, deviceId: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { deviceId },
  });
};

// ============ RECOVERY REQUESTS ============
interface RecoveryRequestInput {
  message: string;
  deviceId: string;
}

export const createRecoveryRequest = async (
  userId: string,
  input: RecoveryRequestInput,
) => {
  // Check if user already has a pending request
  const existingRequest = await prisma.recoveryRequest.findFirst({
    where: {
      userId,
      status: RecoveryStatus.PENDING,
    },
  });

  if (existingRequest) {
    throw new Error("You already have a pending recovery request");
  }

  return prisma.recoveryRequest.create({
    data: {
      userId,
      message: input.message,
      newDeviceId: input.deviceId,
    },
  });
};

export const getLatestRecoveryStatus = async (userId: string) => {
  return prisma.recoveryRequest.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      adminNote: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
