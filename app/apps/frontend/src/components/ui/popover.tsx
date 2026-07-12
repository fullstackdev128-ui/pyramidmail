import * as React from "react";
import * as ReactDOM from "react-dom";
import { cn } from "@/lib/utils";

export function Popover({
  children,
  trigger,
  className,
  openAbove = false,
}: {
  children: React.ReactNode;
  trigger: React.ReactNode;
  className?: string;
  openAbove?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [coords, setCoords] = React.useState<{ top: number; left: number; right: number } | null>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const fromRight = window.innerWidth - rect.right;
      if (openAbove) {
        setCoords({ top: rect.top - 8, left: rect.left, right: fromRight });
      } else {
        setCoords({ top: rect.bottom + 8, left: rect.left, right: fromRight });
      }
    }
  };

  const handleToggle = () => {
    if (!isOpen) updateCoords();
    setIsOpen(!isOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = triggerRef.current?.contains(target);
      const clickedPopover = popoverRef.current?.contains(target);
      if (!clickedTrigger && !clickedPopover) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && coords && ReactDOM.createPortal(
        <div
          ref={popoverRef}
          style={
            openAbove
              ? { position: "fixed", bottom: window.innerHeight - coords.top, right: coords.right, zIndex: 9999 }
              : { position: "fixed", top: coords.top, right: coords.right, zIndex: 9999 }
          }
          className={cn(
            "bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in duration-200",
            className
          )}
        >
          {children}
        </div>,
        document.body
      )}
    </div>
  );
}
