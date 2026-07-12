import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ConnectionEntry, FilterStatus } from "@/hooks/useSecurity";

interface ConnectionHistoryTableProps {
  history: ConnectionEntry[];
}

const ITEMS_PER_PAGE = 10;

export function ConnectionHistoryTable({ history }: ConnectionHistoryTableProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredHistory = useMemo(() => {
    if (filter === "all") return history;
    return history.filter((entry) => entry.status === filter);
  }, [history, filter]);

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Succès
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Échec
          </Badge>
        );
      case "suspicious":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Suspecte
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex space-x-2">
        {(["all", "success", "failed", "suspicious"] as FilterStatus[]).map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
            className={cn(
              "text-xs",
              filter === status
                ? "bg-[#0087CA] text-white hover:bg-[#006fa8]"
                : "border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
            )}
          >
            {status === "all"
              ? "Toutes"
              : status === "success"
                ? "Succès"
                : status === "failed"
                  ? "Échecs"
                  : "Suspectes"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#DFE5E7] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#EDF3F6]">
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  IP
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  Localisation
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  Appareil
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  Date/Heure
                </th>
                <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedHistory.map((entry, index) => {
                const date = new Date(entry.date);
                return (
                  <tr
                    key={entry.id}
                    className={cn(
                      "border-b border-slate-50 last:border-none transition-colors hover:bg-[#EDF3F6]/50",
                      index % 2 === 1 && "bg-[#F8FAFB]"
                    )}
                  >
                    <td className="py-3 px-4 text-[#162A42]">{entry.user}</td>
                    <td className="py-3 px-4 text-[#091D35]">{entry.ip}</td>
                    <td className="py-3 px-4 text-[#091D35]">{entry.location}</td>
                    <td className="py-3 px-4 text-[#091D35]">{entry.device}</td>
                    <td className="py-3 px-4 text-[#091D35]">
                      {date.toLocaleDateString("fr-FR")}{" "}
                      {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(entry.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-[#091D35]">
            Page {currentPage} sur {totalPages}
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-xs border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="text-xs border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
