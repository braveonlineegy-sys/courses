import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/client";

export function useTeacher(id: string) {
  const teacherQuery = useQuery({
    queryKey: ["teacher", id],
    queryFn: async () => {
      const res = await client.api.admin.users[":id"].$get({
        param: { id },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch teacher");
      }
      const data = await res.json();
      return data.data?.user;
    },
    enabled: !!id,
  });

  return { teacherQuery };
}
