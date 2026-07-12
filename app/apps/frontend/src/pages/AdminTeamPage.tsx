import React, { useState, useMemo } from "react";
import {
  Users,
  Search,
  X,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
  User,
  Mail,
  Calendar,
  Database,
  Send,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdmin, AdminUser } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";

// --- Helper Components ---

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center gap-2 text-sm">
    <span className="text-slate-500">{label}</span>
    <span className="font-semibold text-[#0087CA]">{value}</span>
  </div>
);

const RoleBadge = ({ role }: { role: string }) => {
  const styles =
    role === "superadmin"
      ? "bg-[#EDE9FE] text-[#5B21B6] border-none"
      : "bg-[#F3F4F6] text-[#374151] border-none";
  return (
    <Badge className={cn(styles, "capitalize")}>
      {role === "superadmin" ? "SuperAdmin" : "Utilisateur"}
    </Badge>
  );
};

const PlanBadge = ({ plan }: { plan: string }) => {
  const styles =
    plan === "premium"
      ? "bg-amber-500 text-white border-none"
      : "bg-[#DFE5E7] text-[#091D35] border-none";
  return (
    <Badge className={cn(styles, "capitalize")}>{plan === "premium" ? "Premium" : "Gratuit"}</Badge>
  );
};

const MemberAvatar = ({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-9 w-9 text-sm",
    lg: "h-14 w-14 text-lg",
  };
  return (
    <Avatar className={cn(sizeClasses[size], "bg-[#0087CA] text-white")}>
      <AvatarFallback className="bg-inherit text-inherit font-semibold">{initials}</AvatarFallback>
    </Avatar>
  );
};

// --- Main Page Component ---

