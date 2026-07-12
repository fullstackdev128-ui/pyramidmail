import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "./useAuth";

export type PlanType = "free" | "premium";

export function usePlan() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<{ plan: PlanType }>({
    queryKey: ["user", "plan"],
    queryFn: async () => {
      const res = await api.get("/user/plan");
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const currentPlan = data?.plan || (user?.plan as PlanType) || "free";

  return {
    plan: currentPlan,
    isPremium: currentPlan === "premium",
    isLoading,
  };
}
