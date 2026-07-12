import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn, getUserColor, getUserInitials } from "@/lib/utils";

export interface EmailListThread {
  id: string;
  lastFrom?: string | null;
  lastTo?: string[];
  subject?: string | null;
  snippet?: string | null;
  lastSentAt?: string | Date | null;
  lastMessageAt?: string | Date | null;
  unreadCount?: number;
  isStarred?: boolean;
}

interface EmailListItemProps {
  thread: EmailListThread;
  displayParticipant: string;
  isSelected: boolean;
  onSelect: () => void;
  onStarToggle?: () => void;
}

function formatListDate(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

export function EmailListItem({
  thread,
  displayParticipant,
  isSelected,
  onSelect,
  onStarToggle,
}: EmailListItemProps) {
  const isUnread = (thread.unreadCount ?? 0) > 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full cursor-pointer transition-colors touch-manipulation",
        "px-3 py-3 lg:px-4 lg:py-4",
        isSelected ? "bg-[#DFE5E7]" : "hover:bg-[#EDF3F6]",
        isUnread && !isSelected && "bg-[#EDF3F6]/80"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar className={cn("h-10 w-10 shrink-0", getUserColor(displayParticipant))}>
          <AvatarFallback className="bg-transparent font-semibold text-sm">
            {getUserInitials(displayParticipant)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "text-sm truncate flex-1 min-w-0",
                isUnread ? "font-semibold text-[#162A42]" : "font-medium text-[#091D35]"
              )}
            >
              {displayParticipant}
            </span>
            <span className="text-[10px] text-slate-400 font-medium shrink-0 lg:hidden">
              {formatListDate(thread.lastSentAt ?? thread.lastMessageAt)}
            </span>
          </div>

          <div
            className={cn(
              "text-xs truncate mt-0.5",
              isUnread ? "font-semibold text-[#162A42]" : "text-slate-600"
            )}
          >
            {thread.subject || "(sans objet)"}
          </div>

          <div className="text-[11px] text-slate-400 truncate mt-0.5 leading-snug">
            {thread.snippet}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0 pt-0.5">
          <span className="text-[10px] text-slate-400 font-medium hidden lg:block">
            {formatListDate(thread.lastSentAt ?? thread.lastMessageAt)}
          </span>
          {onStarToggle && (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 w-8 p-0 shrink-0 opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
                "max-lg:opacity-100",
                thread.isStarred ? "text-yellow-400" : "text-slate-300 hover:text-yellow-400"
              )}
              onClick={(event) => {
                event.stopPropagation();
                onStarToggle();
              }}
              aria-label={thread.isStarred ? "Retirer des suivis" : "Ajouter aux suivis"}
            >
              <Star size={16} fill={thread.isStarred ? "currentColor" : "none"} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
