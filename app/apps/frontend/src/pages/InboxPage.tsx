import { useState, useMemo, useEffect } from "react";
import {
  RefreshCw,
  ChevronRight,
  Reply,
  Star,
  Archive,
  Trash2,
  ShieldAlert,
  Mail,
  ChevronLeft,
  MoreVertical,
  Plus,
  Inbox as InboxIcon,
  AlertCircle,
  Paperclip,
} from "lucide-react";
import emptyInboxImage from "@/assets/inbox.png";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useComposeStore } from "@/store/useComposeStore";
import {
  useThreads,
  useThread,
  useMarkRead,
  useStar,
  useMarkImportant,
  useMove,
  useDeleteThread,
} from "@/hooks/useThreads";
import { cn, getUserInitials, getUserColor } from "@/lib/utils";
import { mailListColumnClass, mailReadColumnClass } from "@/lib/mail-layout";
import { useLocation } from "react-router-dom";
import { AttachmentCard, Attachment } from "@/components/email/AttachmentCard";
import { AttachmentPreview } from "@/components/email/AttachmentPreview";
import { mapApiAttachment } from "@/lib/attachments";
import { EmailListPanel } from "@/components/email/EmailListPanel";
import { EmailReadPanel } from "@/components/email/EmailReadPanel";
import { useMailView } from "@/hooks/useMailView";
import { EmailListSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { ThreadCategory } from "@/types/threads";

const isPromotionalThread = (thread: any): boolean => {
  const from = thread.lastFrom?.toLowerCase() || "";

  // E-mails internes toujours en Principale
  if (from.includes("@pymail.cm")) return false;

  const subject = thread.subject?.toLowerCase() || "";
  const snippet = thread.snippet?.toLowerCase() || "";

  const promoKeywords = [
    "promo",
    "soldes",
    "offre",
    "newsletter",
    "discount",
    "réduction",
    "sales",
    "publicité",
  ];
  const promoSenders = ["no-reply", "noreply", "newsletter", "marketing", "info", "offers"];

  const matchesKeyword = promoKeywords.some((kw) => subject.includes(kw) || snippet.includes(kw));
  const matchesSender = promoSenders.some((s) => from.includes(s));

  return matchesKeyword || matchesSender;
};

export function InboxPage() {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const { open: openCompose } = useComposeStore();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const { view, openThread, closeThread, isDesktop, isMobileOrTablet } = useMailView(
    selectedThreadId,
    setSelectedThreadId
  );

  // Determine folder from URL
  const folderFromPath = useMemo(() => {
    const path = location.pathname.replace("/", "");
    const mapping: Record<string, string> = {
      inbox: "INBOX",
      sent: "SENT",
      drafts: "DRAFT",
      bin: "TRASH",
      spam: "SPAM",
      starred: "STARRED",
      importants: "IMPORTANT",
      "all-mails": "ALL",
    };
    return mapping[path] ?? "INBOX";
  }, [location.pathname]);

  const isInbox = location.pathname === "/inbox";

  // ── API hooks ───────────────────────────────────────────────────
  const {
    data: threads = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useThreads(folderFromPath as any);
  const { data: threadDetail, isLoading: isLoadingDetail } = useThread(selectedThreadId || "");

  const markReadMutation = useMarkRead();
  const starMutation = useStar();
  const markImportantMutation = useMarkImportant();
  const moveMutation = useMove();
  const deleteMutation = useDeleteThread();

  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [activeCategory, setActiveCategory] = useState<ThreadCategory>("principale");

  // Select thread and mark as read
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

    const lastEmail = threadDetail.emails[threadDetail.emails.length - 1];
    return {
      id: threadDetail.id,
      subject: threadDetail.subject,
      body: lastEmail.bodyHtml || lastEmail.bodyText || "",
      from: { name: lastEmail.from, email: lastEmail.from },
      date: lastEmail.sentAt,
      isRead: lastEmail.isRead,
      isStarred: lastEmail.isStarred,
      isImportant: lastEmail.isImportant,
      attachments: lastEmail.attachments as any,
    };
  }, [selectedThreadId, threadDetail]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Dynamically filter threads for the Inbox page
  const filteredThreads = useMemo(() => {
    if (!isInbox) return threads;
    return threads.filter((t) => {
      const isPromo = isPromotionalThread(t);
      return activeCategory === "promotions" ? isPromo : !isPromo;
    });
  }, [threads, activeCategory, isInbox]);

  const categoryCounts = useMemo(() => {
    const promoCount = threads.filter(isPromotionalThread).length;
    return {
      principale: threads.length - promoCount,
      promotions: promoCount,
    };
  }, [threads]);

  return (
    <div className="flex h-full bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100">
      <div className={mailListColumnClass(isMobileOrTablet && view === "read")}>
        <EmailListPanel
          threads={filteredThreads}
          selectedThreadId={selectedThreadId}
          folderFromPath={folderFromPath}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          refetch={refetch}
          onThreadSelect={selectThread}
          onStarToggle={(thread) => starMutation.mutate(thread.id)}
          onReply={(thread) => {
            const subject = thread.subject?.toLowerCase().startsWith("re:")
              ? thread.subject
              : `Re: ${thread.subject}`;
            openCompose({ to: [thread.lastFrom || ""], subject, body: "" });
            if (!isDesktop) {
              openThread(thread.id);
            }
          }}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          categoryCounts={categoryCounts}
          showTabs={isInbox}
          emptyStateTitle="Votre boîte est vide"
          emptyStateSubtitle="C'est le moment idéal pour se détendre."
          emptyStateIcon={
            <img
              src={emptyInboxImage}
              alt="Empty inbox"
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
            folderFromPath={folderFromPath}
            onBack={isMobileOrTablet ? handleBack : undefined}
            onArchive={(id) => {
              moveMutation.mutate({ id, folder: "ARCHIVE" });
              if (isMobileOrTablet) handleBack();
            }}
            onDelete={(id) => {
              if (folderFromPath === "TRASH") {
                deleteMutation.mutate(id);
              } else {
                moveMutation.mutate({ id, folder: "TRASH" });
              }
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
          <div className="flex-1 p-4 md:p-12 overflow-y-auto hidden lg:block">
            <div className="w-full space-y-12">
              <div className="space-y-4">
                <h1 className="text-3xl font-semibold text-[#162A42]">
                  Hello {user?.displayName ?? user?.email?.split("@")[0] ?? "User"}
                </h1>
                <p className="text-[#091D35] leading-relaxed max-w-2xl opacity-70">
                  Pyramid Mail a été développé dans un souci de performance. Optimisez votre
                  expérience grâce à des fonctionnalités comme l&apos;économiseur d&apos;énergie et
                  l&apos;économiseur de mémoire.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Fetched messages", count: threads.length },
                  {
                    label: "Unread messages",
                    count: threads.filter((e) => e.unreadCount > 0).length,
                  },
                  { label: "Starred messages", count: threads.filter((e) => e.isStarred).length },
                ].map((stat, i) => (
                  <div key={i} className="bg-[#EDF3F6] p-8 rounded-xl space-y-2">
                    <div className="text-4xl font-semibold text-[#0087CA]">{stat.count}</div>
                    <div className="text-sm font-semibold text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              <Separator className="bg-[#DFE5E7] border-dashed border-b" />

              <div className="flex items-center justify-between gap-12 pt-4">
                <div className="space-y-6 flex-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Spread the message</h2>
                  <p className="text-[#091D35] opacity-70 leading-relaxed">
                    Pyramid Mail a été développé dans un souci de performance. Optimisez votre
                    expérience grâce à des fonctionnalités comme l&apos;économiseur d&apos;énergie
                    et l&apos;économiseur de mémoire.
                  </p>
                  <Button
                    onClick={() => openCompose()}
                    className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-md gap-2 h-11 px-6 font-semibold shadow-lg shadow-[#0087CA]/20"
                  >
                    <Plus size={18} />
                    {t("inbox.newMessage")}
                  </Button>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <img
                    src={emptyInboxImage}
                    alt="Illustration"
                    className="w-64 h-auto object-contain"
                  />
                </div>
              </div>
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
