import { useState } from "react";
import { Check, X, ShieldAlert, Zap, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlan } from "@/hooks/usePlan";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/billing/PaymentModal";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlanFeature {
  text: string;
  included: boolean;
}

const FREE_FEATURES: PlanFeature[] = [
  { text: "15 Go de stockage", included: true },
  { text: "Accès messagerie complète", included: true },
  { text: "Recherche avancée", included: true },
  { text: "Publicités affichées", included: false },
  { text: "Support prioritaire", included: false },
  { text: "Multi-comptes", included: false },
  { text: "Domaines personnalisés", included: false },
];

const PREMIUM_FEATURES: PlanFeature[] = [
  { text: "50 Go de stockage", included: true },
  { text: "Accès messagerie complète", included: true },
  { text: "Recherche avancée", included: true },
  { text: "Sans publicité", included: true },
  { text: "Support prioritaire", included: true },
  { text: "Multi-comptes", included: true },
  { text: "Domaines personnalisés", included: true },
];

export function AdminBillingPage() {
  const { user } = useAuth();
  const { plan, isPremium, isLoading: isLoadingPlan } = usePlan();
  const { users, isLoadingUsers, updatePlan } = useAdmin();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const isSuperAdmin = user?.role === "superadmin";

  const handleTogglePlan = async (userId: string, currentPlan: string) => {
    const newPlan = currentPlan === "premium" ? "free" : "premium";
    try {
      await updatePlan({ id: userId, plan: newPlan });
    } catch (error) {
      alert("Erreur lors du changement de plan");
    }
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (isLoadingPlan || (isSuperAdmin && isLoadingUsers)) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0087CA]" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full h-full space-y-8 animate-in fade-in duration-500 overflow-y-auto pb-10 pr-2">
      {/* ===== EN-TÊTE ===== */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-[#162A42]">Abonnements & Facturation</h1>
            {isPremium ? (
              <Badge className="bg-amber-500 text-white text-xs font-semibold uppercase tracking-widest px-3 py-0.5 border-none">
                Premium ✨
              </Badge>
            ) : (
              <Badge className="bg-[#DFE5E7] text-[#091D35] text-xs font-semibold uppercase tracking-widest px-3 py-0.5 border-none">
                Gratuit
              </Badge>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            {isSuperAdmin
              ? "Gestion globale des abonnements utilisateurs"
              : "Choisissez le plan adapté à vos besoins"}
          </p>
        </div>
      </div>

      {/* ===== VUE SUPERADMIN : Liste des abonnés ===== */}
      {isSuperAdmin && (
        <div className="space-y-4 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 text-[#5B21B6]">
            <ShieldAlert size={20} />
            <h2 className="text-lg font-semibold">Panneau de contrôle SuperAdmin</h2>
          </div>
          <div className="bg-white border border-[#DFE5E7] rounded-2xl overflow-hidden shadow-sm">
            <ScrollArea className="max-h-[400px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[#EDF3F6] z-10">
                  <tr className="border-b border-[#DFE5E7]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider text-center">
                      Plan Actuel
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFB] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <UserIcon size={14} className="text-slate-400" />
                          <span className="font-medium text-[#162A42]">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {u.plan === "premium" ? (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-semibold">
                            Premium
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 font-semibold">
                            Gratuit
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleTogglePlan(u.id, u.plan)}
                          className={cn(
                            "h-8 font-semibold gap-2",
                            u.plan === "premium"
                              ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                              : "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          )}
                        >
                          <Zap size={14} />
                          {u.plan === "premium" ? "Rétrograder" : "Passer Premium"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </div>
          <Separator className="my-6" />
        </div>
      )}

      {/* ===== VUE UTILISATEUR : Comparaison des plans ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Carte Gratuit */}
        <div className="bg-white border border-[#DFE5E7] rounded-2xl p-6 space-y-5 flex flex-col shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#162A42]">Gratuit</h3>
            <p className="text-3xl font-semibold text-[#162A42]">
              0 FCFA <span className="text-base font-medium text-slate-400">/ mois</span>
            </p>
          </div>

          <Separator className="bg-[#DFE5E7]" />

          <ul className="space-y-3 flex-1">
            {FREE_FEATURES.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                {feature.included ? (
                  <Check size={16} className="text-green-500 shrink-0" />
                ) : (
                  <X size={16} className="text-red-400 shrink-0" />
                )}
                <span
                  className={cn("text-sm", feature.included ? "text-[#162A42]" : "text-slate-400")}
                >
                  {feature.text}
                </span>
              </li>
            ))}
          </ul>

          <Button
            disabled={!isPremium}
            variant="outline"
            className={cn(
              "w-full rounded-xl h-11 font-semibold mt-2",
              !isPremium
                ? "bg-slate-50 text-slate-400 border-slate-100"
                : "border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            )}
            onClick={() => isPremium && handleTogglePlan(user!.id, "premium")}
          >
            {!isPremium ? "Plan actuel" : "Rétrograder vers Free"}
          </Button>
        </div>

        {/* Carte Premium */}
        <div className="relative bg-[#EDF3F6] border-2 border-[#0087CA] rounded-2xl p-6 space-y-5 flex flex-col shadow-md">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#0087CA] text-white text-[10px] font-semibold uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">
              Recommandé
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#162A42]">Premium</h3>
            <p className="text-3xl font-semibold text-[#162A42]">
              2 900 FCFA <span className="text-base font-medium text-slate-400">/ mois</span>
            </p>
          </div>

          <Separator className="bg-[#9ACEE8]" />

          <ul className="space-y-3 flex-1">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3">
                <Check size={16} className="text-green-500 shrink-0" />
                <span className="text-sm text-[#162A42] font-medium">{feature.text}</span>
              </li>
            ))}
          </ul>

          <Button
            disabled={isPremium}
            className={cn(
              "w-full rounded-xl h-11 font-semibold mt-2",
              "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white",
              isPremium && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !isPremium && setShowPaymentModal(true)}
          >
            {isPremium ? "Plan actuel" : "Passer à Premium"}
          </Button>
        </div>
      </div>

      {/* ===== BLOC 3 — Historique (Mock) ===== */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#162A42]">Historique de facturation</h2>
        {!isPremium ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl flex items-center justify-center py-12 text-center">
            <p className="text-sm text-slate-400 font-medium">Aucune transaction pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#DFE5E7] rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DFE5E7] bg-[#EDF3F6]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[#162A42] uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50 last:border-none hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-[#162A42] font-medium">{formattedDate}</td>
                  <td className="py-3 px-4 text-[#091D35]">Abonnement Premium — 1 mois</td>
                  <td className="py-3 px-4 text-[#162A42] font-semibold">2 900 FCFA</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-700 border-none font-semibold">
                      Payé
                    </Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPaymentModal && <PaymentModal onClose={() => setShowPaymentModal(false)} />}
    </div>
  );
}
