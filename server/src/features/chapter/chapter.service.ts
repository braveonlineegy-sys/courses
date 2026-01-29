import prisma from "../../lib/db";
import type {
  CreateChapter,
  UpdateChapter,
  ReorderChapters,
} from "./chapter.schema";

export const createChapter = async (data: CreateChapter) => {
  // Get the max position for the course
  const maxPosition = await prisma.chapter.aggregate({
    where: { courseId: data.courseId },
    _max: { position: true },
  });

  const newPosition = (maxPosition._max.position ?? 0) + 1;

  return prisma.chapter.create({
    data: {
      title: data.title,
      courseId: data.courseId,
      position: newPosition,
    },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
    },
  });
};

export const updateChapter = async (id: string, data: UpdateChapter) => {
  return prisma.chapter.update({
    where: { id },
    data,
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
    },
  });
};

export const deleteChapter = async (id: string) => {
  return prisma.chapter.delete({
    where: { id },
  });
};

export const getChaptersByCourse = async (courseId: string) => {
  return prisma.chapter.findMany({
    where: { courseId },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
      quizzes: true,
    },
  });
};

export const getChapter = async (id: string) => {
  return prisma.chapter.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { position: "asc" },
      },
      quizzes: true,
      Course: {
        select: {
          id: true,
          title: true,
          teacherId: true,
        },
      },
    },
  });
};

export const reorderChapters = async (data: ReorderChapters) => {
  const { courseId, chapters } = data;

  // Use transaction for atomicity
  return prisma.$transaction(
    chapters.map((chapter: { id: string; position: number }) =>
      prisma.chapter.update({
        where: { id: chapter.id, courseId },
        data: { position: chapter.position },
      }),
    ),
  );
};
