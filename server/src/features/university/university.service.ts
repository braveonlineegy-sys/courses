import prisma from "../../lib/db";
import type { Prisma } from "@prisma/client";
import {
  type CreateUniversity,
  type DeleteUniversity,
  type GetUniversity,
  type UpdateUniversity,
  type PaginationInput,
} from "./university.schema";

export const createUniversity = async (data: CreateUniversity) => {
  return prisma.university.create({
    data,
  });
};

export const updateUniversity = async (data: UpdateUniversity, id: string) => {
  const {  ...updates } = data;
  return prisma.university.update({
    where: {
      id,
    },
    data: updates,
  });
};

export const deleteUniversity = async ({ id }: DeleteUniversity) => {
  return prisma.university.delete({
    where: {
      id,
    },
  });
};

export const getUniversity = async ({ id }: GetUniversity) => {
  return prisma.university.findUnique({
    where: {
      id,
    },
  });
};

export const getAllUniversities = async (params: PaginationInput) => {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.UniversityWhereInput = search
    ? {
        name: { contains: search, mode: "insensitive" },
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.university.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: "asc" },
    }),
    prisma.university.count({ where }),
  ]);

  return { items, total, page, limit };
};
