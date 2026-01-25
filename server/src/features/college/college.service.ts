import prisma from "../../lib/db";
import type { Prisma } from "@prisma/client";
import {
  type CreateCollege,
  type DeleteCollege,
  type GetCollege,
  type UpdateCollege,
  type PaginationInput,
  type GetColleges,
} from "./college.schema";

export const createCollege = async (data: CreateCollege) => {
  return prisma.college.create({
    data: {
      name: data.name,
      universityId: data.universityId,
    },
  });
};

export const updateCollege = async (data: UpdateCollege, id: string) => {
  const { id: _, ...updates } = data;
  return prisma.college.update({
    where: {
      id,
    },
    data: updates,
  });
};

export const deleteCollege = async ({ id }: DeleteCollege) => {
  return prisma.college.delete({
    where: {
      id,
    },
  });
};

export const getCollege = async ({ id }: GetCollege) => {
  return prisma.college.findUnique({
    where: {
      id,
    },
    include: {
      university: true,
    },
  });
};

export const getAllColleges = async (
  params: PaginationInput & Partial<GetColleges>,
) => {
  const { page, limit, search, universityId } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.CollegeWhereInput = {
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    ...(universityId ? { universityId } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.college.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
      include: {
        university: true,
      },
    }),
    prisma.college.count({ where }),
  ]);

  return { items, total, page, limit };
};
