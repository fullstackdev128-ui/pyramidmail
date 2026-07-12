import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { Popover } from "@/components/ui/popover";
import {
  X,
  Minus,
  Maximize2,
  Minimize2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Paperclip,
  Smile,
  Trash2,
  FileIcon,
  AlertCircle,
} from "lucide-react";
import { useComposeStore } from "@/store/useComposeStore";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSendEmail, useSaveDraft, useDeleteThread } from "@/hooks/useThreads";
import { useToast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";
import { emailService } from "@/services/email.service";
import { getUploadErrorMessage } from "@/lib/upload-errors";

export function ComposeModal() {
  const {
    isOpen,
    isMinimized,
    isFullscreen,
    draft,
    close,
    minimize,
    restore,
    toggleFullscreen,
    updateDraft,
    addAttachments,
    removeAttachment,
  } = useComposeStore();

  const isMobile = useIsMobile();
  const effectiveFullscreen = isMobile || isFullscreen;

  const { t } = useTranslation();
  const { showToast } = useToast();
  const sendEmailMutation = useSendEmail();
  const saveDraftMutation = useSaveDraft();
  const deleteDraftMutation = useDeleteThread();
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#0087CA] underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: draft.body,
    onUpdate: ({ editor }) => {
      updateDraft({ body: editor.getHTML() });
    },
  });

  // Sync editor content when draft changes externally
  useEffect(() => {
    if (editor && draft.body !== editor.getHTML()) {
      editor.commands.setContent(draft.body);
    }
  }, [draft.subject, draft.to.length, draft.id]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(async () => {
      const hasContent = draft.to.length > 0 || draft.subject || (editor && !editor.isEmpty);
      if (hasContent && !sendEmailMutation.isPending) {
        try {
          setIsSaving(true);
          const cleanTo = draft.to.map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
          const cleanCcDraft = (draft.cc ?? []).map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
          const cleanBccDraft = (draft.bcc ?? []).map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
          const draftEmail = await saveDraftMutation.mutateAsync({
            threadId: draft.id,
            to: cleanTo,
            cc: cleanCcDraft,
            bcc: cleanBccDraft,
            subject: draft.subject || "(sans objet)",
            bodyHtml: editor?.getHTML() || "",
          });
          if (!draft.id && draftEmail?.threadId) {
            updateDraft({ id: draftEmail.threadId });
          }
        } catch (err) {
          console.error("Failed to auto-save draft", err);
        } finally {
          setIsSaving(false);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [draft.to, draft.subject, draft.body]);

  if (!isOpen) return null;

  const handleToKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && toInput.trim()) {
      e.preventDefault();
      if (!draft.to.includes(toInput.trim())) {
        updateDraft({ to: [...draft.to, toInput.trim()] });
      }
      setToInput("");
    }
  };

  const removeRecipient = (email: string) => {
    updateDraft({ to: draft.to.filter((t) => t !== email) });
  };

  const handleCcKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && ccInput.trim()) {
      e.preventDefault();
      const val = ccInput.trim();
      const current = draft.cc ?? [];
      if (!current.includes(val)) {
        updateDraft({ cc: [...current, val] });
      }
      setCcInput("");
    }
  };

  const removeCcRecipient = (email: string) => {
    updateDraft({ cc: (draft.cc ?? []).filter((t) => t !== email) });
  };

  const handleBccKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && bccInput.trim()) {
      e.preventDefault();
      const val = bccInput.trim();
      const current = draft.bcc ?? [];
      if (!current.includes(val)) {
        updateDraft({ bcc: [...current, val] });
      }
      setBccInput("");
    }
  };

  const removeBccRecipient = (email: string) => {
    updateDraft({ bcc: (draft.bcc ?? []).filter((t) => t !== email) });
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const oversizedFiles = files.filter((f) => f.size > MAX_FILE_SIZE);

      if (oversizedFiles.length > 0) {
        setAttachmentError(`Certains fichiers dépassent la limite de 5MB.`);
        setTimeout(() => setAttachmentError(null), 5000);
        return;
      }

      addAttachments(files);
      setAttachmentError(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDeleteDraft = async () => {
    try {
      if (draft.id) {
        await deleteDraftMutation.mutateAsync(draft.id);
      }
    } catch (err) {
      console.error("Failed to delete draft", err);
    } finally {
      setShowDeleteConfirm(false);
      close();
    }
  };

  const handleSend = async () => {
    const finalRecipients = [...draft.to].map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
    const currentInput = toInput.trim();

    if (currentInput) {
      if (currentInput.includes("@")) {
        if (!finalRecipients.includes(currentInput)) {
          finalRecipients.push(currentInput);
        }
      }
    }

    if (finalRecipients.length === 0) {
      showToast("Veuillez ajouter au moins un destinataire.", "error");
      return;
    }

    try {
      setIsSaving(true);
      // Upload attachments first with progress tracking
      setUploadProgress({});
      const uploadedAttachments = await Promise.all(
        draft.attachments.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const res = await import("axios").then(({ default: axios }) =>
            axios.post(
              `${import.meta.env.VITE_API_URL ?? ""}/attachments/upload`,
              formData,
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token") ?? ""}`,
                },
                onUploadProgress: (e) => {
                  const pct = Math.round((e.loaded * 100) / (e.total ?? 1));
                  setUploadProgress((prev) => ({ ...prev, [file.name]: pct }));
                },
              }
            )
          );
          return res.data;
        })
      );
      setUploadProgress({});

      const cleanCc = (draft.cc ?? []).map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
      const cleanBcc = (draft.bcc ?? []).map((r) => { const m = r.match(/<([^>]+)>/); return m ? m[1] : r; });
      await sendEmailMutation.mutateAsync({
        threadId: draft.id,
        to: finalRecipients,
        cc: cleanCc.length > 0 ? cleanCc : undefined,
        bcc: cleanBcc.length > 0 ? cleanBcc : undefined,
        subject: draft.subject || "(sans objet)",
        bodyHtml: (() => {
          const raw = editor?.getHTML() || "";
          return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="font-family:Arial,sans-serif;font-size:14px;color:#333;line-height:1.6;margin:0;padding:12px;">${raw.replace(/<ul>/g, '<ul style="padding-left:20px;margin:8px 0;list-style-type:disc;">').replace(/<ol>/g, '<ol style="padding-left:20px;margin:8px 0;list-style-type:decimal;">').replace(/<li>/g, '<li style="margin:4px 0;">').replace(/<strong>/g, '<strong style="font-weight:bold;">').replace(/<em>/g, '<em style="font-style:italic;">')}</body></html>`;
        })(),
        bodyText: (() => {
          const raw = editor?.getHTML() || "";
          return raw.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<\/li>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/\n\n+/g, "\n\n").trim();
        })(),
        attachments: uploadedAttachments,
      });
      showToast("Email envoyé !", "success");
      close();
    } catch (err) {
      showToast(getUploadErrorMessage(err), "error");
      console.error("Failed to send email", err);
    } finally {
      setIsSaving(false);
    }
  };

  const setLink = () => {
    const url = window.prompt("Entrez l'URL du lien :");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleClose = async () => {
    close();
  };

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 right-12 w-[280px] h-12 bg-[#162A42] text-white rounded-t-xl flex items-center justify-between px-4 cursor-pointer z-[100] shadow-2xl"
        onClick={restore}
      >
        <span className="text-sm font-semibold truncate">New message</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              restore();
            }}
          >
            <Maximize2 size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bg-white shadow-2xl flex flex-col z-[100] transition-all duration-300 overflow-hidden",
        effectiveFullscreen
          ? "inset-0 w-full h-full rounded-none"
          : "bottom-0 right-12 w-[520px] h-[600px] rounded-t-2xl border border-slate-200"
      )}
    >
      {/* Header */}
      <div className="h-12 bg-[#162A42] text-white flex items-center justify-between px-4 shrink-0">
        <span className="text-sm font-semibold truncate">
          {isMobile ? t("compose.newMessage", "Nouveau message") : "New message"}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={minimize}
            >
              <Minus size={16} />
            </Button>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={handleClose}
          >
            <X size={16} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Recipients */}
        <div
          className={cn(
            "px-4 py-2 flex min-h-[48px]",
            isMobile ? "flex-col items-stretch gap-2" : "flex-wrap items-center gap-2"
          )}
        >
          <span className={cn("text-sm text-slate-400", isMobile ? "font-medium" : "w-6")}>
            {t("compose.to")}
          </span>
          <div className={cn("flex flex-wrap items-center gap-2", isMobile && "w-full")}>
            {draft.to.map((email) => (
              <div
                key={email}
                className="bg-[#9ACEE8] text-[#162A42] px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 group"
              >
                {email}
                <button onClick={() => removeRecipient(email)} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </div>
            ))}
            <input
              className="flex-1 min-w-[120px] text-sm outline-none bg-transparent h-8"
              value={toInput}
              onChange={(e) => setToInput(e.target.value)}
              onKeyDown={handleToKeyDown}
              placeholder={draft.to.length === 0 ? t("compose.to") : ""}
            />
            <div className="flex gap-2 text-xs font-medium text-slate-400 ml-auto">
              <button type="button" className={showCc ? "text-[#0087CA] font-semibold" : "hover:text-[#0087CA]"} onClick={() => setShowCc(!showCc)}>
                Cc
              </button>
              <button type="button" className={showBcc ? "text-[#0087CA] font-semibold" : "hover:text-[#0087CA]"} onClick={() => setShowBcc(!showBcc)}>
                Cci
              </button>
            </div>
          </div>
        </div>
        <Separator />

        {/* Cc field */}
        {showCc && (
          <>
            <div className="px-4 py-2 flex flex-wrap items-center gap-2 min-h-[40px]">
              <span className="text-sm text-slate-400 w-6">Cc</span>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {(draft.cc ?? []).map((email) => (
                  <div key={email} className="bg-[#9ACEE8] text-[#162A42] px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    {email}
                    <button onClick={() => removeCcRecipient(email)} className="hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
                <input
                  className="flex-1 min-w-[120px] text-sm outline-none bg-transparent h-8"
                  value={ccInput}
                  onChange={(e) => setCcInput(e.target.value)}
                  onKeyDown={handleCcKeyDown}
                  placeholder="Destinataires en copie"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Bcc field */}
        {showBcc && (
          <>
            <div className="px-4 py-2 flex flex-wrap items-center gap-2 min-h-[40px]">
              <span className="text-sm text-slate-400 w-6">Cci</span>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {(draft.bcc ?? []).map((email) => (
                  <div key={email} className="bg-[#9ACEE8] text-[#162A42] px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    {email}
                    <button onClick={() => removeBccRecipient(email)} className="hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
                <input
                  className="flex-1 min-w-[120px] text-sm outline-none bg-transparent h-8"
                  value={bccInput}
                  onChange={(e) => setBccInput(e.target.value)}
                  onKeyDown={handleBccKeyDown}
                  placeholder="Copie cachée"
                />
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Subject */}
        <div className="px-4 py-1">
          <Input
            placeholder={t("compose.subject")}
            className="border-none shadow-none focus-visible:ring-0 px-0 h-10 text-sm font-medium placeholder:text-slate-400 bg-transparent"
            value={draft.subject}
            onChange={(e) => updateDraft({ subject: e.target.value })}
          />
        </div>
        <Separator />

        {/* Editor Toolbar — hidden on mobile (actions in footer) */}
        <div className="hidden md:flex px-2 py-1 items-center gap-0.5 bg-slate-50 shrink-0 overflow-x-auto">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            disabled={!editor?.can().chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor?.can().chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor?.isActive("underline") && "bg-slate-200")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon size={16} />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className={cn("h-8 w-8 p-0", editor?.isActive({ textAlign: "left" }) && "bg-slate-200")}
            onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive({ textAlign: "center" }) && "bg-slate-200"
            )}
            onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0",
              editor?.isActive({ textAlign: "right" }) && "bg-slate-200"
            )}
            onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight size={16} />
          </Button>
        </div>

        {/* Editor Body */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 cursor-text outline-none focus:outline-none focus-within:outline-none"
          onClick={() => editor?.commands.focus()}
        >
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none outline-none focus:outline-none min-h-[100px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:my-0.5"
          />

          {/* Error Message for oversized files */}
          {attachmentError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
              <AlertCircle size={16} />
              <span className="text-xs font-semibold">{attachmentError}</span>
            </div>
          )}

          {/* Selected Attachments */}
          {draft.attachments.length > 0 && (
            <div className="mt-8 pt-4 border-t border-slate-100 space-y-2">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Pièces jointes ({draft.attachments.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {draft.attachments.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex flex-col w-full max-w-[200px]">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EDF3F6] border border-slate-200 rounded-lg group animate-in fade-in zoom-in duration-200">
                      <FileIcon size={14} className="text-[#0087CA]" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-[#162A42] truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {formatSize(file.size)}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="ml-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                      <div className="w-full mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-1 bg-[#0087CA] rounded-full transition-all duration-200"
                          style={{ width: uploadProgress[file.name] + "%" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "px-4 border-t border-slate-100 shrink-0",
          isMobile
            ? "py-3 flex flex-col gap-3 safe-area-pb"
            : "h-16 flex items-center justify-between"
        )}
      >
        <div className={cn("flex items-center gap-2", isMobile && "w-full flex-wrap")}>
          <Button
            className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl px-6 font-semibold h-10 disabled:opacity-50"
            onClick={handleSend}
            disabled={sendEmailMutation.isPending}
          >
            {sendEmailMutation.isPending ? (
              <Loader2 size={18} className="animate-spin mr-2" />
            ) : null}
            {t("compose.send")}
          </Button>
          {isSaving && (
            <span className="text-[10px] text-slate-400 font-medium ml-4 animate-pulse">
              {t("compose.saving")}
            </span>
          )}
          {!isMobile && (
            <>
              <Button
                variant="outline"
                className="rounded-xl px-4 h-10 text-[#162A42] border-[#DFE5E7] hover:bg-[#DFE3E8]"
                onClick={handleClose}
              >
                {t("compose.discard")}
              </Button>

            </>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-slate-500",
            isMobile && "w-full justify-between border-t border-slate-100 pt-2"
          )}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          {isMobile && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:text-[#0087CA]"
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold size={18} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:text-[#0087CA]"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic size={18} />
              </Button>
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 hover:text-[#0087CA]"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip size={18} />
          </Button>

          <Popover
            trigger={
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:text-[#0087CA]">
                <Smile size={18} />
              </Button>
            }
            openAbove={true}
            className="p-0 overflow-hidden"
          >
            <Picker
              data={data}
              onEmojiSelect={(emoji: any) =>
                editor?.chain().focus().insertContent(emoji.native).run()
              }
              theme="light"
              locale="fr"
              set="native"
            />
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-9 w-9 p-0 hover:text-[#0087CA]",
              editor?.isActive("link") && "text-[#0087CA]"
            )}
            onClick={setLink}
          >
            <LinkIcon size={18} />
          </Button>
          {isMobile ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 px-3 text-xs font-semibold text-slate-500 hover:text-red-500"
              onClick={handleClose}
            >
              {t("compose.discard")}
            </Button>
          ) : (
            <>
              <Separator orientation="vertical" className="h-6 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:text-red-500"
                onClick={handleClose}
              >
                <Trash2 size={18} />
              </Button>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
