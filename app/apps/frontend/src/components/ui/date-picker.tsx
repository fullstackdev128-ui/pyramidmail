import * as React from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function DatePicker({ className, ...props }: DatePickerProps) {
  return (
    <div className="relative">
      <input
        type="date"
        className={cn(
          "w-full h-10 rounded-xl bg-[#EDF3F6] border-none px-4 pr-10 text-sm font-medium text-[#091D35] focus:ring-1 focus:ring-[#0087CA] outline-none cursor-pointer",
          className
        )}
        {...props}
      />
      <Calendar
        size={16}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  );
}
