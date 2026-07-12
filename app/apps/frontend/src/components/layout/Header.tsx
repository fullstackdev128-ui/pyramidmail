import {
  Menu,
  Search,
  SlidersHorizontal,
  X,
  Loader2,
  User,
  Settings,
  UserPlus,
  LogOut,
  Globe,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLayoutStore } from "@/store/useLayoutStore";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { usePlan } from "@/hooks/usePlan";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Popover } from "@/components/ui/popover";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect, useRef } from "react";
import { cn, getUserInitials, getUserColor } from "@/lib/utils";
import { resolveApiPath } from "@/lib/api";
import logo from "@/assets/logo.png";

const FOLDER_OPTIONS = [
  { label: "Tous les dossiers", value: "" },
  { label: "Boîte de réception", value: "INBOX" },
  { label: "Envoyés", value: "SENT" },
  { label: "Brouillons", value: "DRAFT" },
  { label: "Corbeille", value: "TRASH" },
  { label: "Spam", value: "SPAM" },
  { label: "Archives", value: "ARCHIVE" },
];

const ATTACHMENT_OPTIONS = [
  { label: "Indifférent", value: "any" },
  { label: "Avec pièces jointes", value: "true" },
];

export function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const openDrawer = useLayoutStore((state) => state.openDrawer);
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [advFrom, setAdvFrom] = useState(searchParams.get("from") || "");
  const [advSubject, setAdvSubject] = useState(searchParams.get("subject") || "");
  const [advFolder, setAdvFolder] = useState(searchParams.get("folder") || "");
  const [advAttachments, setAdvAttachments] = useState(
    searchParams.get("hasAttachments") === "true" ? "true" : "any"
  );
  const [isFocused, setIsFocused] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { plan } = usePlan();

  const currentLang = i18n.language?.startsWith("en") ? "en" : "fr";
  const changeLanguage = (lang: "fr" | "en") => {
    i18n.changeLanguage(lang);
    localStorage.setItem("pyramid_lang", lang);
  };

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setAdvFrom(searchParams.get("from") || "");
    setAdvSubject(searchParams.get("subject") || "");
    setAdvFolder(searchParams.get("folder") || "");
    setAdvAttachments(searchParams.get("hasAttachments") === "true" ? "true" : "any");
  }, [searchParams]);

  const buildSearchUrl = () => {
    const params = new URLSearchParams();
    const q = query.trim();
    const from = advFrom.trim();
    const subject = advSubject.trim();

    if (q) params.set("q", q);
    if (from) params.set("from", from);
    if (subject) params.set("subject", subject);
    if (advFolder) params.set("folder", advFolder);
    if (advAttachments === "true") params.set("hasAttachments", "true");

    return params.toString() ? `/search?${params.toString()}` : null;
  };

  const hasSearchCriteria = () => {
    return (
      !!query.trim() ||
      !!advFrom.trim() ||
      !!advSubject.trim() ||
      !!advFolder ||
      advAttachments === "true"
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback: clear and redirect anyway
      queryClient.clear();
      navigate("/login");
    }
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!hasSearchCriteria()) return;
    const url = buildSearchUrl();
    if (url) navigate(url);
  };

  const avatarSrc = resolveApiPath(user?.avatar);
  const displayLabel = user?.displayName || user?.email || "User";

  const clearSearch = () => {
    setQuery("");
    navigate("/inbox");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center px-6 border-b border-slate-100">
      {/* Existing Logo and Search Form */}
      <div className="flex items-center gap-2 w-auto shrink-0">
        <button
          type="button"
          onClick={openDrawer}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center">
          <Link to="/inbox" className="flex items-center">
            <img src={logo} alt="Pyramid Mail" className="h-10 w-auto object-contain" />
          </Link>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4">
        <form
          onSubmit={handleSearch}
          className={cn(
            "relative flex items-center bg-[#EDF3F6] rounded-xl transition-all duration-300 px-3 h-10",
            isFocused ? "w-full max-w-3xl ring-1 ring-[#0087CA]/20" : "w-full max-w-2xl"
          )}
        >
          <Popover
            trigger={
              <button
                type="button"
                className="text-slate-400 hover:text-[#0087CA] transition-colors"
              >
                <SlidersHorizontal size={18} />
              </button>
            }
            className="w-[400px] max-w-[90vw] p-6 top-12"
          >
            <div className="space-y-4">
              <h3 className="font-semibold text-[#162A42] mb-4">Recherche avancée</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">De</label>
                  <Input
                    className="h-9 bg-[#EDF3F6] border-none"
                    placeholder="Expéditeur"
                    value={advFrom}
                    onChange={(e) => setAdvFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Objet</label>
                  <Input
                    className="h-9 bg-[#EDF3F6] border-none"
                    placeholder="Sujet de l'email"
                    value={advSubject}
                    onChange={(e) => setAdvSubject(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Dossier
                    </label>
                    <Select
                      options={FOLDER_OPTIONS}
                      value={advFolder}
                      onChange={(e) => setAdvFolder(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase">
                      Pièces jointes
                    </label>
                    <Select
                      options={ATTACHMENT_OPTIONS}
                      value={advAttachments}
                      onChange={(e) => setAdvAttachments(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleSearch}
                className="w-full bg-[#0087CA] hover:bg-[#0087CA]/90 text-white h-10 rounded-xl font-semibold mt-4"
              >
                Rechercher
              </Button>
            </div>
          </Popover>

          <Input
            placeholder={t("header.search")}
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 h-full text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />

          <div className="flex items-center gap-2">
            {isPending && <Loader2 size={16} className="animate-spin text-[#0087CA]" />}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X size={18} />
              </button>
            )}
            <button type="submit" className="text-slate-400 hover:text-[#0087CA] transition-colors">
              <Search size={18} />
            </button>
          </div>
        </form>
      </div>

      {/* Account Switcher Dropdown */}
      <div className="flex items-center gap-3 pl-4" ref={dropdownRef}>
        <DropdownMenu>
          <DropdownMenuTrigger onClick={() => setShowAccountMenu(!showAccountMenu)}>
            <div className="flex items-center gap-3 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
              <span className="text-xs text-[#091D35] font-semibold hidden md:block">
                {user?.displayName || user?.email?.split("@")[0] || "User"}
              </span>
              <Avatar
                className={cn(
                  "h-10 w-10 border-2 border-white shadow-sm shrink-0",
                  getUserColor(displayLabel)
                )}
              >
                {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayLabel} /> : null}
                <AvatarFallback className="bg-transparent text-[10px] font-semibold">
                  {getUserInitials(displayLabel)}
                </AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>

          {showAccountMenu && (
            <DropdownMenuContent className="w-[280px] p-2 mt-2 bg-white rounded-2xl border border-slate-100 shadow-md block">
              {/* Header section */}
              <div className="p-4 flex items-center gap-3">
                <Avatar className={cn("h-12 w-12 shrink-0", getUserColor(displayLabel))}>
                  {avatarSrc ? <AvatarImage src={avatarSrc} alt={displayLabel} /> : null}
                  <AvatarFallback className="bg-transparent text-lg font-semibold">
                    {getUserInitials(displayLabel)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-[#162A42] truncate">
                      {user?.displayName || user?.email?.split("@")[0]}
                    </h4>
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="bg-green-100 text-green-600 text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      Compte actif
                    </span>
                    {plan === "premium" ? (
                      <span className="bg-amber-500 text-white text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Premium ✨
                      </span>
                    ) : (
                      <span className="bg-[#DFE5E7] text-[#091D35] text-[9px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Separator className="my-1 bg-slate-100" />

              {/* Menu Items */}
              <div className="space-y-0.5">
                <DropdownMenuItem
                  onClick={() => {
                    setShowAccountMenu(false);
                    navigate("/profile");
                  }}
                  className="rounded-xl gap-3 h-10 font-semibold group"
                >
                  <User size={16} className="text-slate-400 group-hover:text-[#0087CA]" />
                  {t("auth.profile")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setShowAccountMenu(false);
                    navigate("/settings");
                  }}
                  className="rounded-xl gap-3 h-10 font-semibold group"
                >
                  <Settings size={16} className="text-slate-400 group-hover:text-[#0087CA]" />
                  {t("auth.settings")}
                </DropdownMenuItem>

                <Separator className="my-1 bg-slate-100" />

                <DropdownMenuItem
                  onClick={() => {
                    setShowAccountMenu(false);
                    setShowComingSoon(true);
                  }}
                  className="rounded-xl gap-3 h-10 font-semibold group"
                >
                  <UserPlus size={16} className="text-slate-400 group-hover:text-[#0087CA]" />
                  {t("auth.addAccount")}
                </DropdownMenuItem>

                <Separator className="my-1 bg-slate-100" />

                <div className="px-3 py-2">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    <Globe size={14} />
                    {t("auth.language")}
                  </div>
                  <div className="mt-2 flex gap-2">
                    {(["fr", "en"] as const).map((lng) => (
                      <button
                        key={lng}
                        type="button"
                        onClick={() => changeLanguage(lng)}
                        className={cn(
                          "rounded-xl px-3 py-1 text-sm font-semibold transition-colors",
                          currentLang === lng
                            ? "bg-[#0087CA] text-white"
                            : "bg-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
                        )}
                      >
                        {lng.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="my-1 bg-slate-100" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="group font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl"
                >
                  <LogOut
                    size={16}
                    className="text-red-400 group-hover:text-red-600 transition-colors"
                  />
                  <span>{t("auth.logout")}</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </div>

      {/* Coming Soon Modal */}
      {showComingSoon && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-[#162A42]/60 backdrop-blur-sm"
            onClick={() => setShowComingSoon(false)}
          />
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl relative z-10 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-[#EDF3F6] rounded-2xl flex items-center justify-center text-[#0087CA] mx-auto">
              <UserPlus size={24} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[#162A42]">{t("common.inDevelopment")}</h3>
              <p className="text-sm text-slate-500 font-medium">{t("common.comingSoon")}</p>
            </div>
            <Button
              onClick={() => setShowComingSoon(false)}
              className="w-full bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl h-10 font-semibold"
            >
              {t("common.close")}
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
