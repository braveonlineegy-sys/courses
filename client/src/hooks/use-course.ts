import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";
import { type CreateCourse, type UpdateCourse } from "shared";

async function getAllCourses(
  page = 1,
  search = "",
  levelId?: string,
  limit = 10,
  teacherId?: string,
) {
  const res = await client.api.course.$get({
    query: {
      page: page.toString(),
      limit: limit.toString(),
      search,
      levelId,
      teacherId,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error((err as any).message || "Failed to fetch courses");
  }
  return res.json();
}

type CourseResponseType = Awaited<ReturnType<typeof getAllCourses>>;

export type CourseType = Extract<
  CourseResponseType,
  { success: true }
>["data"]["items"][number];

export function useCourse(
  page = 1,
  search = "",
  levelId?: string,
  limit = 10,
  teacherId?: string,
) {
  const queryClient = useQueryClient();

  // 1. Fetch Courses
  const coursesQuery = useQuery({
    queryKey: ["courses", page, search, levelId, limit, teacherId],
    queryFn: () => getAllCourses(page, search, levelId, limit, teacherId),
  });

  // 2. Create Course
  const createMutation = useMutation({
    mutationFn: async (json: CreateCourse) => {
      // Clean undefined values to prevent FormData from sending "undefined" string
      const payload = Object.fromEntries(
        Object.entries(json).filter(([_, v]) => v !== undefined),
      );

      const res = await client.api.course.$post({
        form: payload as any,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "Failed to create course");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update Course
  const updateMutation = useMutation({
    mutationFn: async ({ id, json }: { id: string; json: UpdateCourse }) => {
      const payload = Object.fromEntries(
        Object.entries(json).filter(([_, v]) => v !== undefined),
      );

      const res = await client.api.course[":id"].$patch({
        param: { id },
        form: payload as any,
      });

      if (!res.ok) {
        throw new Error("Failed to update course");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete Course
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.course[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("Failed to delete course");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    coursesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
