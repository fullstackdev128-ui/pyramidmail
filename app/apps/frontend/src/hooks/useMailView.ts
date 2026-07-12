import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useIsDesktop } from "@/hooks/useBreakpoint";

export function useMailView(
  selectedThreadId: string | null,
  setSelectedThreadId: (id: string | null) => void
) {
  const isDesktop = useIsDesktop(); // >= 1024px
  const isMobileOrTablet = !isDesktop; // < 1024px
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync URL → state
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      if (urlId !== selectedThreadId) {
        setSelectedThreadId(urlId);
      }
    } else {
      if (selectedThreadId !== null) {
        setSelectedThreadId(null);
      }
    }
  }, [searchParams, selectedThreadId, setSelectedThreadId]);

  // Derive view from state
  const view = isMobileOrTablet ? (selectedThreadId ? "read" : "list") : "list"; // desktop always shows both panels

  const openThread = (id: string) => {
    setSelectedThreadId(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("id", id);
      return next;
    });
  };

  const closeThread = () => {
    setSelectedThreadId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("id");
      return next;
    });
  };

  return {
    view,
    openThread,
    closeThread,
    isDesktop,
    isMobileOrTablet,
  };
}
