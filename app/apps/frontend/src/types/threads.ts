export type ThreadCategory = "principale" | "promotions";

export type ThreadAttachment = {
  id: string;
  name: string;
  size: string;
  type: "pdf" | "image" | "doc" | "sheet" | "zip" | "generic";
};

export type Thread = {
  id: string;
  from: {
    name: string;
    email: string;
    avatar: string | null;
  };
  subject: string;
  preview: string;
  body: string;
  date: string;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  folder: string;
  hasAttachment: boolean;
  attachments?: ThreadAttachment[];
  unreadCount?: number;
  category?: ThreadCategory;
};
