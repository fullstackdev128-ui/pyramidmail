import { useMemo } from "react";
import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Send,
  HardDrive,
  AlertCircle,
  UserPlus,
  Mail,
  Shield,
  UserX,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/hooks/useAdmin";

// ── Mock Data (Activity charts remain mock for now as they are complex to compute) ──

const emailActivity = [
  { day: "Lun", sent: 320, received: 480 },
  { day: "Mar", sent: 280, received: 390 },
  { day: "Mer", sent: 450, received: 520 },
  { day: "Jeu", sent: 380, received: 430 },
  { day: "Ven", sent: 510, received: 610 },
  { day: "Sam", sent: 120, received: 180 },
  { day: "Dim", sent: 90, received: 140 },
];

const storageData = [
  { name: "Emails", value: 45, color: "#0087CA" },
  { name: "Pièces jointes", value: 35, color: "#9ACEE8" },
  { name: "Brouillons", value: 12, color: "#DFE5E7" },
  { name: "Spam", value: 8, color: "#F59E0B" },
];

interface ActivityItem {
  icon: string;
  color: string;
  text: string;
  time: string;
}

const recentActivity: ActivityItem[] = [
  {
    icon: "UserPlus",
    color: "#10B981",
    text: "Nouvel utilisateur : Sophie Nkomo",
    time: "Il y a 2 min",
  },
  {
    icon: "Mail",
    color: "#0087CA",
    text: "48 392 emails traités aujourd'hui",
    time: "Il y a 15 min",
  },
  { icon: "AlertCircle", color: "#F59E0B", text: "Ticket support #23 ouvert", time: "Il y a 1h" },
  { icon: "Shield", color: "#10B981", text: "Sauvegarde automatique réussie", time: "Il y a 2h" },
  { icon: "UserX", color: "#EF4444", text: "Compte suspendu : Carlos Mendez", time: "Il y a 3h" },
  {
    icon: "CreditCard",
    color: "#0087CA",
    text: "Upgrade Premium : Marie Dupont",
    time: "Il y a 5h",
  },
  { icon: "HardDrive", color: "#F59E0B", text: "Stockage à 80% de capacité", time: "Il y a 6h" },
  { icon: "CheckCircle2", color: "#10B981", text: "Maintenance planifiée terminée", time: "Hier" },
];

// ── Helpers ──

