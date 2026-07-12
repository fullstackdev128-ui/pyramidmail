export type MailFolder = "INBOX" | "SENT" | "DRAFT" | "TRASH" | "SPAM" | "ARCHIVE";

export interface Email {
  id: string;
  from: string;
  to: string[];
  subject: string;
  bodyHtml?: string;
  bodyText?: string;
  folder: MailFolder;
  isRead: boolean;
  sentAt: string;
}

export interface ThreadSummary {
  id: string;
  subject: string;
  snippet: string | null;
  lastMessageAt: string;
  lastFrom: string | null;
  lastSentAt: string | null;
  unreadCount: number;
}
