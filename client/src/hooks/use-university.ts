import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";

export function useUniversity(page = 1, search = "") {
  const queryClient = useQueryClient();

  // 1. Fetch All Universities
  const universitiesQuery = useQuery({
    queryKey: ["universities", page, search],
    queryFn: async () => {
      const res = await client.api.university.$get({
        query: { page, limit: 10, search },
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
          // استخراج أخطاء Zod لو وجدت
          errorMessage = err.error.formErrors[0] || "بيانات غير صالحة";
        }

        throw new Error(errorMessage);
      }
      return res.json();
    },
  });

  // 2. Create University
  const createMutation = useMutation({
    mutationFn: async (json: { name: string }) => {
      const res = await client.api.university.$post({ json });
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
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("تم إضافة الجامعة بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update University
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      json,
    }: {
      id: string;
      json: { name: string; isActive?: boolean };
    }) => {
      const res = await client.api.university[":id"].$patch({
        param: { id },
        json: {
          name: json.name,
          isActive: json.isActive ?? true,
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
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete University
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.university[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "لا يمكن حذف هذه الجامعة" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["universities"] });
      toast.success("تم حذف الجامعة نهائياً");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    universitiesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
