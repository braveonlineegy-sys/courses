import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";
import {
  type CreateChapter,
  type UpdateChapter,
  type ReorderChapters,
} from "shared";

// Fetch chapters by course
export async function getChaptersByCourse(courseId: string) {
  const res = await client.api.chapter.$get({
    query: { courseId },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error((err as any).message || "فشل في جلب الفصول");
  }
  return res.json();
}

type ChapterResponseType = Awaited<ReturnType<typeof getChaptersByCourse>>;

export type ChapterType = Extract<
  ChapterResponseType,
  { success: true }
>["data"][number];

export function useChapter(courseId?: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Chapters
  const chaptersQuery = useQuery({
    queryKey: ["chapters", courseId],
    queryFn: () => getChaptersByCourse(courseId!),
    enabled: !!courseId,
  });

  // 2. Create Chapter
  const createMutation = useMutation({
    mutationFn: async (data: CreateChapter) => {
      const res = await client.api.chapter.$post({
        json: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "فشل في إنشاء الفصل");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
      toast.success("تم إنشاء الفصل بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update Chapter
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateChapter }) => {
      const res = await client.api.chapter[":id"].$patch({
        param: { id },
        json: data,
      });

      if (!res.ok) {
        throw new Error("فشل في تحديث الفصل");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
      toast.success("تم تحديث الفصل بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete Chapter
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.chapter[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("فشل في حذف الفصل");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
      toast.success("تم حذف الفصل بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 5. Reorder Chapters
  const reorderMutation = useMutation({
    mutationFn: async (data: ReorderChapters) => {
      const res = await client.api.chapter.reorder.$post({
        json: data,
      });

      if (!res.ok) {
        throw new Error("فشل في إعادة ترتيب الفصول");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters", courseId] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    chapters: chaptersQuery.data?.data ?? [],
    isLoading: chaptersQuery.isLoading,
    chaptersQuery,
    createMutation,
    updateMutation,
    deleteMutation,
    reorderMutation,
  };
}
