import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { emailService } from "@/services/email.service";
import { ThreadSummary } from "./useThreads";

export interface SearchFilters {
  from?: string;
  to?: string;
  subject?: string;
  folder?: string | null;
}

export function useSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const filters: SearchFilters = {
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    subject: searchParams.get("subject") || undefined,
    folder: searchParams.get("folder"),
  };

  const hasAttachments = searchParams.get("hasAttachments") === "true";

  const {
    data: results = [],
    isLoading: isSearching,
    isError,
    error,
  } = useQuery<ThreadSummary[]>({
    queryKey: ["search", query, filters, hasAttachments],
    queryFn: async () => {
      if (
        !query &&
        !Object.values(filters).some((v) => v !== undefined && v !== null) &&
        !hasAttachments
      ) {
        return [];
      }
      const res = await emailService.search({
        q: query || undefined,
        from: filters.from,
        to: filters.to,
        subject: filters.subject,
        folder: filters.folder || undefined,
        hasAttachments: hasAttachments || undefined,
      });

      return res.data;
    },
    enabled:
      query.length > 0 ||
      Object.values(filters).some((v) => v !== undefined && v !== null && v !== "") ||
      hasAttachments,
    staleTime: 10000,
  });

  return {
    query,
    filters,
    results,
    isSearching,
    isError,
    error,
  };
}
