import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon: Icon, title, subtitle }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
      <div className="w-20 h-20 bg-[#EDF3F6] rounded-full flex items-center justify-center text-[#9ACEE8]">
        <Icon size={40} />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-[#162A42]">{title}</h3>
        {subtitle && <p className="text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
