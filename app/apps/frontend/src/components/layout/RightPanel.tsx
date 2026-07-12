import {
  CheckSquare,
  Calendar,
  LayoutDashboard,
  Users,
  CreditCard,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

interface PanelItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const productivityItems: PanelItem[] = [
  { icon: CheckSquare, label: "Tâches", path: "/tasks" },
  { icon: Calendar, label: "Calendrier", path: "/calendar" },
];

function renderItem({ icon: Icon, label, path }: PanelItem) {
  return (
    <NavLink
      key={label}
      to={path}
      end
      className={({ isActive }) =>
        cn(
          "relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors duration-200 group",
          "hover:bg-[#DFE5E7]/50",
          isActive ? "text-[#0087CA]" : "text-[#162A42]"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={cn("transition-colors", isActive ? "text-[#0087CA]" : "text-[#162A42]")}
          />
          {/* Tooltip — positioned to the left */}
          <div className="absolute right-full mr-2 px-2 py-1 bg-[#162A42] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            {label}
          </div>
        </>
      )}
    </NavLink>
  );
}

export function RightPanel() {
  return (
    <aside className="hidden lg:flex fixed right-0 top-16 bottom-0 w-[56px] bg-white border-l border-[#DFE5E7] flex-col items-center py-4 z-40 gap-2">
      {/* Section Productivité */}
      <div className="flex flex-col items-center gap-1">{productivityItems.map(renderItem)}</div>
    </aside>
  );
}
