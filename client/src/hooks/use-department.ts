import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";

async function getAllDepartments(collegeId: string) {
  const res = await client.api.department.$get({
    query: {
      collegeId,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    let errorMessage = "حدث خطأ غير متوقع";
    if ("message" in err) {
      errorMessage = err.message;
    } else if (
      "error" in err &&
      typeof err.error === "object" &&
      "formErrors" in err.error
    ) {
      errorMessage = err.error.formErrors[0] || "بيانات غير صالحة";
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

type DepartmentResponseType = Awaited<ReturnType<typeof getAllDepartments>>;

export type DepartmentType = Extract<
  DepartmentResponseType,
  { success: true }
>["data"][number];
// Note: `getDepartments` in `department.service.ts` (checked way earlier) returned an array directly?
// Or was it wrapped in `successResponse`?
// In `department.route.ts`: `return successResponse(c, result, ...)`
// `result` from `getDepartments` service is `prisma.department.findMany`.
// So data is `Department[]`.
// So `["data"]` is the array. `[number]` makes it the item.

export function useDepartment(collegeId: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Departments
  const departmentsQuery = useQuery({
    queryKey: ["departments", collegeId],
    queryFn: () => getAllDepartments(collegeId),
    enabled: !!collegeId,
  });

  // 2. Create Department
  const createMutation = useMutation({
    mutationFn: async (json: { name: string; collegeId: string }) => {
      const res = await client.api.department.$post({
        json: {
          ...json,
          id: crypto.randomUUID(), // Stub ID
        },
      });

      if (!res.ok) {
        const err = await res.json();
        let errorMessage = "حدث خطأ غير متوقع";
        if ("message" in err) {
          errorMessage = err.message;
        } else if (
          "error" in err &&
          typeof err.error === "object" &&
          "formErrors" in err.error
        ) {
          errorMessage = err.error.formErrors[0] || "بيانات غير صالحة";
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("تم إضافة القسم بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update Department
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      json,
    }: {
      id: string;
      json: { name: string; collegeId: string };
    }) => {
      const res = await client.api.department[":id"].$patch({
        param: { id },
        json: {
          ...json,
          id,
        },
      });
      if (!res.ok) {
        const err = await res.json();
        let errorMessage = "حدث خطأ غير متوقع";
        if ("message" in err) {
          errorMessage = err.message;
        } else if (
          "error" in err &&
          typeof err.error === "object" &&
          "formErrors" in err.error
        ) {
          errorMessage = err.error.formErrors[0] || "بيانات غير صالحة";
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete Department
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.department[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "لا يمكن حذف هذا القسم" }));

        let errorMessage = "حدث خطأ غير متوقع";
        if (err && typeof err === "object" && "message" in err) {
          errorMessage = err.message as string;
        } else if (typeof err === "string") {
          errorMessage = err;
        }
        throw new Error(errorMessage);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      toast.success("تم حذف القسم");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    departmentsQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
