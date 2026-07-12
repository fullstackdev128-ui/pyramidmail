import * as React from "react";
import { cn } from "@/lib/utils";

const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="absolute left-full ml-2 hidden rounded bg-slate-900 px-2 py-1 text-xs text-white group-hover:block whitespace-nowrap z-50">
        {content}
      </div>
    </div>
  );
};

export { Tooltip };
