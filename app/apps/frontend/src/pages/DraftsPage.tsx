import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { Pencil, Trash2, ChevronLeft, Inbox as InboxIcon } from "lucide-react";
import { useThreads, useThread, useMove, useMarkRead } from "@/hooks/useThreads";
import { useComposeStore } from "@/store/useComposeStore";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { useMailView } from "@/hooks/useMailView";

export function DraftsPage() {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );

  const { data: threads = [], isLoading, isError, refetch, isFetching } = useThreads("DRAFT");
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");
  const moveMutation = useMove();
  const markReadMutation = useMarkRead();
  const compose = useComposeStore();

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
        from: "",
        to: [],
      };
    }
    const last = threadDetail.emails[threadDetail.emails.length - 1];
    return {
      id: threadDetail.id,
      subject: threadDetail.subject,
      body: last.bodyHtml || last.bodyText || "",
      from: last.from,
      to: last.to,
    };
  }, [selectedThreadId, threadDetail]);

  return (
    <div className="flex h-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
        <EmailListPanel
          threads={threads}
          selectedThreadId={selectedThreadId}
          folderFromPath="DRAFT"
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          refetch={refetch}
          onThreadSelect={selectThread}
          emptyStateTitle="Aucun brouillon sauvegardé"
          emptyStateSubtitle="Vos brouillons apparaîtront ici."
          emptyStateIcon={<InboxIcon className="mx-auto h-10 w-10 text-slate-400" />}
        />
      </div>

      <div className={mailReadColumnClass(isMobileOrTablet && view === "list")}>
        {!selectedEmail ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="w-48 h-48 bg-[#EDF3F6] rounded-3xl relative flex items-center justify-center">
              <Pencil size={64} className="text-[#0087CA]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#162A42]">Brouillons</h2>
              <p className="text-slate-500 max-w-sm">
                Sélectionnez un brouillon pour continuer la rédaction.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                {isMobileOrTablet && (
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={handleBack}>
                    <ChevronLeft size={18} />
                  </Button>
                )}
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
            </div>

            {isLoadingDetail ? (
              <div className="p-8 space-y-4 flex-1">
                <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
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
                  <div className="pt-6 border-t border-slate-100">
                    <Button
                      onClick={() => {
                        compose.openWithDraft(threadDetail);
                      }}
                      className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 h-11 px-6 font-semibold shadow-lg shadow-[#0087CA]/20"
                    >
                      <Pencil size={18} /> Modifier
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
