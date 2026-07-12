import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  totalEmails: number;
  storageUsed: number;
  newUsersMonth: number;
  emailsToday: number;
};

export type AdminUser = {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  plan: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export function useAdmin() {
  const qc = useQueryClient();

  const statsQuery = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get("/admin/stats");
      return res.data;
    },
  });

  const usersQuery = useQuery<AdminUser[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const res = await api.get("/admin/users");
      return res.data;
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await api.patch(`/admin/users/${id}`, { role });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, plan }: { id: string; plan: string }) => {
      const res = await api.patch(`/admin/users/${id}/plan`, { plan });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return {
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,
    users: usersQuery.data ?? [],
    isLoadingUsers: usersQuery.isLoading,
    updateRole: updateRoleMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  };
}
export function useAdminSecurity() {
  return useQuery({
    queryKey: ["admin", "security"],
    queryFn: async () => {
      const res = await api.get("/admin/security");
      return res.data;
    },
  });
}
