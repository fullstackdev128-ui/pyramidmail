import { Inbox, Tag, Users, Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { ThreadCategory } from "@/types/threads";

interface InboxTabsProps {
  activeCategory: ThreadCategory;
  onCategoryChange: (category: ThreadCategory) => void;
  counts: Record<ThreadCategory, number>;
}

const tabs: Array<{
  category: ThreadCategory;
  icon: typeof Inbox;
  translationKey: string;
}> = [
  { category: "principale", icon: Inbox, translationKey: "inbox.principale" },
  { category: "promotions", icon: Tag, translationKey: "inbox.promotions" },
];

export function InboxTabs({ activeCategory, onCategoryChange, counts }: InboxTabsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center border-b border-[#DFE5E7] bg-transparent overflow-x-auto no-scrollbar">
      {tabs.map(({ category, icon: Icon, translationKey }) => {
        const isActive = category === activeCategory;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={cn(
              "flex flex-1 items-center gap-2  px-4 py-2 text-sm font-semibold transition-colors duration-200",
              isActive
                ? "text-[#0087CA] border-b-2 border-[#0087CA] bg-[#EDF3F6]"
                : "text-[#091D35] hover:bg-[#EDF3F6]"
            )}
          >
            <Icon size={16} className={cn(isActive ? "text-[#0087CA]" : "text-[#091D35]")} />
            <span>{t(translationKey)}</span>
            {counts[category] > 0 && (
              <span className="ml-1 rounded-full bg-[#0087CA] px-2 py-0.5 text-[10px] font-semibold text-white">
                {counts[category]}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
