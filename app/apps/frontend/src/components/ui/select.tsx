import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string }[];
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full h-10 appearance-none rounded-xl bg-[#EDF3F6] border-none px-4 pr-10 text-sm font-medium text-[#091D35] focus:ring-1 focus:ring-[#0087CA] outline-none cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}
