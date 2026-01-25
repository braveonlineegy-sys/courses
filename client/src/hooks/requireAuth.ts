import { queryClient } from "@/providers/queryClient";
import { redirect } from "@tanstack/react-router";
import { client } from "@/lib/client";
import { AUTH_KEYS } from "@/constants/auth-keys";

export async function requireAuth() {
  const session = await queryClient.ensureQueryData({
    queryFn: async () => {
      const res = await client.api.auth.custom.me.$get();
      if (!res.ok) return null;
      return res.json();
    },
    queryKey: AUTH_KEYS.me,
  });

  if (!session?.user) {
    throw redirect({ to: "/login" });
  }
}
