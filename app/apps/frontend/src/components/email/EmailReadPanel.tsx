import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn, getUserColor, getUserInitials } from "@/lib/utils";
import {
  Archive,
  Trash2,
  ShieldAlert,
  Mail,
  Star,
  AlertCircle,
  RefreshCw,
  Reply,
  Paperclip,
  ChevronLeft,
} from "lucide-react";
import { AttachmentCard, type Attachment } from "@/components/email/AttachmentCard";
import { AttachmentThumbnail } from "@/components/email/AttachmentThumbnail";
import { mapApiAttachment } from "@/lib/attachments";
import { Tooltip } from "@/components/ui/tooltip";

interface EmailReadPanelProps {
  selectedEmail: any;
  isLoadingDetail: boolean;
  isFetching: boolean;
  refetch: () => void;
  onBack?: () => void;
  folderFromPath: string;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onSpam: (id: string) => void;
  onToggleRead: (id: string, isRead: boolean) => void;
  onToggleStar: (id: string) => void;
  onToggleImportant: (id: string) => void;
  onReply: (email: any) => void;
  onPreviewAttachment: (attachment: Attachment) => void;
}

export function EmailReadPanel({
  selectedEmail,
  isLoadingDetail,
  isFetching,
  refetch,
  onBack,
  folderFromPath,
  onArchive,
  onDelete,
  onSpam,
  onToggleRead,
  onToggleStar,
  onToggleImportant,
  onReply,
  onPreviewAttachment,
}: EmailReadPanelProps) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {onBack ? (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0" onClick={onBack}>
              <ChevronLeft size={18} />
            </Button>
          ) : null}
          <Tooltip content="Archiver">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-500 hover:text-[#0087CA]"
              onClick={() => onArchive(selectedEmail.id)}
            >
              <Archive size={18} />
            </Button>
          </Tooltip>
          <Tooltip content="Supprimer">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-500 hover:text-red-500"
              onClick={() => onDelete(selectedEmail.id)}
            >
              <Trash2 size={18} />
            </Button>
          </Tooltip>
          <Tooltip content="Spam">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-500 hover:text-orange-500"
              onClick={() => onSpam(selectedEmail.id)}
            >
              <ShieldAlert size={18} />
            </Button>
          </Tooltip>
          <Tooltip content={selectedEmail.isRead ? "Marquer non lu" : "Marquer lu"}>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0 text-slate-500 hover:text-[#0087CA]",
                selectedEmail.isRead ? "text-slate-400" : "text-[#0087CA]"
              )}
              onClick={() => onToggleRead(selectedEmail.id, selectedEmail.isRead)}
            >
              <Mail size={18} />
            </Button>
          </Tooltip>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Tooltip content="Étoile">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0",
                selectedEmail.isStarred ? "text-yellow-400" : "text-slate-300 hover:text-yellow-400"
              )}
              onClick={() => onToggleStar(selectedEmail.id)}
            >
              <Star size={18} fill={selectedEmail.isStarred ? "currentColor" : "none"} />
            </Button>
          </Tooltip>
          <Tooltip content="Important">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-9 w-9 p-0",
                selectedEmail.isImportant ? "text-[#0087CA]" : "text-slate-300 hover:text-[#0087CA]"
              )}
              onClick={() => onToggleImportant(selectedEmail.id)}
            >
              <AlertCircle size={18} fill={selectedEmail.isImportant ? "currentColor" : "none"} />
            </Button>
          </Tooltip>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip content="Actualiser">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-500 hover:text-[#0087CA]"
              onClick={refetch}
            >
              <RefreshCw size={18} className={cn(isFetching && "animate-spin")} />
            </Button>
          </Tooltip>
        </div>
      </div>

      <ScrollArea className="flex-1 p-8">
        {isLoadingDetail ? (
          <div className="space-y-4">
            <div className="h-8 bg-slate-100 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-100 rounded animate-pulse w-1/4" />
            <Separator />
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse" />
              <div className="h-4 bg-slate-100 rounded animate-pulse w-5/6" />
            </div>
          </div>
        ) : (
          <div className="w-full px-4 space-y-8">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-2xl font-semibold text-[#162A42] leading-tight">
                {selectedEmail.subject}
              </h2>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest pt-2 shrink-0">
                {new Date(selectedEmail.date).toLocaleString("fr-FR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar className={cn("h-10 w-10", getUserColor(selectedEmail.from.name))}>
                <AvatarFallback className="bg-transparent font-semibold">
                  {getUserInitials(selectedEmail.from.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[#162A42]">{selectedEmail.from.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">
                  &lt;{selectedEmail.from.email}&gt;
                </span>
              </div>
            </div>

            <div
              className="text-[#091D35] leading-relaxed prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
            />

            <div className="pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                className="rounded-xl px-6 gap-2 border-[#DFE5E7] hover:bg-[#EDF3F6] text-[#162A42] font-semibold"
                onClick={() => onReply(selectedEmail)}
              >
                <Reply size={18} />
                Répondre
              </Button>
            </div>

            {selectedEmail.attachments && selectedEmail.attachments.length > 0 ? (
              <div className="space-y-4 pt-8">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  <Paperclip size={14} />
                  {selectedEmail.attachments.length} pièces jointes
                </div>
                <div className="flex flex-wrap gap-4">
                  {selectedEmail.attachments.map((file: any, i: number) => {
                    const sizeBytes =
                      typeof file.size === "number"
                        ? file.size
                        : typeof file.sizeBytes === "number"
                          ? file.sizeBytes
                          : 0;
                    const mapped = mapApiAttachment(
                      {
                        key: file.key,
                        name: file.name ?? "fichier",
                        size: sizeBytes,
                        contentType: file.contentType ?? "",
                      },
                      i
                    );
                    if (mapped.type === "image") {
                      return (
                        <AttachmentThumbnail
                          key={mapped.id}
                          attachment={mapped}
                          onPreview={onPreviewAttachment}
                        />
                      );
                    }
                    return (
                      <AttachmentCard
                        key={mapped.id}
                        attachment={mapped}
                        onPreview={onPreviewAttachment}
                      />
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
