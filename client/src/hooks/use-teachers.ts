import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { client } from "@/lib/client";
import { toast } from "sonner";

export function useTeachers() {
  const queryClient = useQueryClient();

  // 1. URL State Management with nuqs
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [isBanned, setIsBanned] = useQueryState(
    "isBanned",
    parseAsStringLiteral(["all", "true", "false"] as const).withDefault("all"),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const params = {
    page,
    limit,
    isBanned,
    search,
  };

  // Helper to update params like before (partial update)
  const setParams = (
    updater:
      | Partial<typeof params>
      | ((prev: typeof params) => Partial<typeof params>),
  ) => {
    const newValues = typeof updater === "function" ? updater(params) : updater;
    if (newValues.page !== undefined) setPage(newValues.page);
    if (newValues.limit !== undefined) setLimit(newValues.limit);
    if (newValues.isBanned !== undefined) setIsBanned(newValues.isBanned);
    if (newValues.search !== undefined) setSearch(newValues.search);
  };

  const teachersQuery = useQuery({
    queryKey: ["teachers", params],
    queryFn: async () => {
      const res = await client.api.admin.teachers.$get({
        query: {
          page: params.page.toString(),
          limit: params.limit.toString(),
          isBanned: params.isBanned,
          search: params.search,
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch teachers");
      }
      const data = await res.json();
      return data.data; // Now returns { users, metadata }
    },
  });

  // 2. Create Teacher
  const createMutation = useMutation({
    mutationFn: async (json: any) => {
      // Ideally typed as CreateUserInput
      const res = await client.api.admin.users.$post({
        json: { ...json, role: "TEACHER" },
      });
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error("هذا البريد الإلكتروني مسجل بالفعل");
        }
        // Fallback for other errors or 500s
        throw new Error("فشل إنشاء حساب المعلم");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("تم إنشاء حساب المعلم بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  // 3. Update Teacher
  const updateMutation = useMutation({
    mutationFn: async ({ id, json }: { id: string; json: any }) => {
      const res = await client.api.admin.users[":id"].$patch({
        param: { id },
        json,
      });
      if (!res.ok) throw new Error("Failed to update teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  // 4. Change Password
  const changePasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await client.api.admin.users[":id"].password.$patch({
        param: { id },
        json: { password },
      });
      if (!res.ok) throw new Error("Failed to update password");
      return res.json();
    },
    onSuccess: () => toast.success("Password changed successfully"),
    onError: (err) => toast.error(err.message),
  });

  // 5. Delete Teacher
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.admin.users[":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher deleted successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  // 6. Ban Teacher
  const banMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await client.api.admin.users[":id"].ban.$patch({
        param: { id },
        json: { reason },
      });
      if (!res.ok) throw new Error("Failed to ban teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher banned successfully");
    },
  });

  // 7. Unban Teacher
  const unbanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.admin.users[":id"].unban.$patch({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to unban teacher");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher unbanned successfully");
    },
  });

  return {
    teachersQuery,
    createMutation,
    updateMutation,
    changePasswordMutation,
    deleteMutation,
    banMutation,
    unbanMutation,
    params,
    setParams,
  };
}

export const getTeacher = async (id: string) => {
  const res = await client.api.admin.users[":id"].$get({
    param: { id },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch teacher");
  }
  const data = await res.json();
  return data.data?.user!;
};

export type TeacherDetailsType = Awaited<ReturnType<typeof getTeacher>>;

export function useTeacher(id: string) {
  const teacherQuery = useQuery({
    queryKey: ["teacher", id],
    queryFn: () => getTeacher(id),
    enabled: !!id,
  });

  return { teacherQuery };
}
