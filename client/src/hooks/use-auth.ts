import { AUTH_KEYS } from "@/constants/auth-keys";
import { client } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  getApiErrorMessage,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "shared";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: session, isLoading } = useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const res = await client.api.auth.custom.me.$get();
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const user = session?.user ?? null;
  const role = user?.role;
  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: async (vars: LoginInput) => {
      const res = await client.api.auth.custom.login.$post({ json: vars });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(getApiErrorMessage(err, "Login failed"));
      }
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_KEYS.me });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await client.api.auth.custom.logout.$post();
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_KEYS.me, null);
      router.navigate({ to: "/login" });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (vars: ForgotPasswordInput) => {
      const res = await client.api.auth.custom["forgot-password"].$post({
        json: vars,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(getApiErrorMessage(err, "Failed to send reset email"));
      }
      return res.json();
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (vars: ResetPasswordInput) => {
      const res = await client.api.auth.custom["reset-password"].$post({
        json: vars,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(getApiErrorMessage(err, "Failed to reset password"));
      }
      return res.json();
    },
  });

  return {
    user,
    role,
    isAuthenticated,
    isLoading,

    isAdmin: role === "ADMIN",
    isTeacher: role === "TEACHER",
    isStudent: role === "USER",

    login: loginMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    resetPassword: resetPasswordMutation.mutateAsync,

    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isSendingResetEmail: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
  };
};
