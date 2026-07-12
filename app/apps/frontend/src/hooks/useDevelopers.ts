import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { developerService } from "@/services/developer.service";

export function useDevelopers() {
  const queryClient = useQueryClient();

  const keysQuery = useQuery({
    queryKey: ["api-keys"],
    queryFn: developerService.getApiKeys,
  });

  const statsQuery = useQuery({
    queryKey: ["developer-stats"],
    queryFn: developerService.getDeveloperStats,
  });

  const createKeyMutation = useMutation({
    mutationFn: developerService.createApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["developer-stats"] });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: developerService.deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      queryClient.invalidateQueries({ queryKey: ["developer-stats"] });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: developerService.revokeApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  return {
    apiKeys: keysQuery.data || [],
    stats: statsQuery.data,
    isLoading: keysQuery.isLoading || statsQuery.isLoading,
    createApiKey: createKeyMutation.mutateAsync,
    deleteApiKey: deleteKeyMutation.mutateAsync,
    revokeApiKey: revokeKeyMutation.mutateAsync,
  };
}
