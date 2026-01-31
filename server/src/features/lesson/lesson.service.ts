import prisma from "../../lib/db";
import type {
  CreateLesson,
  UpdateLesson,
  ReorderLessons,
} from "./lesson.schema";

export const createLesson = async (data: CreateLesson) => {
  // Get the max position for the chapter
  const maxPosition = await prisma.lesson.aggregate({
    where: { chapterId: data.chapterId },
    _max: { position: true },
  });

  const newPosition = (maxPosition._max.position ?? 0) + 1;

  return prisma.lesson.create({
    data: {
      title: data.title,
      chapterId: data.chapterId,
      description: data.description || null,
      video: data.video || null,
      pdfLink: data.pdfLink || null,
      thumbnail: data.thumbnail || null,
      isFree: data.isFree ?? false,
      position: newPosition,
    },
  });
};

export const updateLesson = async (id: string, data: UpdateLesson) => {
  return prisma.lesson.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && {
        description: data.description || null,
      }),
      ...(data.video !== undefined && { video: data.video || null }),
      ...(data.pdfLink !== undefined && { pdfLink: data.pdfLink || null }),
      ...(data.thumbnail !== undefined && {
        thumbnail: data.thumbnail || null,
      }),
      ...(data.isFree !== undefined && { isFree: data.isFree }),
    },
  });
};

export const deleteLesson = async (id: string) => {
  return prisma.lesson.delete({
    where: { id },
  });
};

export const getLessonsByChapter = async (chapterId: string) => {
  return prisma.lesson.findMany({
    where: { chapterId },
    orderBy: { position: "asc" },
    include: {
      quizzes: true,
    },
  });
};

export const getLesson = async (id: string) => {
  return prisma.lesson.findUnique({
    where: { id },
    include: {
      quizzes: true,
      Chapter: {
        select: {
          id: true,
          title: true,
          courseId: true,
          Course: {
            select: {
              id: true,
              title: true,
              teacherId: true,
            },
          },
        },
      },
    },
  });
};

export const reorderLessons = async (data: ReorderLessons) => {
  const { chapterId, lessons } = data;

  // Use transaction for atomicity
  return prisma.$transaction(
    lessons.map((lesson: { id: string; position: number }) =>
      prisma.lesson.update({
        where: { id: lesson.id, chapterId },
        data: { position: lesson.position },
      }),
    ),
  );
};