export function AdminTeamPage() {
  const { user: currentUser } = useAuth();
  const { users, isLoadingUsers, updateRole, updatePlan, deleteUser } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterPlan, setFilterPlan] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const selectedMember = useMemo(
    () => users.find((u) => u.id === selectedUserId),
    [users, selectedUserId]
  );

  const filteredMembers = useMemo(() => {
    return users.filter((m) => {
      const matchesSearch =
        (m.displayName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = filterRole === "all" || m.role === filterRole;
      const matchesPlan = filterPlan === "all" || m.plan === filterPlan;
      return matchesSearch && matchesRole && matchesPlan;
    });
  }, [users, searchQuery, filterRole, filterPlan]);

  const stats = useMemo(() => {
    return {
      total: users.length,
      superadmins: users.filter((u) => u.role === "superadmin").length,
      premium: users.filter((u) => u.plan === "premium").length,
    };
  }, [users]);

  const handleDelete = async (id: string, name: string) => {
    if (id === currentUser?.id) {
      alert("Vous ne pouvez pas vous supprimer vous-même.");
      return;
    }
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${name} ?`)) {
      try {
        await deleteUser(id);
        if (selectedUserId === id) setSelectedUserId(null);
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleRoleChange = async (id: string, role: string) => {
    if (id === currentUser?.id) {
      alert("Vous ne pouvez pas modifier votre propre rôle.");
      return;
    }
    try {
      await updateRole({ id, role });
    } catch (error) {
      alert("Erreur lors du changement de rôle");
    }
  };

  const handlePlanChange = async (id: string, plan: string) => {
    try {
      await updatePlan({ id, plan });
    } catch (error) {
      alert("Erreur lors du changement de plan");
    }
  };

  const hasActiveFilters = searchQuery !== "" || filterRole !== "all" || filterPlan !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setFilterRole("all");
    setFilterPlan("all");
  };

  if (isLoadingUsers) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0087CA]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-6 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div className="space-y-1">
          <h1 className="text-[24px] font-semibold text-[#162A42]">Gestion d'équipe</h1>
          <p className="text-sm text-slate-500">Données réelles synchronisées avec NestJS</p>
          <div className="flex items-center gap-3 pt-2">
            <StatItem label="Membres" value={stats.total} />
            <span className="text-slate-300">|</span>
            <StatItem label="SuperAdmins" value={stats.superadmins} />
            <span className="text-slate-300">|</span>
            <StatItem label="Premium" value={stats.premium} />
          </div>
        </div>
        <Button className="bg-[#0087CA] hover:bg-[#0076B0] text-white flex gap-2">
          <UserPlus size={18} />
          Inviter (Coming Soon)
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-4 bg-white border-b overflow-x-auto">
        <div className="relative w-[280px] shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            placeholder="Nom ou email..."
            className="pl-9 bg-[#F8FAFB] border-slate-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-[160px] bg-[#F8FAFB]"
          options={[
            { label: "Tous les rôles", value: "all" },
            { label: "SuperAdmin", value: "superadmin" },
            { label: "Utilisateur", value: "user" },
          ]}
        />

        <Select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value)}
          className="w-[160px] bg-[#F8FAFB]"
          options={[
            { label: "Tous les plans", value: "all" },
            { label: "Gratuit", value: "free" },
            { label: "Premium", value: "premium" },
          ]}
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-slate-400 hover:text-red-500 w-9 px-0"
          >
            <X size={18} />
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table Section */}
        <div className="flex-1 flex flex-col min-w-0 border-r overflow-hidden bg-white">
          <ScrollArea className="flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-[#EDF3F6] border-b">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#162A42] uppercase tracking-wider text-center">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#162A42] uppercase tracking-wider text-center">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-[12px] font-semibold text-[#162A42] uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-[#162A42] uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedUserId(member.id)}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-[#EDF3F6]",
                        index % 2 === 0 ? "bg-white" : "bg-[#F8FAFB]",
                        selectedUserId === member.id &&
                          "bg-[#DBEAFE] border-l-[3px] border-[#0087CA]"
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <MemberAvatar name={member.displayName || member.email} />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-[#162A42] truncate">
                              {member.displayName || "Sans nom"}
                            </span>
                            <span className="text-xs text-slate-500 truncate">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <RoleBadge role={member.role} />
                      </td>
                      <td className="px-4 py-4 text-center">
                        <PlanBadge plan={member.plan} />
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleString()
                          : "Jamais"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPlan = member.plan === "premium" ? "free" : "premium";
                              handlePlanChange(member.id, newPlan);
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                            title="Toggle Premium"
                          >
                            <Zap size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const newRole = member.role === "superadmin" ? "user" : "superadmin";
                              handleRoleChange(member.id, newRole);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Toggle SuperAdmin"
                          >
                            <ShieldCheck size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(member.id, member.displayName || member.email);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-400">
                        <Users size={48} className="opacity-20" />
                        <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
                        <Button variant="outline" size="sm" onClick={resetFilters}>
                          Réinitialiser
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>

        {/* Right Panel */}
        <div className="w-[360px] shrink-0 bg-[#F8FAFB] flex flex-col border-l min-h-0 overflow-y-auto">
          {selectedMember ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
              <div className="p-6 space-y-6">
                <div className="flex flex-col items-center text-center gap-3">
                  <MemberAvatar
                    name={selectedMember.displayName || selectedMember.email}
                    size="lg"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-[#162A42]">
                      {selectedMember.displayName || "Sans nom"}
                    </h2>
                    <p className="text-sm text-slate-500">{selectedMember.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <RoleBadge role={selectedMember.role} />
                    <PlanBadge plan={selectedMember.plan} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DetailStatCard
                    icon={<Database size={16} />}
                    label="ID"
                    value={selectedMember.id.slice(0, 8)}
                  />
                  <DetailStatCard
                    icon={<Calendar size={16} />}
                    label="Inscrit le"
                    value={new Date(selectedMember.createdAt).toLocaleDateString()}
                  />
                </div>

                <div className="pt-6 space-y-3">
                  <h3 className="text-sm font-semibold text-[#162A42] uppercase tracking-wider px-1">
                    Actions Administrateur
                  </h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold"
                      onClick={() =>
                        handleRoleChange(
                          selectedMember.id,
                          selectedMember.role === "superadmin" ? "user" : "superadmin"
                        )
                      }
                    >
                      <ShieldCheck size={18} />
                      {selectedMember.role === "superadmin"
                        ? "Rétrograder en User"
                        : "Promouvoir SuperAdmin"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold"
                      onClick={() =>
                        handlePlanChange(
                          selectedMember.id,
                          selectedMember.plan === "premium" ? "free" : "premium"
                        )
                      }
                    >
                      <Zap size={18} />
                      {selectedMember.plan === "premium" ? "Passer en Free" : "Passer en Premium"}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 border-red-200 text-red-700 hover:bg-red-50 font-semibold"
                      onClick={() =>
                        handleDelete(
                          selectedMember.id,
                          selectedMember.displayName || selectedMember.email
                        )
                      }
                    >
                      <Trash2 size={18} />
                      Supprimer le compte
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
              <div className="w-16 h-16 bg-[#EDF3F6] rounded-full flex items-center justify-center">
                <Users size={32} className="text-[#9ACEE8]" />
              </div>
              <p className="text-slate-500 font-medium">
                Sélectionnez un membre pour voir ses détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailStatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon}
        <span className="text-[10px] uppercase font-semibold tracking-tight">{label}</span>
      </div>
      <div className="text-sm font-semibold text-[#162A42]">{value}</div>
    </div>
  );
}
