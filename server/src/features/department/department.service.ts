import prisma from "../../lib/db";
import type {
  CreateDepartment,
  DeleteDepartment,
  GetDepartment,
  GetDepartments,
  UpdateDepartment,
} from "./department.schema";

export const createDepartment = async (data: CreateDepartment) => {
  return prisma.department.create({
    data,
  });
};

export const updateDepartment = async (data: UpdateDepartment, id: string) => {
  const { id: _, ...updates } = data; // Exclude ID from the update payload if present
  return prisma.department.update({
    where: {
      id,
    },
    data: updates,
  });
};

export const deleteDepartment = async ({ id }: DeleteDepartment) => {
  return prisma.department.delete({
    where: {
      id,
    },
  });
};

export const getDepartment = async ({ id }: GetDepartment) => {
  return prisma.department.findUnique({
    where: {
      id,
    },
  });
};

export const getDepartments = async ({ collegeId }: GetDepartments) => {
  return prisma.department.findMany({
    where: {
      collegeId,
    },
    orderBy: {
      name: "asc",
    },
  });
};
