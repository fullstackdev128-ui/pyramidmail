import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const AD_DURATION = 5000;

interface LoginAdProps {
  onDismiss: () => void;
}

export function LoginAd({ onDismiss }: LoginAdProps) {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 100;
        if (next >= AD_DURATION) {
          clearInterval(interval);
          onDismiss();
          return AD_DURATION;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onDismiss]);

  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true);
    }, 1000);

    return () => clearTimeout(skipTimer);
  }, []);

  const progress = (elapsed / AD_DURATION) * 100;
  const secondsLeft = Math.max(0, Math.ceil((AD_DURATION - elapsed) / 1000));

  const handleDismiss = () => {
    if (canSkip) {
      onDismiss();
    }
  };

  const handleUpgrade = () => {
    onDismiss();
    navigate("/admin/billing");
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Label Publicité */}
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-full">
            Publicité
          </span>
        </div>

        {/* Close button */}
        {canSkip && (
          <button
            onClick={handleDismiss}
            className="absolute top-3 left-3 z-10 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Illustration Zone */}
        <div className="h-48 bg-[#EDF3F6] flex items-center justify-center">
          <Megaphone size={64} className="text-[#0087CA]" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-[#162A42]">Découvrez nos offres Premium</h2>
            <p className="text-sm text-slate-500 font-medium">
              Supprimez les publicités et profitez de fonctionnalités avancées
            </p>
          </div>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl h-11 font-semibold"
          >
            Voir les offres
          </Button>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#DFE5E7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0087CA] rounded-full transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Skip Counter */}
          <button
            onClick={handleDismiss}
            className={cn(
              "text-xs font-semibold transition-all",
              canSkip
                ? "text-[#0087CA] hover:underline cursor-pointer"
                : "text-slate-300 cursor-not-allowed"
            )}
            disabled={!canSkip}
          >
            {canSkip ? `Passer dans ${secondsLeft}s >` : `Patientez ${secondsLeft}s >`}
          </button>
        </div>
      </div>
    </div>
  );
}
