import { useState, useMemo } from "react";
import { useSearch } from "@/hooks/useSearch";
import { useThread, useMove, useMarkRead } from "@/hooks/useThreads";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getUserInitials, getUserColor } from "@/lib/utils";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { Search, Trash2, Archive, ChevronLeft } from "lucide-react";
import { EmailListSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useMailView } from "@/hooks/useMailView";

export function SearchResultsPage() {
  const { query, results, isSearching, isError } = useSearch();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");
  const moveMutation = useMove();
  const markReadMutation = useMarkRead();

  const selectThread = (id: string) => {
    markReadMutation.mutate({ id, isRead: true });
    openThread(id);
  };

  const handleBack = () => {
    closeThread();
  };

  const selectedEmail = useMemo(() => {
    if (!selectedThreadId) return null;
    if (!threadDetail?.emails?.length) {
      return {
        id: selectedThreadId,
        subject: "",
        body: "",
        folder: "INBOX",
      };
    }
    const last = threadDetail.emails[threadDetail.emails.length - 1];
    return {
      id: threadDetail.id,
      subject: threadDetail.subject,
      body: last.bodyHtml || last.bodyText || "",
      folder: last.folder,
    };
  }, [selectedThreadId, threadDetail]);

  const getFolderBadge = (folder: string) => {
    const badges: Record<string, string> = {
      INBOX: "bg-[#0087CA]",
      SENT: "bg-[#10B981]",
      DRAFT: "bg-[#6B7280]",
      TRASH: "bg-[#F59E0B]",
      SPAM: "bg-[#EF4444]",
    };
    const color = badges[folder] || "bg-[#6B7280]";
    return (
      <Badge className={cn("text-[8px] h-3 px-1 border-none text-white", color)}>{folder}</Badge>
    );
  };

  return (
    <div className="flex h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
        <div className="p-4 border-b border-slate-100">
          <h1 className="text-sm font-semibold text-[#162A42] truncate">Résultats pour '{query}'</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            {results.length} trouvés
          </p>
        </div>
        <ScrollArea className="flex-1">
          {isSearching ? (
            <EmailListSkeleton />
          ) : isError ? (
            <ErrorState />
          ) : results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              subtitle={`Aucun message trouvé pour "${query}"`}
            />
          ) : (
            <div className="divide-y divide-slate-50">
              {results.map((thread) => (
                <div
                  key={thread.id}
                  onClick={() => selectThread(thread.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-colors relative group",
                    selectedThreadId === thread.id ? "bg-[#DFE5E7]" : "hover:bg-[#EDF3F6]"
                  )}
                >
                  <div className="flex gap-3">
                    <Avatar className={cn("h-10 w-10 shrink-0", getUserColor(thread.lastFrom))}>
                      <AvatarFallback className="bg-transparent font-semibold">
                        {getUserInitials(thread.lastFrom)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-sm truncate font-semibold text-[#162A42]">
                          {thread.lastFrom || "Unknown"}
                        </span>
                      </div>
                      <div className="text-xs truncate text-[#091D35] font-medium">
                        {thread.subject}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className={mailReadColumnClass(isMobileOrTablet && view === "list")}>
        {!selectedEmail ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 text-slate-200">
            <Search size={64} className="text-[#0087CA]" />
            <h2 className="text-2xl font-semibold text-[#162A42]">Sélectionnez un résultat</h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                {isMobileOrTablet && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-slate-500 mr-2"
                    onClick={handleBack}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-slate-500 hover:text-[#0087CA]"
                >
                  <Archive size={18} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-slate-500 hover:text-red-500"
                  onClick={() => {
                    moveMutation.mutate({ id: selectedEmail.id, folder: "TRASH" });
                    handleBack();
                  }}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
              {getFolderBadge(selectedEmail.folder)}
            </div>

            {isLoadingDetail ? (
              <div className="p-8 space-y-4 flex-1 animate-pulse">
                <div className="h-8 bg-slate-100 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-1/4" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-100 rounded" />
                  <div className="h-4 bg-slate-100 rounded" />
                </div>
              </div>
            ) : (
              <ScrollArea className="flex-1 p-8">
                <div className="w-full px-4 space-y-8">
                  <h2 className="text-2xl font-semibold text-[#162A42] leading-tight">
                    {selectedEmail.subject || "(Sans objet)"}
                  </h2>
                  <div
                    className="text-[#091D35] leading-relaxed prose prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
