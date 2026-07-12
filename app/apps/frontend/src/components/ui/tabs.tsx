import * as React from "react";
import { cn } from "@/lib/utils";

const Tabs = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("w-full", className)}>{children}</div>
);

const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("flex border-b border-slate-200", className)}>{children}</div>
);

const TabsTrigger = ({
  children,
  value,
  activeValue,
  onClick,
  className,
}: {
  children: React.ReactNode;
  value: string;
  activeValue: string;
  onClick: (value: string) => void;
  className?: string;
}) => (
  <button
    onClick={() => onClick(value)}
    className={cn(
      "px-4 py-2 text-sm font-medium transition-all relative",
      activeValue === value ? "text-[#0087CA]" : "text-slate-500 hover:text-[#091D35]",
      className
    )}
  >
    {children}
    {activeValue === value && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0087CA]" />
    )}
  </button>
);

const TabsContent = ({
  children,
  value,
  activeValue,
  className,
}: {
  children: React.ReactNode;
  value: string;
  activeValue: string;
  className?: string;
}) => (activeValue === value ? <div className={cn("py-4", className)}>{children}</div> : null);

export { Tabs, TabsList, TabsTrigger, TabsContent };
