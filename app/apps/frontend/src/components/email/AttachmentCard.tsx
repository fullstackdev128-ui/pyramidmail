import * as React from "react";
import { FileText, Image, FileSpreadsheet, Archive, File, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { emailService } from "@/services/email.service";

export type AttachmentType = "pdf" | "image" | "doc" | "sheet" | "zip" | "generic";

export interface Attachment {
  id: string;
  key: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: AttachmentType;
  contentType: string;
}

const typeConfig: Record<AttachmentType, { icon: any; color: string }> = {
  pdf: { icon: FileText, color: "text-red-500" },
  image: { icon: Image, color: "text-green-500" },
  doc: { icon: FileText, color: "text-blue-500" },
  sheet: { icon: FileSpreadsheet, color: "text-emerald-500" },
  zip: { icon: Archive, color: "text-orange-500" },
  generic: { icon: File, color: "text-slate-500" },
};

export function AttachmentCard({
  attachment,
  onPreview,
}: {
  attachment: Attachment;
  onPreview: (att: Attachment) => void;
}) {
  const config = typeConfig[attachment.type] || typeConfig.generic;

  const handleDownload = async () => {
    try {
      const res = await emailService.downloadAttachment(attachment.key);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[#EDF3F6] border border-slate-100 rounded-xl hover:bg-[#DFE5E7] transition-all group max-w-[240px]">
      <div className={cn("p-2 rounded-lg bg-white shadow-sm shrink-0", config.color)}>
        <config.icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-[#162A42] truncate" title={attachment.name}>
          {attachment.name}
        </div>
        <div className="text-[10px] text-slate-400 font-medium">{attachment.size}</div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-[#0087CA]"
          onClick={handleDownload}
        >
          <Download size={14} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-[#0087CA]"
          onClick={() => onPreview(attachment)}
        >
          <Eye size={14} />
        </Button>
      </div>
    </div>
  );
}
