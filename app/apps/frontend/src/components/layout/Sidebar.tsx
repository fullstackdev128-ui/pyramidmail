import {
  Inbox,
  Mail,
  Trash2,
  Pencil,
  Send,
  Clock,
  Star,
  Plus,
  Settings,
  LogOut,
  MailOpen,
  Menu,
  X,
  CheckSquare,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth.service";
import { useFolderCounts } from "@/hooks/useFolderCounts";
import { useComposeStore } from "@/store/useComposeStore";
import { useIsDesktop } from "@/hooks/useBreakpoint";
import { Separator } from "@/components/ui/separator";
import { Tooltip } from "@/components/ui/tooltip";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: (value: boolean) => void;
  isDrawerOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
  count?: number;
}

export function Sidebar({ isCollapsed, onToggle, isDrawerOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: counts } = useFolderCounts();
  const { open } = useComposeStore();
  const drawerVisible = !isDesktop && isDrawerOpen;
  const showLabels = isDesktop ? !isCollapsed : true;

  const handleLogout = async () => {
    try {
      await authService.logout();
      queryClient.clear();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
      queryClient.clear();
      navigate("/login");
    }
  };

  const messagingItems: NavItem[] = [
    { icon: Inbox, label: t("sidebar.inbox"), path: "/inbox", count: counts?.inbox },
    { icon: Mail, label: t("sidebar.allMails"), path: "/all-mails" },
    { icon: Trash2, label: t("sidebar.bin"), path: "/bin", count: counts?.trash },
    { icon: Pencil, label: t("sidebar.drafts"), path: "/drafts", count: counts?.drafts },
    {
      icon: MailOpen,
      label: t("sidebar.importants"),
      path: "/importants",
      count: counts?.importants,
    },
    { icon: Send, label: t("sidebar.sendMails"), path: "/sent" },
    { icon: Clock, label: t("sidebar.spam"), path: "/spam", count: counts?.spam },
    { icon: Star, label: t("sidebar.starred"), path: "/starred", count: counts?.starred },
  ];

  const productivityItems: NavItem[] = [
    { icon: CheckSquare, label: t("sidebar.tasks"), path: "/tasks" },
    { icon: Calendar, label: t("sidebar.calendar"), path: "/calendar" },
  ];

  const bottomItems: {
    icon: LucideIcon;
    label: string;
    action: () => void;
    path?: string;
    danger?: boolean;
  }[] = [
    { icon: Settings, label: t("sidebar.settings"), path: "/settings", action: () => {} },
    { icon: LogOut, label: t("sidebar.logout"), action: handleLogout, danger: true },
  ];

  const renderNavItem = ({ icon: Icon, label, path, count }: NavItem) => {
    const isActive = location.pathname === path;
    const link = (
      <Link
        key={path}
        to={path}
        onClick={() => onClose?.()}
        className={cn(
          "flex items-center rounded-xl text-sm transition-all duration-200 group relative",
          showLabels ? "justify-between px-3 py-2" : "justify-center p-0 w-9 h-9 mx-auto",
          isActive
            ? "bg-[#DFE5E7] text-[#0087CA] font-semibold"
            : "text-[#091D35] hover:bg-[#DFE5E7]/50 hover:text-[#0087CA]"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            size={18}
            className={cn(
              "transition-colors shrink-0",
              isActive ? "text-[#0087CA]" : "text-slate-500 group-hover:text-[#0087CA]"
            )}
          />
          {showLabels && <span className="truncate">{label}</span>}
        </div>
        {showLabels && count !== undefined && count > 0 && (
          <span
            className={cn(
              "text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors shrink-0",
              isActive ? "bg-white text-[#0087CA]" : "text-[#0087CA]"
            )}
          >
            {count}
          </span>
        )}
      </Link>
    );

    return showLabels ? (
      link
    ) : (
      <div key={path} className="flex justify-center w-full">
        <Tooltip content={label}>{link}</Tooltip>
      </div>
    );
  };

  return (
    <>
      {!isDesktop && (
        <div
          className={cn(
            "fixed inset-0 bg-black/30 z-[90] transition-opacity lg:hidden",
            drawerVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 bg-white border-r border-slate-100 flex flex-col p-4 z-[95] overflow-visible transition-all duration-200",
          isDesktop ? "lg:flex" : "lg:hidden",
          isDesktop ? (isCollapsed ? "lg:w-[68px]" : "lg:w-[240px]") : "w-[280px]",
          !isDesktop && cn("transform", drawerVisible ? "translate-x-0" : "-translate-x-full")
        )}
      >
        {drawerVisible ? (
          <>
            <div className="flex items-center justify-end mb-3">
              <button
                onClick={onClose}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded text-[#091D35] hover:bg-[#DFE5E7] transition-colors"
                aria-label="Fermer le menu"
              >
                <X size={18} />
              </button>
            </div>
            <Button
              className="w-full h-11 bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded gap-2 shadow-sm font-semibold mb-6"
              onClick={() => {
                open();
                onClose?.();
              }}
            >
              <Plus size={18} />
              {t("sidebar.newMessage")}
            </Button>
          </>
        ) : (
          <div
            className={cn(
              "flex items-center gap-2 mb-6",
              isCollapsed ? "flex-col" : "flex-row w-full"
            )}
          >
            <button
              onClick={() => onToggle(!isCollapsed)}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-[#091D35] hover:bg-[#DFE5E7] transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={18} />
            </button>
            {isDesktop && (
              <Button
                className={cn(
                  "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded gap-2 shadow-sm font-semibold shrink-0 transition-all duration-200",
                  isCollapsed ? "w-9 h-9 p-0 justify-center" : "flex-1 h-11"
                )}
                onClick={() => {
                  open();
                  onClose?.();
                }}
              >
                <Plus size={18} />
                {!isCollapsed && t("sidebar.newMessage")}
              </Button>
            )}
          </div>
        )}

        <div className="flex-1 space-y-1">
          {messagingItems.map((item) => (
            <div key={item.path}>
              {renderNavItem(item)}
              {item.path === "/starred" && !isDesktop && (
                <div className="mt-1 space-y-1">
                  {!showLabels && isDesktop ? null : (
                    <p className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {t("sidebar.productivite")}
                    </p>
                  )}
                  {productivityItems.map(renderNavItem)}
                </div>
              )}
            </div>
          ))}
        </div>

        <Separator className="bg-[#DFE5E7] my-4" />

        <div className="space-y-1 shrink-0">
          {bottomItems.map(({ icon: Icon, label, action, path, danger }) => {
            const isActive = path ? location.pathname === path : false;
            const content = (
              <>
                <Icon
                  size={18}
                  className={cn(
                    "shrink-0 transition-colors",
                    danger
                      ? "text-slate-500 group-hover:text-red-600"
                      : "text-slate-500 group-hover:text-[#0087CA]"
                  )}
                />
                {showLabels && <span>{label}</span>}
              </>
            );

            const baseClass = cn(
              "flex items-center rounded-xl text-sm transition-all duration-200 group relative",
              showLabels ? "gap-3 px-3 py-2" : "justify-center p-0 w-9 h-9 mx-auto",
              danger
                ? "text-[#091D35] hover:bg-red-50 hover:text-red-600"
                : cn(
                    "text-[#091D35] hover:bg-[#DFE5E7]/50 hover:text-[#0087CA]",
                    isActive && "bg-[#DFE5E7] text-[#0087CA] font-semibold"
                  )
            );

            const element = path ? (
              <Link key={label} to={path} onClick={() => onClose?.()} className={baseClass}>
                {content}
              </Link>
            ) : (
              <button
                key={label}
                onClick={() => {
                  action();
                  onClose?.();
                }}
                className={baseClass}
              >
                {content}
              </button>
            );

            return showLabels ? (
              element
            ) : (
              <div key={label} className="flex justify-center w-full">
                <Tooltip content={label}>{element}</Tooltip>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
