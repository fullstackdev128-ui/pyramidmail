import { useQuery } from "@tanstack/react-query";
import { authService } from "@/services/auth.service";

export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  role?: string;
  plan?: string;
  lastLoginAt?: string | null;
  createdAt?: string;
};

export const AUTH_QUERY_KEY = ["me"] as const;

export function useAuth() {
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<AuthUser | null>({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await authService.me();
        return res.data.user;
      } catch (error: any) {
        if (error?.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    user: user ?? null,
    isLoading,
    isError,
    isAuthenticated: !!user,
  };
}
