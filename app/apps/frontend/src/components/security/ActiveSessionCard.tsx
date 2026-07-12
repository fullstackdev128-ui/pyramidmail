import { Monitor, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActiveSession } from "@/hooks/useSecurity";

interface ActiveSessionCardProps {
  session: ActiveSession;
  onTerminate: (id: string) => void;
}

export function ActiveSessionCard({ session, onTerminate }: ActiveSessionCardProps) {
  const isMobile =
    session.device.toLowerCase().includes("ios") ||
    session.device.toLowerCase().includes("android");
  const Icon = isMobile ? Smartphone : Monitor;

  const startedAt = new Date(session.startedAt);
  const now = new Date();
  const durationMs = now.getTime() - startedAt.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const duration = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  return (
    <div className="bg-white border border-[#DFE5E7] rounded-xl p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <Icon className="h-5 w-5 text-[#0087CA] mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-sm font-medium text-[#162A42]">{session.device}</span>
              {session.isCurrent && (
                <Badge variant="secondary" className="bg-[#9ACEE8] text-[#162A42] text-xs">
                  Session actuelle
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#091D35] mb-1">
              {session.ip} • {session.location}
            </p>
            <p className="text-xs text-[#091D35]">
              Démarrée le {startedAt.toLocaleDateString("fr-FR")} à{" "}
              {startedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}(
              {duration})
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onTerminate(session.id)}
          disabled={session.isCurrent}
          className={cn(
            "text-xs border-red-500 text-red-500 hover:bg-red-50",
            session.isCurrent && "opacity-50 cursor-not-allowed"
          )}
        >
          Révoquer
        </Button>
      </div>
    </div>
  );
}