function formatDateFR(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatStorage(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

const iconMap: Record<string, LucideIcon> = {
  UserPlus,
  Mail,
  AlertCircle,
  Shield,
  UserX,
  CreditCard,
  HardDrive,
  CheckCircle2,
};

// ── Custom Tooltip for AreaChart ──

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string; payload?: { day: string } }[];
}) {
  if (!active || !payload) return null;
  return (
    <div className="bg-white border border-[#DFE5E7] rounded-lg p-3 shadow-sm">
      <p className="text-xs font-semibold text-[#162A42] mb-1">{payload[0]?.payload?.day}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-600">{entry.name === "sent" ? "Envoyés" : "Reçus"} :</span>
          <span className="font-semibold text-[#162A42]">{entry.value.toLocaleString("fr-FR")}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ──

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { stats, users, isLoadingStats, isLoadingUsers } = useAdmin();

  const todayStr = useMemo(() => formatDateFR(new Date()), []);

  const metricCards = [
    {
      icon: Users,
      iconBg: "#DBEAFE",
      iconColor: "#1E40AF",
      value: stats?.totalUsers?.toLocaleString() ?? "...",
      label: "Utilisateurs totaux",
      variation: stats?.activeUsers ? `${stats.activeUsers} actifs (30j)` : "Calcul...",
      positive: true,
    },
    {
      icon: Send,
      iconBg: "#D1FAE5",
      iconColor: "#065F46",
      value: stats?.totalEmails?.toLocaleString() ?? "...",
      label: "Emails cumulés",
      variation: stats?.emailsToday ? `+${stats.emailsToday} aujourd'hui` : "...",
      positive: true,
    },
    {
      icon: HardDrive,
      iconBg: "#FEF3C7",
      iconColor: "#92400E",
      value: stats ? formatStorage(stats.storageUsed) : "...",
      label: "Stockage utilisé",
      variation: "Pièces jointes incluses",
      positive: true,
    },
    {
      icon: AlertCircle,
      iconBg: "#FEE2E2",
      iconColor: "#991B1B",
      value: stats?.newUsersMonth?.toString() ?? "...",
      label: "Nouveaux (ce mois)",
      variation: "Croissance continue",
      positive: true,
    },
  ];

  if (isLoadingStats || isLoadingUsers) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0087CA]" size={32} />
      </div>
    );
  }

  const recentUsersList = users.slice(0, 8);

  return (
    <div className="w-full h-full space-y-6 animate-in fade-in duration-500 overflow-y-auto pr-2">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#162A42]">Dashboard</h1>
            <Badge className="bg-[#EDF3F6] text-[#0087CA] border border-[#9ACEE8] text-xs font-semibold">
              Vue Globale
            </Badge>
          </div>
          <p className="text-sm text-slate-500">Données réelles du système NestJS/PostgreSQL</p>
        </div>
        <p className="text-sm text-slate-400 font-medium capitalize">{todayStr}</p>
      </div>

      {/* ===== RANG 1 — 4 cartes métriques ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: card.iconBg }}
                >
                  <Icon size={20} style={{ color: card.iconColor }} />
                </div>
                <span className="text-[13px] text-slate-500 font-semibold">{card.label}</span>
              </div>
              <div className="text-2xl font-semibold text-[#162A42]">{card.value}</div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  card.positive ? "text-[#10B981]" : "text-[#EF4444]"
                )}
              >
                {card.variation}
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== RANG 2 — Graphique activité + Stockage ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activité emails (2/3) */}
        <div className="lg:col-span-2 bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#162A42]">
              Activité emails — 7 derniers jours (Simulation)
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={emailActivity}>
              <defs>
                <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0087CA" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0087CA" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorReceived" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ACEE8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#9ACEE8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#DFE5E7" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<CustomTooltip />} />
              <RechartsLegend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                type="monotone"
                dataKey="sent"
                name="Envoyés"
                stroke="#0087CA"
                fillOpacity={1}
                fill="url(#colorSent)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="received"
                name="Reçus"
                stroke="#9ACEE8"
                fillOpacity={1}
                fill="url(#colorReceived)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition stockage (1/3) */}
        <div className="bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-4 shadow-sm">
          <h2 className="text-base font-semibold text-[#162A42]">Répartition du stockage</h2>
          <div className="flex flex-col items-center">
            <div className="relative">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie
                    data={storageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {storageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-semibold text-[#162A42]">
                  {stats ? formatStorage(stats.storageUsed) : "0 B"}
                </span>
                <span className="text-xs text-slate-400 font-semibold">Total</span>
              </div>
            </div>

            {/* Legend */}
            <div className="w-full space-y-2 mt-2">
              {storageData.map((entry) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs text-[#091D35] font-medium">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#162A42]">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== RANG 3 — Tableau utilisateurs + Activité récente ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Utilisateurs récents (60% ≈ 3/5) */}
        <div className="lg:col-span-3 bg-white border border-[#DFE5E7] rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-base font-semibold text-[#162A42]">Utilisateurs récents</h2>
            <button
              onClick={() => navigate("/admin/team")}
              className="text-sm font-semibold text-[#0087CA] hover:underline flex items-center gap-1"
            >
              Gérer l'équipe
              <ExternalLink size={14} />
            </button>
          </div>
          <Separator className="bg-[#DFE5E7]" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#EDF3F6]">
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Inscrit le
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsersList.map((user, i) => (
                  <tr
                    key={user.email}
                    className={cn(
                      "border-b border-slate-50 last:border-none transition-colors hover:bg-[#EDF3F6]/50",
                      i % 2 === 1 && "bg-[#F8FAFB]"
                    )}
                  >
                    {/* Utilisateur */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0087CA] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                          {getInitials(user.displayName || user.email)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#162A42] truncate">
                            {user.displayName || "Sans nom"}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Plan */}
                    <td className="py-3 px-4">
                      {user.plan === "premium" ? (
                        <Badge className="bg-amber-500 text-white text-[9px] font-semibold uppercase border-none">
                          Premium
                        </Badge>
                      ) : (
                        <Badge className="bg-[#DFE5E7] text-[#091D35] text-[9px] font-semibold uppercase border-none">
                          Gratuit
                        </Badge>
                      )}
                    </td>
                    {/* Rôle */}
                    <td className="py-3 px-4">
                      {user.role === "superadmin" ? (
                        <Badge className="bg-[#EDE9FE] text-[#5B21B6] text-[9px] font-semibold uppercase border-none">
                          SuperAdmin
                        </Badge>
                      ) : (
                        <Badge className="bg-[#F3F4F6] text-[#374151] text-[9px] font-semibold uppercase border-none">
                          {user.role}
                        </Badge>
                      )}
                    </td>
                    {/* Inscrit le */}
                    <td className="py-3 px-4 text-xs text-[#091D35] font-medium">
                      {formatDateShort(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activité récente (40% ≈ 2/5) */}
        <div className="lg:col-span-2 bg-white border border-[#DFE5E7] rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 pb-3">
            <h2 className="text-base font-semibold text-[#162A42]">Activité récente (Logs)</h2>
          </div>
          <Separator className="bg-[#DFE5E7]" />
          <div className="flex-1 overflow-y-auto p-4 space-y-0" style={{ maxHeight: "320px" }}>
            {recentActivity.map((item, i) => {
              const IconComponent = iconMap[item.icon];
              return (
                <div key={i} className="flex items-start gap-3 py-2.5">
                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={
                      {
                        backgroundColor: `${item.color}15`,
                        color: item.color,
                      } satisfies CSSProperties
                    }
                  >
                    {IconComponent && <IconComponent size={16} />}
                  </div>
                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#091D35] leading-snug">{item.text}</p>
                  </div>
                  {/* Time */}
                  <span className="text-[11px] text-slate-400 font-medium shrink-0 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
