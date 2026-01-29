import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useQueryState,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";
import { client } from "@/lib/client";
import { toast } from "sonner";

// ============ GET STUDENTS LIST ============

export const getStudentsList = async (params: {
  page: number;
  limit: number;
  isBanned: "true" | "false" | "all";
  search: string;
  levelId?: string;
  departmentId?: string;
  collegeId?: string;
  universityId?: string;
}) => {
  const res = await client.api.admin.students.$get({
    query: {
      page: params.page.toString(),
      limit: params.limit.toString(),
      isBanned: params.isBanned,
      search: params.search,
      levelId: params.levelId,
      departmentId: params.departmentId,
      collegeId: params.collegeId,
      universityId: params.universityId,
    },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch students");
  }
  const data = await res.json();
  return data.data;
};

// ============ GET SINGLE STUDENT ============

export const getStudent = async (id: string) => {
  const res = await client.api.admin.students[":id"].$get({
    param: { id },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch student");
  }
  const data = await res.json();
  return data.data?.student!;
};

export type StudentDetailsType = Awaited<ReturnType<typeof getStudent>>;

// ============ USE STUDENTS HOOK ============

export function useStudents() {
  const queryClient = useQueryClient();

  // URL State Management with nuqs
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
  const [levelId, setLevelId] = useQueryState(
    "levelId",
    parseAsString.withDefault(""),
  );
  const [departmentId, setDepartmentId] = useQueryState(
    "departmentId",
    parseAsString.withDefault(""),
  );
  const [collegeId, setCollegeId] = useQueryState(
    "collegeId",
    parseAsString.withDefault(""),
  );
  const [universityId, setUniversityId] = useQueryState(
    "universityId",
    parseAsString.withDefault(""),
  );

  const params = {
    page,
    limit,
    isBanned,
    search,
    levelId: levelId || undefined,
    departmentId: departmentId || undefined,
    collegeId: collegeId || undefined,
    universityId: universityId || undefined,
  };

  // Helper to update params
  const setParams = (
    updater:
      | Partial<typeof params>
      | ((prev: typeof params) => Partial<typeof params>),
  ) => {
    const newValues = typeof updater === "function" ? updater(params) : updater;
    if ("page" in newValues) setPage(newValues.page ?? 1);
    if ("limit" in newValues) setLimit(newValues.limit ?? 10);
    if ("isBanned" in newValues) setIsBanned(newValues.isBanned ?? "all");
    if ("search" in newValues) setSearch(newValues.search ?? "");
    if ("levelId" in newValues) setLevelId(newValues.levelId || null);
    if ("departmentId" in newValues)
      setDepartmentId(newValues.departmentId || null);
    if ("collegeId" in newValues) setCollegeId(newValues.collegeId || null);
    if ("universityId" in newValues)
      setUniversityId(newValues.universityId || null);
  };

  const studentsQuery = useQuery({
    queryKey: ["students", params],
    queryFn: () => getStudentsList(params as any),
  });

  // Ban Student
  const banMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await client.api.admin.users[":id"].ban.$patch({
        param: { id },
        json: { reason },
      });
      if (!res.ok) throw new Error("Failed to ban student");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم حظر الطالب بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  // Unban Student
  const unbanMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.admin.users[":id"].unban.$patch({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to unban student");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم فك الحظر عن الطالب");
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete Student
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.admin.users[":id"].$delete({
        param: { id },
      });
      if (!res.ok) throw new Error("Failed to delete student");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم حذف الطالب بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  // Update Student Level
  const updateLevelMutation = useMutation({
    mutationFn: async ({
      id,
      levelId,
    }: {
      id: string;
      levelId: string | null;
    }) => {
      const res = await client.api.admin.students[":id"].level.$patch({
        param: { id },
        json: { levelId },
      });
      if (!res.ok) throw new Error("Failed to update student level");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("تم تحديث مستوى الطالب");
    },
    onError: (err) => toast.error(err.message),
  });

  // Bulk Update Student Levels
  const bulkUpdateLevelsMutation = useMutation({
    mutationFn: async ({
      userIds,
      levelId,
    }: {
      userIds: string[];
      levelId: string | null;
    }) => {
      const res = await client.api.admin.students["bulk-level"].$patch({
        json: { userIds, levelId },
      });
      if (!res.ok) throw new Error("Failed to update students levels");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success(`تم تحديث مستوى ${data.data?.count || 0} طالب`);
    },
    onError: (err) => toast.error(err.message),
  });

  return {
    studentsQuery,
    banMutation,
    unbanMutation,
    deleteMutation,
    updateLevelMutation,
    bulkUpdateLevelsMutation,
    params,
    setParams,
  };
}

// ============ USE STUDENT HOOK ============

export function useStudent(id: string) {
  const studentQuery = useQuery({
    queryKey: ["student", id],
    queryFn: () => getStudent(id),
    enabled: !!id,
  });

  return { studentQuery };
}
