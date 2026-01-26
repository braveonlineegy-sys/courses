import { describe, it, expect, mock, beforeEach } from "bun:test";
import { createCourse } from "./course.service";
import prisma from "../../lib/db";
import { ChatType, CourseStatus, CourseTerm } from "@prisma/client";

// Mock the prisma client
mock.module("../../lib/db", () => {
  return {
    default: {
      course: {
        create: mock(() =>
          Promise.resolve({ id: "course-123", title: "Test Course" }),
        ),
      },
    },
  };
});

describe("Course Service", () => {
  beforeEach(() => {
    // Clear mocks before each test
    // @ts-ignore
    prisma.course.create.mockClear();
  });

  it("should create a course with a chat room", async () => {
    const courseData = {
      title: "Introduction to Testing",
      description: "Learn how to write tests",
      fileKey: "test-file-key",
      smallDescription: "Short description",
      price: 100,
      duration: 60,
      term: CourseTerm.REGULAR,
      status: CourseStatus.PUBLISHED,
      cashNumbers: ["01000000000"],
      instapayUsername: "tester@instapay",
      pdfLink: "http://example.com/pdf",
      teacherId: "teacher-123",
      levelId: "level-123",
    };

    await createCourse(courseData);

    // Verify prisma.course.create was called
    expect(prisma.course.create).toHaveBeenCalled();

    // Verify the arguments passed to create
    // @ts-ignore
    const callArgs = prisma.course.create.mock.calls[0][0];

    // Check that chatRooms.create is present and has the correct type
    expect(callArgs.data.chatRooms).toBeDefined();
    expect(callArgs.data.chatRooms.create).toEqual({
      type: ChatType.COURSE,
    });

    // Verify other fields passed through correctly
    expect(callArgs.data.title).toBe(courseData.title);
    expect(callArgs.data.teacherId).toBe(courseData.teacherId);
  });
});
