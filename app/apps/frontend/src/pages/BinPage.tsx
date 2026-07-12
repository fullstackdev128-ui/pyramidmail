import { useState, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { Trash2, RotateCcw, Trash, ChevronLeft, Inbox as InboxIcon } from "lucide-react";
import {
  useThreads,
  useThread,
  useMove,
  useDeleteThread,
  useEmptyFolder,
  useMarkRead,
} from "@/hooks/useThreads";
import { useToast } from "@/components/ui/toast";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { useMailView } from "@/hooks/useMailView";
import emptyIconImage from "@/assets/trash.png";

export function BinPage() {
  const { showToast } = useToast();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );

  const { data: threads = [], isLoading, isError, refetch, isFetching } = useThreads("TRASH");
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");
  const moveMutation = useMove();
  const deleteThreadMutation = useDeleteThread();
  const emptyFolderMutation = useEmptyFolder();
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
      };
    }
    const last = threadDetail.emails[threadDetail.emails.length - 1];
    return {
      id: threadDetail.id,
      subject: threadDetail.subject,
      body: last.bodyHtml || last.bodyText || "",
    };
  }, [selectedThreadId, threadDetail]);

  const handleEmptyBin = async () => {
    try {
      await emptyFolderMutation.mutateAsync("TRASH");
      handleBack();
      showToast("Corbeille vidée", "success");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setShowEmptyConfirm(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await moveMutation.mutateAsync({ id, folder: "INBOX" });
      handleBack();
      showToast("Email restauré", "success");
    } catch {
      showToast("Erreur lors de la restauration", "error");
    }
  };

  const handleDeletePermanently = async (id: string) => {
    try {
      await deleteThreadMutation.mutateAsync(id);
      handleBack();
      showToast("Email supprimé définitivement", "success");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 flex-col">
      <ConfirmDialog
        open={showEmptyConfirm}
        title="Vider la corbeille ?"
        description="Tous les emails seront supprimés définitivement. Cette action est irréversible."
        confirmLabel="Vider la corbeille"
        variant="danger"
        onConfirm={handleEmptyBin}
        onCancel={() => setShowEmptyConfirm(false)}
      />
      <ConfirmDialog
        open={!!deleteConfirmId}
        title="Supprimer définitivement ?"
        description="Cet email sera effacé de façon permanente et ne pourra pas être restauré."
        confirmLabel="Supprimer"
        variant="danger"
        onConfirm={() => deleteConfirmId && handleDeletePermanently(deleteConfirmId)}
        onCancel={() => setDeleteConfirmId(null)}
      />

      <div className="p-3 bg-[#DFE5E7] text-[#091D35] text-xs font-medium text-center flex items-center justify-center gap-4 shrink-0">
        <span>Les emails dans la corbeille sont supprimés définitivement après 30 jours</span>
        {threads.length > 0 && (
          <Button
            onClick={() => setShowEmptyConfirm(true)}
            variant="ghost"
            size="sm"
            className="h-7 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold px-3"
          >
            Vider la corbeille
          </Button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
          <EmailListPanel
            threads={threads}
            selectedThreadId={selectedThreadId}
            folderFromPath="TRASH"
            isLoading={isLoading}
            isError={isError}
            isFetching={isFetching}
            refetch={refetch}
            onThreadSelect={selectThread}
            emptyStateTitle="La corbeille est vide"
            emptyStateIcon={
              <img
                src={emptyIconImage}
                alt="La corbeille est vide"
                className="mx-auto h-24 w-auto object-contain"
              />
            }
          />
        </div>

        <div className={mailReadColumnClass(isMobileOrTablet && view === "list")}>
          {!selectedEmail ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 text-slate-200">
              <img src={emptyIconImage} alt="Corbeille" className="w-48 h-auto object-contain" />
              <h2 className="text-2xl font-semibold text-[#162A42]">Corbeille</h2>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 shrink-0">
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
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(selectedEmail.id)}
                  className="rounded-xl gap-2 border-slate-200 text-[#091D35] font-semibold h-9"
                >
                  <RotateCcw size={16} /> Restaurer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmId(selectedEmail.id)}
                  className="rounded-xl gap-2 border-slate-200 text-red-600 hover:bg-red-50 font-semibold h-9"
                >
                  <Trash size={16} /> Supprimer définitivement
                </Button>
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
                  <div className="w-full px-4 space-y-6">
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
    </div>
  );
}
