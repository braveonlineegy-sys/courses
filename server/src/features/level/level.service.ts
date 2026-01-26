import prisma from "../../lib/db";
import type {
  CreateLevel,
  DeleteLevel,
  GetLevel,
  GetLevels,
  UpdateLevel,
} from "./level.schema";

export const createLevel = async (data: CreateLevel) => {
  return prisma.level.create({
    data: {
      name: data.name,
      order: data.order,
      departmentId: data.departmentId,
    },
  });
};

export const updateLevel = async (data: UpdateLevel, id: string) => {
  return prisma.level.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteLevel = async ({ id }: DeleteLevel) => {
  return prisma.level.delete({
    where: {
      id,
    },
  });
};

export const getLevel = async ({ id }: GetLevel) => {
  return prisma.level.findUnique({
    where: {
      id,
    },
    include: {
      department: true,
    },
  });
};

export const getLevels = async ({ departmentId }: GetLevels) => {
  return prisma.level.findMany({
    where: {
      departmentId,
    },
    orderBy: {
      order: "asc",
    },
    include: {
      department: {
        include: {
          college: {
            include: {
              university: true,
            },
          },
        },
      },
    },
  });
};
