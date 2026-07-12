import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InboxTabs } from "@/components/email/InboxTabs";
import { EmailListItem } from "@/components/email/EmailListItem";
import { cn } from "@/lib/utils";
import type { ThreadCategory } from "@/types/threads";

interface EmailListPanelProps {
  threads: any[];
  selectedThreadId: string | null;
  folderFromPath: string;
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => void;
  onThreadSelect: (id: string) => void;
  onStarToggle?: (thread: any) => void;
  onReply?: (thread: any) => void;
  activeCategory?: ThreadCategory;
  onCategoryChange?: (category: ThreadCategory) => void;
  categoryCounts?: Record<ThreadCategory, number>;
  showTabs?: boolean;
  emptyStateTitle?: string;
  emptyStateSubtitle?: string;
  emptyStateIcon?: ReactNode;
}

function getDisplayParticipant(thread: any, folderFromPath: string): string {
  if (
    (folderFromPath === "SENT" || folderFromPath === "DRAFT") &&
    thread.lastTo &&
    thread.lastTo.length > 0
  ) {
    return thread.lastTo.join(", ");
  }
  return thread.lastFrom || "Unknown";
}

export function EmailListPanel({
  threads,
  selectedThreadId,
  folderFromPath,
  isLoading,
  isError,
  isFetching,
  refetch,
  onThreadSelect,
  onStarToggle,
  activeCategory,
  onCategoryChange,
  categoryCounts,
  showTabs = false,
  emptyStateTitle = "Votre boîte est vide",
  emptyStateSubtitle = "C'est le moment idéal pour se détendre.",
  emptyStateIcon,
}: EmailListPanelProps) {
  return (
    <div className="w-full border-r border-slate-100 flex flex-col bg-white h-full overflow-hidden">
      <div className="p-2 lg:p-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={refetch}>
            <span className={cn("text-slate-500", isFetching && "animate-spin")}>⟳</span>
          </Button>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          <span>{threads.length} messages</span>
        </div>
      </div>

      {showTabs && activeCategory && onCategoryChange && categoryCounts ? (
        <InboxTabs
          activeCategory={activeCategory}
          onCategoryChange={onCategoryChange}
          counts={categoryCounts}
        />
      ) : null}

      <ScrollArea className="flex-1 min-h-0">
        {isLoading ? (
          <div className="p-6">Chargement...</div>
        ) : isError ? (
          <div className="p-6">Erreur de chargement. Réessayez.</div>
        ) : threads.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            {emptyStateIcon}
            <h3 className="text-lg font-semibold text-[#162A42] mt-4">{emptyStateTitle}</h3>
            <p className="mt-2 text-sm">{emptyStateSubtitle}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {threads.map((thread) => (
              <div key={thread.id} className="group">
                <EmailListItem
                  thread={thread}
                  displayParticipant={getDisplayParticipant(thread, folderFromPath)}
                  isSelected={selectedThreadId === thread.id}
                  onSelect={() => onThreadSelect(thread.id)}
                  onStarToggle={onStarToggle ? () => onStarToggle(thread) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
