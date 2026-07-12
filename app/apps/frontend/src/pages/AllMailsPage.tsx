import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { Mail, Trash2, Archive, ChevronLeft, Inbox as InboxIcon } from "lucide-react";
import { useThreads, useThread, useMove, useMarkRead } from "@/hooks/useThreads";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { useMailView } from "@/hooks/useMailView";
import emptyInboxImage from "@/assets/inbox.png";

export function AllMailsPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );

  const { data: threads = [], isLoading, isError, refetch, isFetching } = useThreads("ALL");
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
    if (!threadDetail || !threadDetail.emails?.length) {
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
    const badges: Record<string, { label: string; color: string }> = {
      INBOX: { label: "Inbox", color: "bg-[#0087CA]" },
      SENT: { label: "Sent", color: "bg-[#10B981]" },
      DRAFT: { label: "Draft", color: "bg-[#6B7280]" },
      TRASH: { label: "Bin", color: "bg-[#F59E0B]" },
      SPAM: { label: "Spam", color: "bg-[#EF4444]" },
    };
    const b = badges[folder] || { label: folder, color: "bg-[#6B7280]" };
    return (
      <Badge
        className={cn("text-[9px] uppercase font-semibold py-0 h-4 border-none text-white", b.color)}
      >
        {b.label}
      </Badge>
    );
  };

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
      <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
        <EmailListPanel
          threads={threads}
          selectedThreadId={selectedThreadId}
          folderFromPath="ALL"
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          refetch={refetch}
          onThreadSelect={selectThread}
          emptyStateTitle="Aucun message"
          emptyStateIcon={
            <img
              src={emptyInboxImage}
              alt="Aucun message"
              className="mx-auto h-24 w-auto object-contain"
            />
          }
        />
      </div>

      <div className={mailReadColumnClass(isMobileOrTablet && view === "list")}>
        {!selectedEmail ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 text-slate-200">
            <img
              src={emptyInboxImage}
              alt="Tous les messages"
              className="w-48 h-auto object-contain"
            />
            <h2 className="text-2xl font-semibold text-[#162A42]">Tous les messages</h2>
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
                  onClick={() => {
                    moveMutation.mutate({ id: selectedEmail.id, folder: "ARCHIVE" });
                    handleBack();
                  }}
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
