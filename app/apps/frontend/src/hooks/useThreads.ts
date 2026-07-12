import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { emailService } from "@/services/email.service";

// ── Types ──────────────────────────────────────────────────────────
export type ThreadSummary = {
  id: string;
  subject: string;
  snippet: string | null;
  lastMessageAt: string;
  lastFrom: string | null;
  lastTo: string[] | null;
  lastSentAt: string | null;
  unreadCount: number;
  isStarred?: boolean;
  isImportant?: boolean;
};

export type ThreadDetail = {
  id: string;
  subject: string;
  snippet: string | null;
  lastMessageAt: string;
  emails: ThreadEmail[];
};

export type ThreadEmail = {
  id: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  attachments: unknown;
  folder: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  sentAt: string;
};

export type MailFolder = "INBOX" | "SENT" | "DRAFT" | "TRASH" | "SPAM" | "ARCHIVE";

// ── Query keys ─────────────────────────────────────────────────────
export const threadKeys = {
  all: ["threads"] as const,
  lists: () => [...threadKeys.all, "list"] as const,
  list: (folder?: string, params?: any) => [...threadKeys.lists(), folder, params] as const,
  details: () => [...threadKeys.all, "detail"] as const,
  detail: (id: string) => [...threadKeys.details(), id] as const,
};

// ── Hook: list threads by folder ───────────────────────────────────
export function useThreads(folder?: MailFolder | "IMPORTANT" | "STARRED" | "ALL") {
  return useQuery<ThreadSummary[]>({
    queryKey: threadKeys.list(folder),
    queryFn: async () => {
      if (folder === "IMPORTANT") {
        const res = await emailService.getThreads({ endpoint: "/emails/important" });
        return res.data;
      }
      if (folder === "STARRED") {
        const res = await emailService.getThreads({ starred: true });
        return res.data;
      }
      if (folder === "ALL") {
        const res = await emailService.getThreads();
        return res.data;
      }
      const res = await emailService.getThreads({ folder: folder || undefined });
      return res.data;
    },
    staleTime: 30000,
  });
}

// ── Hook: get thread detail ────────────────────────────────────────
export function useThread(id: string) {
  return useQuery<ThreadDetail>({
    queryKey: threadKeys.detail(id),
    queryFn: async () => {
      const res = await emailService.getThread(id);
      return res.data;
    },
    enabled: !!id,
  });
}

// ── Hook: mark thread read/unread ──────────────────────────────────
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      threadId,
      isRead,
    }: {
      id?: string;
      threadId?: string;
      isRead: boolean;
    }) => {
      const targetId = id || threadId;
      if (!targetId) throw new Error("ID or threadId is required");
      await emailService.markRead(targetId, isRead);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: toggle star ──────────────────────────────────────────────
export function useStar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await emailService.star(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: toggle important ─────────────────────────────────────────
export function useMarkImportant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await emailService.markImportant(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: mark as spam ─────────────────────────────────────────────
export function useSpam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await emailService.spam(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: move thread to folder ────────────────────────────────────
export function useMove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, folder }: { id: string; folder: string }) => {
      await emailService.move(id, folder);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: delete thread permanently ────────────────────────────────
export function useDeleteThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await emailService.delete(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: empty folder ─────────────────────────────────────────────
export function useEmptyFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (folder: string) => {
      await emailService.emptyFolder(folder);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: send email ───────────────────────────────────────────────
export function useSendEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      threadId?: string;
      to: string[];
      cc?: string[];
      bcc?: string[];
      subject: string;
      bodyHtml: string;
      bodyText?: string;
      attachments?: Array<{ key: string; name: string; size: number; contentType: string }>;
    }) => {
      const res = await emailService.send(body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Hook: save draft ───────────────────────────────────────────────
export function useSaveDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      threadId?: string;
      to?: string[];
      cc?: string[];
      bcc?: string[];
      subject?: string;
      bodyHtml?: string;
      attachments?: Array<{ key: string; name: string; size: number; contentType: string }>;
    }) => {
      const res = await emailService.saveDraft(body);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: threadKeys.all });
    },
  });
}

// ── Compatibility hooks for other pages ────────────────────────────
export function useThreadList(folder: string) {
  return useThreads(folder as any);
}
export function useThreadDetail(id: string | null) {
  return useThread(id || "");
}
export function useMoveThread() {
  const mutation = useMove();
  return {
    ...mutation,
    mutate: (args: { threadId: string; folder: string }) =>
      mutation.mutate({ id: args.threadId, folder: args.folder }),
  };
}
export function useToggleStar() {
  return useStar();
}
export function useToggleImportant() {
  return useMarkImportant();
}
