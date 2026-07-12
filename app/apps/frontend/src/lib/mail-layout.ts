import { cn } from "@/lib/utils";

/** List column: full width on mobile/tablet, 320px from lg */
export function mailListColumnClass(hidden: boolean) {
  return cn(
    "flex flex-col bg-white border-r border-slate-100 shrink-0 w-full lg:w-[320px] min-w-0 overflow-hidden",
    hidden && "hidden"
  );
}

/** Read column: hidden on mobile/tablet when showing list only */
export function mailReadColumnClass(hidden: boolean) {
  return cn("flex-1 flex flex-col bg-white min-w-0 min-h-0 overflow-hidden", hidden && "hidden");
}

/** Tasks list column */
export function panelListColumnClass(hidden: boolean) {
  return cn(
    "shrink-0 flex flex-col bg-white rounded-2xl border border-[#DFE5E7] overflow-hidden w-full lg:w-[320px] min-w-0",
    hidden && "hidden"
  );
}

/** Calendar side panel (detail / form) */
export function panelSideColumnClass(hidden: boolean) {
  return cn(
    "shrink-0 flex flex-col bg-white rounded-2xl border border-[#DFE5E7] overflow-hidden w-full lg:w-[300px] min-w-0",
    hidden && "hidden"
  );
}

export function panelDetailColumnClass(hidden: boolean) {
  return cn(
    "flex-1 bg-white rounded-2xl border border-[#DFE5E7] overflow-hidden flex flex-col min-w-0 min-h-0",
    hidden && "hidden"
  );
}
