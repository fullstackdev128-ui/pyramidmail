import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { usePlan } from "@/hooks/usePlan";
import { cn } from "@/lib/utils";

interface AdItem {
  id: number;
  text: string;
  cta: string;
  link: string;
}

const ADS: AdItem[] = [
  {
    id: 1,
    text: "Passez à Pyramid Premium — Sans publicité, plus de stockage.",
    cta: "Découvrir",
    link: "/admin/billing",
  },
  {
    id: 2,
    text: "Pyramid Business — Gérez votre équipe en toute simplicité.",
    cta: "En savoir plus",
    link: "/admin/billing",
  },
  {
    id: 3,
    text: "Pyramid Sécurité — Protégez vos données professionnelles.",
    cta: "Voir les offres",
    link: "/admin/billing",
  },
];

const ROTATION_INTERVAL = 6000;
const FADE_DURATION = 400;

interface BottomBannerProps {
  /** Desktop sidebar width: collapsed 56px vs expanded 240px */
  sidebarCollapsed?: boolean;
}

export function BottomBanner({ sidebarCollapsed = false }: BottomBannerProps) {
  // 1. TOUS les hooks en premier, sans exception
  const { plan } = usePlan();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ADS.length);
        setFading(false);
      }, FADE_DURATION);
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  // 2. Les returns conditionnels APRÈS tous les hooks
  if (plan === "premium" || dismissed) return null;

  // 3. Le JSX normal
  const ad = ADS[currentIndex];

  return (
    <div
      className={cn(
        "fixed bottom-0 z-50 h-11 bg-[#0087CA] text-white flex items-center px-4 md:px-6",
        "left-0 right-0",
        "lg:right-[56px]",
        sidebarCollapsed ? "lg:left-[56px]" : "lg:left-[240px]"
      )}
    >
      <div
        className={cn(
          "flex-1 text-sm font-medium transition-opacity duration-400",
          fading ? "opacity-0" : "opacity-100"
        )}
      >
        {ad.text}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigate(ad.link)}
          className="bg-white text-[#0087CA] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white/90 transition-colors"
        >
          {ad.cta}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/80 hover:text-white transition-colors"
          aria-label="Fermer la bannière"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
