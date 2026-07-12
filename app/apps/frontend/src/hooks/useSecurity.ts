import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { securityService } from "@/services/security.service";

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  startedAt: string;
  isCurrent: boolean;
}

export interface ConnectionEntry {
  id: string;
  date: string;
  action: string;
  status: "success" | "failed" | "suspicious";
  device: string;
  ip: string;
  location: string;
  user: string;
}

export type FilterStatus = "all" | "success" | "failed" | "suspicious";

export interface SecurityAlert {
  id: string;
  type: "brute_force" | "unusual_location" | "password_change" | "account_locked";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  message: string;
  user: string;
  date: string;
  resolved: boolean;
}

export function useSecurity() {
  const queryClient = useQueryClient();

  const securityQuery = useQuery({
    queryKey: ["security-info"],
    queryFn: securityService.getSecurityInfo,
  });

  const sessionsQuery = useQuery({
    queryKey: ["sessions"],
    queryFn: securityService.getSessions,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: securityService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-info"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const revokeAllSessionsMutation = useMutation({
    mutationFn: securityService.revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-info"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: securityService.changePassword,
  });

  return {
    securityInfo: securityQuery.data,
    sessions: sessionsQuery.data || [],
    isLoading: securityQuery.isLoading || sessionsQuery.isLoading,
    revokeSession: revokeSessionMutation.mutateAsync,
    revokeAllSessions: revokeAllSessionsMutation.mutateAsync,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
  };
}
