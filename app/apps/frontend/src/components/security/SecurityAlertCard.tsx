import { ShieldAlert, MapPin, KeyRound, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SecurityAlert } from "@/hooks/useSecurity";

interface SecurityAlertCardProps {
  alert: SecurityAlert;
  onResolve: (id: string) => void;
}

const severityColors = {
  critical: "#DC2626",
  high: "#EA580C",
  medium: "#CA8A04",
  low: "#16A34A",
};

const typeIcons = {
  brute_force: ShieldAlert,
  unusual_location: MapPin,
  password_change: KeyRound,
  account_locked: Lock,
};

export function SecurityAlertCard({ alert, onResolve }: SecurityAlertCardProps) {
  const Icon = typeIcons[alert.type];
  const severityColor = severityColors[alert.severity];

  const date = new Date(alert.date);

  return (
    <div className="bg-white border border-[#DFE5E7] rounded-xl p-4">
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-[#0087CA] mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{ backgroundColor: severityColor + "20", color: severityColor }}
            >
              {alert.severity.toUpperCase()}
            </Badge>
            <span className="text-xs text-[#091D35]">
              {date.toLocaleDateString("fr-FR")} à{" "}
              {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <p className="text-sm text-[#162A42] mb-1">{alert.message}</p>
          <p className="text-xs text-[#091D35]">Utilisateur : {alert.user}</p>
        </div>
        {!alert.resolved && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onResolve(alert.id)}
            className="text-xs bg-[#0087CA] text-white hover:bg-[#006fa8] border-[#0087CA]"
          >
            Marquer comme résolue
          </Button>
        )}
        {alert.resolved && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            Résolue
          </Badge>
        )}
      </div>
    </div>
  );
}
