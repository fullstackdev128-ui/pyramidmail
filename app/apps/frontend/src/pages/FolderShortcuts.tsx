import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { Star, BookmarkCheck, ChevronLeft } from "lucide-react";
import {
  useThreads,
  useThread,
  useStar,
  useMarkImportant,
  useMove,
  useMarkRead,
} from "@/hooks/useThreads";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { EmailReadPanel } from "@/components/email/EmailReadPanel";
import { useMailView } from "@/hooks/useMailView";
import { useComposeStore } from "@/store/useComposeStore";
import { AttachmentPreview } from "@/components/email/AttachmentPreview";
import { Attachment } from "@/components/email/AttachmentCard";
import favoriImage from "@/assets/favori.png";

function FilteredPage({
  folder,
  title,
  icon: Icon,
  emptyImageSrc,
  emptyText,
  emptySubtitle,
}: {
  folder: string;
  title: string;
  icon: any;
  emptyImageSrc?: string;
  emptyText: string;
  emptySubtitle?: string;
}) {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );

  const { data: threads = [], isLoading, isError, refetch, isFetching } = useThreads(folder as any);
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");
  const starMutation = useStar();
  const importantMutation = useMarkImportant();
  const moveMutation = useMove();
  const markReadMutation = useMarkRead();
  const compose = useComposeStore();

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);

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
        from: { name: "", email: "" },
        date: new Date().toISOString(),
        isStarred: false,
        isImportant: false,
        attachments: [],
      };
    }
    const last = threadDetail.emails[threadDetail.emails.length - 1];
    return {
      id: threadDetail.id,
      subject: threadDetail.subject,
      body: last.bodyHtml || last.bodyText || "",
      from: { name: last.from, email: last.from },
      date: last.sentAt,
      isStarred: last.isStarred,
      isImportant: last.isImportant,
      attachments: last.attachments as any,
    };
  }, [selectedThreadId, threadDetail]);

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
      <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
        <EmailListPanel
          threads={threads}
          selectedThreadId={selectedThreadId}
          folderFromPath={folder}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          refetch={refetch}
          onThreadSelect={selectThread}
          onStarToggle={(thread) => starMutation.mutate(thread.id)}
          emptyStateTitle={emptyText}
          emptyStateSubtitle={emptySubtitle}
          emptyStateIcon={
            emptyImageSrc ? (
              <img
                src={emptyImageSrc}
                alt={emptyText}
                className="mx-auto h-24 w-auto object-contain"
              />
            ) : (
              <Icon className="mx-auto h-10 w-10 text-slate-400" />
            )
          }
        />
      </div>

      <div className={mailReadColumnClass(isMobileOrTablet && view === "list")}>
        {selectedThreadId ? (
          <EmailReadPanel
            selectedEmail={selectedEmail}
            isLoadingDetail={isLoadingDetail}
            isFetching={isFetching}
            refetch={refetch}
            folderFromPath={folder}
            onBack={isMobileOrTablet ? handleBack : undefined}
            onArchive={(id) => {
              moveMutation.mutate({ id, folder: "ARCHIVE" });
              if (isMobileOrTablet) handleBack();
            }}
            onDelete={(id) => {
              moveMutation.mutate({ id, folder: "TRASH" });
              if (isMobileOrTablet) handleBack();
            }}
            onSpam={(id) => {
              moveMutation.mutate({ id, folder: "SPAM" });
              if (isMobileOrTablet) handleBack();
            }}
            onToggleRead={(id, isRead) => markReadMutation.mutate({ id, isRead: !isRead })}
            onToggleStar={(id) => starMutation.mutate(id)}
            onToggleImportant={(id) => importantMutation.mutate(id)}
            onReply={(email) => {
              const subject = email.subject.toLowerCase().startsWith("re:")
                ? email.subject
                : `Re: ${email.subject}`;
              compose.open({
                to: [email.from.email],
                subject,
                body: "",
              });
            }}
            onPreviewAttachment={setPreviewAttachment}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4 text-slate-200">
            {emptyImageSrc ? (
              <img src={emptyImageSrc} alt={title} className="w-24 h-auto object-contain" />
            ) : (
              <Icon size={64} className="text-[#0087CA]" />
            )}
            <h2 className="text-2xl font-semibold text-[#162A42]">{title}</h2>
          </div>
        )}
      </div>

      {previewAttachment && (
        <AttachmentPreview
          attachment={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}
    </div>
  );
}

export function StarredPage() {
  return (
    <FilteredPage
      folder="STARRED"
      title="Suivis"
      icon={Star}
      emptyImageSrc={favoriImage}
      emptyText="Aucun email suivi"
      emptySubtitle="Étoilez des emails pour les retrouver rapidement"
    />
  );
}

export function ImportantsPage() {
  return (
    <FilteredPage
      folder="IMPORTANT"
      title="Importants"
      icon={BookmarkCheck}
      emptyText="Aucun email important"
      emptySubtitle="Marquez des emails comme importants pour les retrouver ici"
    />
  );
}
