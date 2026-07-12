import { useEffect, useState } from "react";
import { X, Download, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Attachment } from "./AttachmentCard";
import { emailService } from "@/services/email.service";

async function downloadAttachmentFile(attachment: Attachment) {
  const res = await emailService.downloadAttachment(attachment.key);
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = attachment.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function AttachmentPreview({
  attachment,
  onClose,
}: {
  attachment: Attachment;
  onClose: () => void;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        setPreviewUrl(objectUrl);
      })
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment.key]);

  const handleDownload = async () => {
    try {
      await downloadAttachmentFile(attachment);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const Wrapper = "div" as const;
  const wrapperProps = {
    className:
      "fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex flex-col animate-in fade-in duration-200",
  };

  return (
    <Wrapper {...wrapperProps} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="flex flex-col flex-1 min-h-0 w-full max-w-6xl mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Wrapper className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Wrapper className="flex items-center gap-3 text-white">
            <FileText size={20} className="text-[#9ACEE8]" />
            <span className="font-semibold truncate max-w-md">{attachment.name}</span>
            <span className="text-xs text-white/40 font-medium">({attachment.size})</span>
          </Wrapper>
          <Wrapper className="flex items-center gap-4">
            <Button
              className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 font-semibold"
              onClick={handleDownload}
              disabled={isLoading || error}
            >
              <Download size={18} /> Télécharger
            </Button>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </Wrapper>
        </Wrapper>

        <Wrapper className="flex-1 flex items-center justify-center p-12 overflow-auto">
          {isLoading ? (
            <Loader2 className="animate-spin text-white" size={48} />
          ) : error ? (
            <Wrapper className="text-center text-white/60 space-y-4">
              <FileText size={64} className="mx-auto opacity-40" />
              <p className="font-medium">Impossible de charger le fichier</p>
            </Wrapper>
          ) : attachment.type === "image" && previewUrl ? (
            <img
              src={previewUrl}
              alt={attachment.name}
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
            />
          ) : attachment.type === "pdf" && previewUrl ? (
            <iframe
              src={previewUrl}
              title={attachment.name}
              className="w-full max-w-4xl h-[80vh] bg-white rounded-lg"
            />
          ) : (
            <Wrapper className="max-w-4xl w-full aspect-video bg-white/5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-white/60 space-y-6">
              <Wrapper className="w-32 h-32 bg-slate-500/20 rounded-full flex items-center justify-center text-slate-400">
                {attachment.type === "image" ? <ImageIcon size={64} /> : <FileText size={64} />}
              </Wrapper>
              <p className="font-medium">Aperçu non disponible pour ce type de fichier</p>
              <Button onClick={handleDownload} className="bg-[#0087CA] text-white rounded-xl">
                Télécharger le fichier
              </Button>
            </Wrapper>
          )}
        </Wrapper>
      </div>
    </Wrapper>
  );
}
