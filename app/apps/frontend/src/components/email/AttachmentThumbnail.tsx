import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { emailService } from "@/services/email.service";
import type { Attachment } from "./AttachmentCard";

interface AttachmentThumbnailProps {
  attachment: Attachment;
  onPreview: (att: Attachment) => void;
}

export function AttachmentThumbnail({ attachment, onPreview }: AttachmentThumbnailProps) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    setIsLoading(true);
    setError(false);

    emailService
      .downloadAttachment(attachment.key)
      .then((res) => {
        objectUrl = URL.createObjectURL(res.data);
        setThumbUrl(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.key]);

  return (
    <button
      type="button"
      onClick={() => onPreview(attachment)}
      className={cn(
        "relative aspect-square w-full max-w-[140px] rounded-xl overflow-hidden",
        "border border-slate-200 bg-slate-50 hover:ring-2 hover:ring-[#0087CA]/40 transition-all"
      )}
      aria-label={`Aperçu ${attachment.name}`}
    >
      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0087CA]" size={24} />
        </span>
      ) : error || !thumbUrl ? (
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 p-2 text-center">
          Aperçu indisponible
        </span>
      ) : (
        <img src={thumbUrl} alt={attachment.name} className="h-full w-full object-cover" />
      )}
      <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
        {attachment.name}
      </span>
    </button>
  );
}
