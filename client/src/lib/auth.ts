import { AUTH_KEYS } from "@/constants/auth-keys";
import { client } from "@/lib/client";
import { queryClient } from "@/providers/queryClient";
import { redirect } from "@tanstack/react-router";
// Session type
export interface SessionData {
  user: {
    id: string;
    email: string;
    name: string | null;
    role: "ADMIN" | "TEACHER" | "USER";
  } | null;
}

// Fetch session with caching - for use in route beforeLoad
export const fetchSession = async (): Promise<SessionData | null> => {
  return queryClient.fetchQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      try {
        const res = await client.api.auth.custom.me.$get();
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await fetchSession();
  return !!session?.user;
};

export async function requireRole(requiredRole: "ADMIN" | "TEACHER" | "USER") {
  const session = await queryClient.ensureQueryData({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await client.api.auth.custom.me.$get();
      if (!res.ok) return null;
      return res.json();
    },
  });

  if (!session?.user) {
    throw redirect({ to: "/login", replace: true });
  }

  if (session.user.role !== requiredRole) {
    // Redirect to correct dashboard based on actual role
    const redirectTo =
      session.user.role === "ADMIN"
        ? "/admin"
        : session.user.role === "TEACHER"
          ? "/teacher"
          : "/";

    throw redirect({ to: redirectTo, replace: true });
  }

  return session;
}
