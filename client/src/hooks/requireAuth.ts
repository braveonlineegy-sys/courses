import { queryClient } from "@/providers/queryClient";
import { redirect } from "@tanstack/react-router";
import { client } from "@/lib/client";

export async function requireAuth() {
  const session = await queryClient.ensureQueryData({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await client.api.auth.custom.me.$get();
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!session?.user) {
    throw redirect({ to: "/login" });
  }
}
