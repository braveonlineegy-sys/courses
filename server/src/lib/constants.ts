// User roles enum
export const UserRole = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  USER: "USER",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

// Recovery request status enum
export const RecoveryStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type RecoveryStatusType =
  (typeof RecoveryStatus)[keyof typeof RecoveryStatus];

export const CourseTerm = {
  REGULAR: "REGULAR",
  SUMMER: "SUMMER",
} as const;

export type CourseTermType = (typeof CourseTerm)[keyof typeof CourseTerm];

export const CourseStatus = {
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
} as const;

export type CourseStatusType = (typeof CourseStatus)[keyof typeof CourseStatus];

export const RequestStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type RequestStatusType =
  (typeof RequestStatus)[keyof typeof RequestStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type PaymentStatusType =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const PaymentMethod = {
  VODAFONE_CASH: "VODAFONE_CASH",
  INSTAPAY: "INSTAPAY",
} as const;

export type PaymentMethodType =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];
