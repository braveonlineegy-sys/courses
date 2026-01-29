import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";
import {
  type CreateLesson,
  type UpdateLesson,
  type ReorderLessons,
} from "shared";

// Fetch lessons by chapter
export async function getLessonsByChapter(chapterId: string) {
  const res = await client.api.lesson.$get({
    query: { chapterId },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error((err as any).message || "فشل في جلب الدروس");
  }
  return res.json();
}

// Fetch single lesson
export async function getLesson(id: string) {
  const res = await client.api.lesson[":id"].$get({
    param: { id },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error((err as any).message || "فشل في جلب الدرس");
  }
  return res.json();
}

type LessonResponseType = Awaited<ReturnType<typeof getLessonsByChapter>>;

export type LessonType = Extract<
  LessonResponseType,
  { success: true }
>["data"][number];

export function useLesson(chapterId?: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Lessons
  const lessonsQuery = useQuery({
    queryKey: ["lessons", chapterId],
    queryFn: () => getLessonsByChapter(chapterId!),
    enabled: !!chapterId,
  });

  // 2. Create Lesson
  const createMutation = useMutation({
    mutationFn: async (data: CreateLesson) => {
      const res = await client.api.lesson.$post({
        json: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "فشل في إنشاء الدرس");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("تم إنشاء الدرس بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update Lesson
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateLesson }) => {
      const res = await client.api.lesson[":id"].$patch({
        param: { id },
        json: data,
      });

      if (!res.ok) {
        throw new Error("فشل في تحديث الدرس");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("تم تحديث الدرس بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete Lesson
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.lesson[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("فشل في حذف الدرس");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      toast.success("تم حذف الدرس بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 5. Reorder Lessons
  const reorderMutation = useMutation({
    mutationFn: async (data: ReorderLessons) => {
      const res = await client.api.lesson.reorder.$post({
        json: data,
      });

      if (!res.ok) {
        throw new Error("فشل في إعادة ترتيب الدروس");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lessons", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    lessons: lessonsQuery.data?.data ?? [],
    isLoading: lessonsQuery.isLoading,
    lessonsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  };
}
