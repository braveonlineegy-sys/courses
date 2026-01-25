import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import { toast } from "sonner";

async function getAllColleges(page = 1, search = "", universityId: string) {
  const res = await client.api.college.$get({
    query: {
      universityId,
      page,
      limit: 10,
      search,
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

type CollegeResponseType = Awaited<ReturnType<typeof getAllColleges>>;

export type CollegeType = Extract<
  CollegeResponseType,
  { success: true }
>["data"]["items"][number];

export function useCollege(page = 1, search = "", universityId: string) {
  const queryClient = useQueryClient();

  // 1. Fetch Colleges
  const collegesQuery = useQuery({
    queryKey: ["colleges", page, search, universityId],
    queryFn: () => getAllColleges(page, search, universityId),
    enabled: !!universityId,
  });

  // 2. Create College
  const createMutation = useMutation({
    mutationFn: async (json: { name: string; universityId: string }) => {
      // Stubbing ID as backend might require it based on shared schema
      // but usually backend ignores it or we should fix schema.
      const res = await client.api.college.$post({
        json: {
          ...json,
          id: crypto.randomUUID(),
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
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast.success("تم إضافة الكلية بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 3. Update College
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      json,
    }: {
      id: string;
      json: { name: string; universityId: string };
    }) => {
      const res = await client.api.college[":id"].$patch({
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
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast.success("تم تحديث البيانات بنجاح");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // 4. Delete College
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await client.api.college[":id"].$delete({ param: { id } });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: "لا يمكن حذف هذه الكلية" }));

        // Handle varying error structures
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
      queryClient.invalidateQueries({ queryKey: ["colleges"] });
      toast.success("تم حذف الكلية");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return {
    collegesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
