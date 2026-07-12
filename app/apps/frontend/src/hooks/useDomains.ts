import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export type CustomDomain = {
  id: string;
  domainName: string;
  isVerified: boolean;
  verificationToken: string | null;
  expectedTxtRecord: string | null;
  verificationError: string | null;
  lastCheckedAt: string | null;
  spfRecord: string | null;
  dmarcRecord: string | null;
};

export function useDomains() {
  const qc = useQueryClient();

  const query = useQuery<CustomDomain[]>({
    queryKey: ["domains"],
    queryFn: async () => {
      const res = await api.get("/domains");
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (domainName: string) => {
      const res = await api.post("/domains", { domainName });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/domains/${id}/verify`);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["domains"] });
    },
  });

  return {
    domains: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    createDomain: createMutation.mutateAsync,
    verifyDomain: verifyMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isVerifying: verifyMutation.isPending,
  };
}
