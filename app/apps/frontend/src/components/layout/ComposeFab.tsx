import { Plus } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useComposeStore } from "@/store/useComposeStore";

const MAIL_ROUTES = [
  "/inbox",
  "/sent",
  "/drafts",
  "/bin",
  "/spam",
  "/starred",
  "/importants",
  "/all-mails",
  "/search",
];

export function ComposeFab() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { open, isOpen } = useComposeStore();

  const showFab = !isOpen && MAIL_ROUTES.includes(pathname);

  if (!showFab) return null;

  return (
    <div className="fixed right-4 z-[90] lg:hidden bottom-[calc(2.75rem+1rem+env(safe-area-inset-bottom,0px))]">
      <Button
        onClick={() => open()}
        className="inline-flex items-center gap-2 rounded-full bg-[#0087CA] px-4 py-3 text-white shadow-2xl hover:bg-[#0078b5] transition-colors"
      >
        <Plus size={16} />
        <span className="text-sm font-semibold">{t("sidebar.newMessage")}</span>
      </Button>
    </div>
  );
}
