import * as React from "react";
import { useState, Suspense } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RightPanel } from "./RightPanel";
import { ComposeFab } from "./ComposeFab";
import { ComposeModal } from "../compose/ComposeModal";
import { BottomBanner } from "@/components/ads/BottomBanner";
import { cn } from "@/lib/utils";
import { useLayoutStore } from "@/store/useLayoutStore";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isDrawerOpen, closeDrawer } = useLayoutStore();

  return (
    <div className="h-dvh bg-[#EDF3F6] font-sans text-[#091D35] overflow-x-hidden overflow-y-hidden">
      <Header />
      <div className="flex pt-16 h-full">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={setIsCollapsed}
          isDrawerOpen={isDrawerOpen}
          onClose={closeDrawer}
        />
        <main
          className={cn(
            "flex-1 min-w-0 p-4 md:p-6 overflow-hidden bg-[#EDF3F6] pb-11 transition-all duration-200",
            isCollapsed ? "lg:ml-[56px] lg:mr-[56px]" : "lg:ml-[240px] lg:mr-[56px]"
          )}
        >
          <div className="w-full h-full flex flex-col">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><span className="text-[#0087CA] font-semibold animate-pulse">Chargement...</span></div>}>
              {children}
            </Suspense>
          </div>
        </main>
        <RightPanel />
      </div>
      <ComposeFab />
      <ComposeModal />
      <BottomBanner sidebarCollapsed={isCollapsed} />
    </div>
  );
}
