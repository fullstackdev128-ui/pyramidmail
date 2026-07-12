import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenu = ({ children }: { children: React.ReactNode }) => (
  <div className="relative inline-block text-left">{children}</div>
);

const DropdownMenuTrigger = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <div onClick={onClick} className="cursor-pointer">
    {children}
  </div>
);

const DropdownMenuContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
      className
    )}
  >
    <div className="py-1">{children}</div>
  </div>
);

const DropdownMenuItem = ({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-3.5 py-2.5 text-left text-sm text-[#091D35] hover:bg-slate-50 rounded-xl transition-all duration-200 gap-3 font-semibold",
      className
    )}
  >
    {children}
  </button>
);

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
