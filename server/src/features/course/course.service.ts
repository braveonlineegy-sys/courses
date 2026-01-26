import prisma from "../../lib/db";
import { type Prisma, ChatType } from "@prisma/client";
import type {
  CreateCourse,
  DeleteCourse,
  GetCourse,
  GetCourses,
  UpdateCourse,
} from "./course.schema";

export const createCourse = async (data: CreateCourse) => {
  return prisma.course.create({
    data: {
      title: data.title,
      description: data.description,
      fileKey: data.fileKey,
      smallDescription: data.smallDescription,
      price: data.price,
      duration: data.duration,
      term: data.term,
      status: data.status,
      cashNumbers: data.cashNumbers || [],
      instapayUsername: data.instapayUsername,
      pdfLink: data.pdfLink,
      teacherId: data.teacherId,
      levelId: data.levelId,
      chatRooms: {
        create: {
          type: ChatType.COURSE,
        },
      },
    },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      level: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const updateCourse = async (data: UpdateCourse, id: string) => {
  return prisma.course.update({
    where: { id },
    data,
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      level: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const deleteCourse = async ({ id }: DeleteCourse) => {
  return prisma.course.delete({
    where: { id },
  });
};

export const getCourse = async ({ id }: GetCourse) => {
  return prisma.course.findUnique({
    where: { id },
    include: {
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
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
      chapters: {
        select: {
          id: true,
          title: true,
          position: true,
        },
        orderBy: { position: "asc" },
      },
      _count: {
        select: {
          chapters: true,
          quizzes: true,
          accesses: true,
        },
      },
    },
  });
};

export const getAllCourses = async (params: GetCourses) => {
  const { page, limit, search, levelId, teacherId } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(levelId && { levelId }),
    ...(teacherId && { teacherId }),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        level: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            quizzes: true,
            accesses: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, limit };
};

// Get courses by teacher ID
export const getCoursesByTeacher = async (
  teacherId: string,
  params: GetCourses,
) => {
  const { page, limit, search } = params;
  const skip = (page - 1) * limit;

  const where: Prisma.CourseWhereInput = {
    teacherId,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        level: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            chapters: true,
            quizzes: true,
            accesses: true,
          },
        },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { items, total, page, limit };
};
