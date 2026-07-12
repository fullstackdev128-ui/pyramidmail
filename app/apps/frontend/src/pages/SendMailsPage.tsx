import { useState, useMemo } from "react";
import { Inbox as InboxIcon } from "lucide-react";
import {
  useThreads,
  useThread,
  useStar,
  useMove,
  useMarkRead,
  useMarkImportant,
} from "@/hooks/useThreads";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { EmailReadPanel } from "@/components/email/EmailReadPanel";
import { useMailView } from "@/hooks/useMailView";
import { useComposeStore } from "@/store/useComposeStore";
import { AttachmentPreview } from "@/components/email/AttachmentPreview";
import { Attachment } from "@/components/email/AttachmentCard";
import emptyIconImage from "@/assets/envoi.png";

export function SendMailsPage() {
  const { open: openCompose } = useComposeStore();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );
  const { data: threads = [], isLoading, isError, refetch, isFetching } = useThreads("SENT");
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");

  const starMutation = useStar();
  const moveMutation = useMove();
  const markReadMutation = useMarkRead();
  const markImportantMutation = useMarkImportant();

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
        isRead: true,
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
      isRead: last.isRead,
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
          folderFromPath="SENT"
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          refetch={refetch}
          onThreadSelect={selectThread}
          onStarToggle={(thread) => starMutation.mutate(thread.id)}
          emptyStateTitle="Aucun e-mail envoyé"
          emptyStateSubtitle="Les e-mails que vous envoyez apparaîtront ici."
          emptyStateIcon={
            <img
              src={emptyIconImage}
              alt="Aucun e-mail envoyé"
              className="mx-auto h-24 w-auto object-contain"
            />
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
            folderFromPath="SENT"
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
            onToggleImportant={(id) => markImportantMutation.mutate(id)}
            onReply={(email) => {
              const subject = email.subject.toLowerCase().startsWith("re:")
                ? email.subject
                : `Re: ${email.subject}`;
              openCompose({
                to: [email.from.email],
                subject,
                body: "",
              });
            }}
            onPreviewAttachment={setPreviewAttachment}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="w-48 h-48 relative flex items-center justify-center">
              <img
                src={emptyIconImage}
                alt="Messages envoyés"
                className="w-48 h-auto object-contain"
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#162A42]">Messages envoyés</h2>
              <p className="text-slate-500 max-w-sm">
                Sélectionnez un e-mail dans la liste pour consulter son contenu.
              </p>
            </div>
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
