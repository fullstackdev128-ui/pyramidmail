import type { Attachment, AttachmentType } from "@/components/email/AttachmentCard";

export type ApiAttachment = {
  key: string;
  name: string;
  size: number;
  contentType: string;
};

export function formatAttachmentSize(bytes: number): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function attachmentTypeFromMime(contentType?: string, name?: string): AttachmentType {
  const mime = (contentType ?? "").toLowerCase();
  const ext = (name ?? "").split(".").pop()?.toLowerCase() ?? "";
  if (mime.startsWith("image/") || ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
    return "image";
  }
  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime.includes("spreadsheet") || ["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (mime.includes("word") || ["doc", "docx"].includes(ext)) return "doc";
  if (mime.includes("zip") || ["zip", "rar", "7z"].includes(ext)) return "zip";
  return "generic";
}

export function mapApiAttachment(file: ApiAttachment, index: number): Attachment {
  return {
    id: file.key || String(index),
    key: file.key,
    name: file.name,
    size: formatAttachmentSize(file.size),
    sizeBytes: file.size,
    type: attachmentTypeFromMime(file.contentType, file.name),
    contentType: file.contentType,
  };
}
