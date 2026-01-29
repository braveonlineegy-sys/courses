import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";
import { type CreateLevel, type UpdateLevel } from "shared";

export async function getLevels(departmentId: string) {
  const res = await client.api.level.$get({
    query: { departmentId },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error((err as any).message || "Failed to fetch levels");
  }
  return res.json();
}

type LevelResponseType = Awaited<ReturnType<typeof getLevels>>;

export type LevelType = Extract<
  LevelResponseType,
  { success: true }
>["data"][number];

export function useLevel(departmentId?: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Levels
  const levelsQuery = useQuery({
    queryKey: ["levels", departmentId],
    queryFn: () => getLevels(departmentId!),
    enabled: !!departmentId,
  });

  // 2. Create Level
  const createMutation = useMutation({
    mutationFn: async (json: CreateLevel) => {
      const res = await client.api.level.$post({
        json,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error((err as any).message || "Failed to create level");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level created successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update Level
  const updateMutation = useMutation({
    mutationFn: async ({ id, json }: { id: string; json: UpdateLevel }) => {
      const res = await client.api.level[":id"].$patch({
        param: { id },
        json,
      });

      if (!res.ok) {
        throw new Error("Failed to update level");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level updated successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete Level
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.level[":id"].$delete({
        param: { id },
      });

      if (!res.ok) {
        throw new Error("Failed to delete level");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      toast.success("Level deleted successfully");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    levelsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
