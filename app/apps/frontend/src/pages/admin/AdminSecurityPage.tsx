import { useState } from "react";
import { Shield, Monitor, Loader2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAdminSecurity } from "@/hooks/useAdmin";
import { ActiveSessionCard } from "@/components/security/ActiveSessionCard";
import { SecurityAlertCard } from "@/components/security/SecurityAlertCard";
import { ConnectionHistoryTable } from "@/components/security/ConnectionHistoryTable";

export function AdminSecurityPage() {
  const { data: securityData, isLoading, isError } = useAdminSecurity();

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#0087CA]" size={32} />
        <p className="text-sm text-slate-400 font-semibold">Chargement des données de sécurité...</p>
      </div>
    );
  }

  if (isError || !securityData) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-sm text-slate-400 font-semibold">Erreur lors du chargement des logs.</p>
      </div>
    );
  }

  const { connectionHistory, securityAlerts, activeSessions, unresolvedAlertsCount } = securityData;

  const totalConnections = connectionHistory.length;
  const failedConnections = connectionHistory.filter((h: any) => h.status === "failed").length;

  return (
    <div className="space-y-6 h-full min-h-0 overflow-y-auto pb-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#162A42] flex items-center space-x-2">
            <Shield className="h-6 w-6 text-[#0087CA]" />
            <span>Sécurité & Logs</span>
          </h1>
          <p className="text-[#091D35] mt-1">
            Surveillance globale et historique des accès système
          </p>
        </div>
        {unresolvedAlertsCount > 0 && (
          <Badge className="bg-red-500 text-white border-none animate-pulse">
            {unresolvedAlertsCount} Alerte{unresolvedAlertsCount > 1 ? "s" : ""} active
            {unresolvedAlertsCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#DFE5E7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Monitor className="h-5 w-5 text-green-500" />
            <Badge variant="outline" className="text-green-500 border-green-100 bg-green-50">
              Actif
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-[#162A42]">{activeSessions}</p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Sessions Actives</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFE5E7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Shield className="h-5 w-5 text-blue-500" />
            <Badge variant="outline" className="text-blue-500 border-blue-100 bg-blue-50">
              Global
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-[#162A42]">{totalConnections}</p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Connexions (24h)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#DFE5E7] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <Badge variant="outline" className="text-red-500 border-red-100 bg-red-50">
              Critique
            </Badge>
          </div>
          <p className="text-2xl font-semibold text-[#162A42]">{failedConnections}</p>
          <p className="text-xs text-slate-400 font-semibold uppercase mt-1">Échecs d'accès</p>
        </div>
      </div>

      {/* Security Alerts */}
      <div className="bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#162A42]">Alertes de sécurité système</h2>
          <p className="text-sm text-[#091D35]">
            Incidents détectés sur l'ensemble de la plateforme
          </p>
        </div>
        <Separator className="bg-[#DFE5E7]" />
        <div className="space-y-3">
          {securityAlerts.map((alert: any) => (
            <SecurityAlertCard
              key={alert.id}
              alert={alert}
              onResolve={() => console.log("Resolving alert", alert.id)}
            />
          ))}
        </div>
      </div>

      {/* Connection History */}
      <div className="bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-[#162A42]">Historique des connexions</h2>
          <p className="text-sm text-[#091D35]">Journal global des tentatives d'accès</p>
        </div>
        <Separator className="bg-[#DFE5E7]" />
        <ConnectionHistoryTable history={connectionHistory} />
      </div>
    </div>
  );
}
