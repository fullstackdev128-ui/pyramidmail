import { useState, useMemo, useCallback } from "react";
import initialThreads from "@/mock/threads.json";
import { getMockUser } from "@/lib/mock-session";
import { useComposeStore } from "@/store/useComposeStore";
import type { Thread, ThreadAttachment, ThreadCategory } from "@/types/threads";

export type Attachment = ThreadAttachment;
export type Email = Thread;

export type Category = ThreadCategory;

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>(initialThreads as Email[]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>("inbox");
  const user = getMockUser();
  const compose = useComposeStore();

  const filteredEmails = useMemo(() => {
    if (currentFolder === "starred") return emails.filter((e) => e.isStarred);
    if (currentFolder === "importants") return emails.filter((e) => e.isImportant);
    if (currentFolder === "all-mails") return emails;
    return emails.filter((e) => e.folder === currentFolder);
  }, [emails, currentFolder]);

  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId) || null,
    [emails, selectedEmailId]
  );

  const selectEmail = useCallback((id: string) => {
    setSelectedEmailId(id);
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isRead: true } : e)));
  }, []);

  const toggleStar = useCallback((id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e)));
  }, []);

  const toggleImportant = useCallback((id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isImportant: !e.isImportant } : e)));
  }, []);

  const markAsRead = useCallback((id: string, isRead: boolean) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, isRead } : e)));
  }, []);

  const moveToBin = useCallback(
    (id: string) => {
      setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, folder: "bin" } : e)));
      if (selectedEmailId === id) setSelectedEmailId(null);
    },
    [selectedEmailId]
  );

  const restoreFromBin = useCallback((id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, folder: "inbox" } : e)));
  }, []);

  const restoreFromSpam = useCallback((id: string) => {
    setEmails((prev) => prev.map((e) => (e.id === id ? { ...e, folder: "inbox" } : e)));
  }, []);

  const deletePermanently = useCallback(
    (id: string) => {
      setEmails((prev) => prev.filter((e) => e.id !== id));
      if (selectedEmailId === id) setSelectedEmailId(null);
    },
    [selectedEmailId]
  );

  const emptyBin = useCallback(() => {
    setEmails((prev) => prev.filter((e) => e.folder !== "bin"));
    setSelectedEmailId(null);
  }, []);

  const emptySpam = useCallback(() => {
    setEmails((prev) => prev.filter((e) => e.folder !== "spam"));
    setSelectedEmailId(null);
  }, []);

  const sendEmail = useCallback(
    (draft: { to: string[]; subject: string; body: string }) => {
      const newEmail: Email = {
        id: `th_${Date.now()}`,
        from: {
          name: user?.displayName || "Me",
          email: user?.email || "me@pyramidmail.cm",
          avatar: null,
        },
        subject: draft.subject || "(No Subject)",
        preview: draft.body.replace(/<[^>]*>/g, "").slice(0, 100),
        body: draft.body,
        date: new Date().toISOString(),
        isRead: true,
        isStarred: false,
        isImportant: false,
        folder: "sent",
        hasAttachment: false,
        category: "principale",
      };

      setEmails((prev) => [newEmail, ...prev]);
      return { success: true };
    },
    [user]
  );

  const openDraftInCompose = useCallback(
    (thread: Email) => {
      compose.open({
        to: [thread.from.email],
        subject: thread.subject,
        body: thread.body,
      });
    },
    [compose]
  );

  const filterByCategory = useCallback(
    (category: ThreadCategory) => {
      return emails.filter((e) => e.folder === "inbox" && e.category === category);
    },
    [emails]
  );

  const getCategoryCount = useCallback(
    (category: ThreadCategory) => {
      return emails.filter((e) => e.folder === "inbox" && e.category === category && !e.isRead)
        .length;
    },
    [emails]
  );

  const counts = useMemo(() => {
    return {
      inbox: emails.filter((e) => e.folder === "inbox" && !e.isRead).length,
      all: emails.length,
      starred: emails.filter((e) => e.isStarred).length,
      importants: emails.filter((e) => e.isImportant).length,
      sent: emails.filter((e) => e.folder === "sent").length,
      drafts: emails.filter((e) => e.folder === "drafts").length,
      bin: emails.filter((e) => e.folder === "bin").length,
      spam: emails.filter((e) => e.folder === "spam" && !e.isRead).length,
    };
  }, [emails]);

  return {
    emails: filteredEmails,
    selectedEmail,
    selectEmail,
    toggleStar,
    toggleImportant,
    markAsRead,
    moveToBin,
    restoreFromBin,
    restoreFromSpam,
    deletePermanently,
    emptyBin,
    emptySpam,
    sendEmail,
    openDraftInCompose,
    filterByCategory,
    getCategoryCount,
    currentFolder,
    setCurrentFolder,
    counts,
    allEmails: emails,
  };
}
