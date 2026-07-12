import { useState, useEffect, createContext, useContext } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border min-w-[300px] animate-in slide-in-from-right-full duration-300",
              toast.type === "success" && "bg-emerald-50 border-emerald-100 text-emerald-800",
              toast.type === "error" && "bg-red-50 border-red-100 text-red-800",
              toast.type === "info" && "bg-slate-50 border-slate-100 text-slate-800"
            )}
          >
            {toast.type === "success" && <CheckCircle2 size={18} className="text-emerald-500" />}
            {toast.type === "error" && <AlertCircle size={18} className="text-red-500" />}
            {toast.type === "info" && <Info size={18} className="text-[#0087CA]" />}
            
            <p className="text-sm font-semibold flex-1">{toast.message}</p>
            
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
