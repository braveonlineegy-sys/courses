import { AUTH_KEYS } from "@/constants/auth-keys";
import { client } from "@/lib/client";
import { queryClient } from "@/providers/queryClient";

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

// Check if user has specific role
export const requireRole = async (
  role: "ADMIN" | "TEACHER" | "USER",
): Promise<SessionData | null> => {
  const session = await fetchSession();
  if (!session?.user || session.user.role !== role) {
    return null;
  }
  return session;
};
