import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[#162A42]/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative z-10 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#162A42]">{title}</h3>
          <p className="text-sm text-slate-500 font-medium">{description}</p>
        </div>
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl h-10 font-semibold border-slate-200"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={cn(
              "flex-1 rounded-xl h-10 font-semibold text-white",
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0087CA] hover:bg-[#0087CA]/90"
            )}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
