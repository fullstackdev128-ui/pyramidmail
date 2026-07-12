import { useState, useEffect } from "react";
import {
  User,
  Palette,
  PenTool,
  Bell,
  Filter,
  ShieldCheck,
  Mail,
  Globe,
  Moon,
  Sun,
  Check,
  Monitor,
  Volume2,
  Lock,
  Smartphone,
  History,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  Plus as PlusIcon,
  LayoutDashboard,
  Users as UsersIcon,
  Code2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useUserSettings, useUpdateSettings, UserSettingsData } from "@/hooks/useUserSettings";
import { useSecurity } from "@/hooks/useSecurity";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/useAuth";
import { usePlan } from "@/hooks/usePlan";
import { Link } from "react-router-dom";

type SettingsSection =
  | "general"
  | "appearance"
  | "signature"
  | "notifications"
  | "filters"
  | "accounts"
  | "vacation"
  | "security"
  | "administration";

export function SettingsPage() {
  const { showToast } = useToast();
  const { user } = useAuth();
  const { plan } = usePlan();
  const [activeSection, setActiveSection] = useState<SettingsSection>("general");
  const { data: settings, isLoading, isError } = useUserSettings();
  const updateSettingsMutation = useUpdateSettings();
  const {
    securityInfo,
    sessions,
    revokeSession,
    revokeAllSessions,
    changePassword,
    isChangingPassword,
  } = useSecurity();

  const [localSettings, setLocalSettings] = useState<Partial<UserSettingsData>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const sections: { id: SettingsSection; label: string; icon: any }[] = [
    { id: "general", label: "Général", icon: User },
    { id: "appearance", label: "Apparence", icon: Palette },
    { id: "signature", label: "Signature", icon: PenTool },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "filters", label: "Filtres & Bloqués", icon: Filter },
    { id: "accounts", label: "Comptes & Import", icon: Mail },
    { id: "vacation", label: "Réponse automatique", icon: Globe },
    { id: "security", label: "Sécurité", icon: ShieldCheck },
  ];

  if (plan === "premium" || user?.role === "superadmin") {
    sections.push({ id: "administration", label: "Administration", icon: LayoutDashboard });
  }

  const handleUpdate = (updates: Partial<UserSettingsData>) => {
    setLocalSettings((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    try {
      await updateSettingsMutation.mutateAsync(localSettings);
      showToast("Paramètres sauvegardés", "success");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      showToast("Erreur lors de la sauvegarde", "error");
      console.error("Failed to update settings", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#0087CA]" size={40} />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-[#162A42]">Erreur de chargement</h2>
        <p className="text-slate-500 mb-6">Impossible de récupérer vos paramètres.</p>
        <Button onClick={() => window.location.reload()} className="bg-[#0087CA] rounded-xl">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
      <div className="px-4 md:px-8 pt-6 pb-2 shrink-0 border-b border-slate-100">
        <h1 className="text-xl font-semibold text-[#162A42]">Paramètres</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Gérez votre expérience Pyramid Mail
        </p>
        <nav
          className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1"
          aria-label="Sections des paramètres"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeSection === section.id
                  ? "bg-[#DFE5E7] text-[#0087CA] border-b-2 border-[#0087CA]"
                  : "text-slate-500 hover:bg-[#EDF3F6] hover:text-[#162A42]"
              )}
            >
              <section.icon
                size={16}
                className={activeSection === section.id ? "text-[#0087CA]" : "text-slate-400"}
              />
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto p-4 md:p-8 lg:p-12 space-y-12">
            {activeSection === "general" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Général</h2>
                  <p className="text-sm text-slate-500">
                    Langue, fuseau horaire et préférences de base.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#162A42]">
                      Langue de l'interface
                    </label>
                    <select
                      className="w-full h-11 bg-[#EDF3F6] border-none rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20"
                      value={localSettings.language}
                      onChange={(e) => handleUpdate({ language: e.target.value })}
                    >
                      <option value="fr">Français (Cameroun)</option>
                      <option value="en">English (US)</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#162A42]">Fuseau horaire</label>
                    <select
                      className="w-full h-11 bg-[#EDF3F6] border-none rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20"
                      value={localSettings.timezone}
                      onChange={(e) => handleUpdate({ timezone: e.target.value })}
                    >
                      <option value="Africa/Douala">GMT+01:00 Douala, Cameroun</option>
                      <option value="UTC">UTC (Universal Coordinated Time)</option>
                    </select>
                  </div>

                  <div className="bg-[#EDF3F6] rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                        Stockage Cloud
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 w-full bg-white rounded-full overflow-hidden">
                        <div className="h-full bg-[#0087CA] w-[65%]" />
                      </div>
                      <div className="flex justify-between text-[10px] font-semibold">
                        <span className="text-slate-500">9.7 GB utilisé</span>
                        <span className="text-[#162A42]">15 GB total</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-[#162A42]">Densité d'affichage</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["compact", "normal", "comfortable"].map((d) => (
                        <button
                          key={d}
                          onClick={() => handleUpdate({ density: d })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            localSettings.density === d
                              ? "border-[#0087CA] bg-[#EDF3F6] text-[#0087CA]"
                              : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                          )}
                        >
                          <Monitor size={20} />
                          <span className="text-xs font-semibold capitalize">{d}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "appearance" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Apparence</h2>
                  <p className="text-sm text-slate-500">
                    Personnalisez le look de votre boîte mail.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-4">
                    <label className="text-sm font-semibold text-[#162A42]">Thème</label>
                    <div className="grid grid-cols-3 gap-4">
                      {["light", "dark", "system"].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleUpdate({ theme: t })}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2",
                            localSettings.theme === t
                              ? "border-[#0087CA] bg-[#EDF3F6] text-[#0087CA]"
                              : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                          )}
                        >
                          {t === "light" ? (
                            <Sun size={20} />
                          ) : t === "dark" ? (
                            <Moon size={20} />
                          ) : (
                            <Monitor size={20} />
                          )}
                          <span className="text-xs font-semibold capitalize">
                            {t === "light" ? "Clair" : t === "dark" ? "Sombre" : "Système"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <label className="text-sm font-semibold text-[#162A42]">
                      Couleur d'accentuation
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["#0087CA", "#7C3AED", "#059669", "#DC2626", "#D97706", "#DB2777"].map(
                        (color) => (
                          <button
                            key={color}
                            onClick={() => handleUpdate({ accentColor: color })}
                            className={cn(
                              "w-10 h-10 rounded-full border-4 transition-all flex items-center justify-center",
                              localSettings.accentColor === color
                                ? "border-slate-200"
                                : "border-transparent"
                            )}
                            style={{ backgroundColor: color }}
                          >
                            {localSettings.accentColor === color && (
                              <Check size={18} className="text-white" />
                            )}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "signature" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Signature</h2>
                  <p className="text-sm text-slate-500">
                    Ajoutez une signature à la fin de vos messages.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#EDF3F6] rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#162A42]">Activer la signature</p>
                      <p className="text-[10px] text-slate-500">
                        Ajouter automatiquement aux nouveaux messages
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate({ signatureEnabled: !localSettings.signatureEnabled })
                      }
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        localSettings.signatureEnabled ? "bg-[#0087CA]" : "bg-slate-300"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          localSettings.signatureEnabled ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  <div className="grid gap-2">
                    <textarea
                      className="w-full min-h-[160px] bg-[#EDF3F6] border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20 resize-none"
                      placeholder="Cordialement,\nJean-Marc Bassahak"
                      value={localSettings.signatureContent}
                      onChange={(e) => handleUpdate({ signatureContent: e.target.value })}
                      disabled={!localSettings.signatureEnabled}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeSection === "notifications" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Notifications</h2>
                  <p className="text-sm text-slate-500">Gérez comment vous êtes alerté.</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: "notifDesktop",
                      label: "Notifications de bureau",
                      desc: "Afficher les alertes sur votre écran",
                      icon: Monitor,
                    },
                    {
                      id: "notifSound",
                      label: "Sons de notification",
                      desc: "Jouer un son à l'arrivée d'un mail",
                      icon: Volume2,
                    },
                    {
                      id: "notifImportantOnly",
                      label: "Emails importants uniquement",
                      desc: "Réduire les distractions",
                      icon: Bell,
                    },
                  ].map((notif) => (
                    <div
                      key={notif.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#EDF3F6] flex items-center justify-center text-[#0087CA]">
                          <notif.icon size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[#162A42]">{notif.label}</p>
                          <p className="text-[10px] text-slate-500">{notif.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleUpdate({
                            [notif.id]: !localSettings[notif.id as keyof UserSettingsData],
                          })
                        }
                        className={cn(
                          "w-12 h-6 rounded-full transition-colors relative",
                          localSettings[notif.id as keyof UserSettingsData]
                            ? "bg-[#0087CA]"
                            : "bg-slate-300"
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            localSettings[notif.id as keyof UserSettingsData] ? "left-7" : "left-1"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeSection === "filters" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">
                    Filtres et adresses bloquées
                  </h2>
                  <p className="text-sm text-slate-500">Automatisez le tri de vos emails.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-8 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
                    <Filter size={48} className="text-slate-100" />
                    <p className="text-sm font-semibold text-slate-400">
                      Aucun filtre créé pour le moment
                    </p>
                    <Button className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 h-10 font-semibold">
                      Créer un nouveau filtre
                    </Button>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "accounts" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Comptes et Import</h2>
                  <p className="text-sm text-slate-500">
                    Gérez vos identités et importez vos contacts.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-6 bg-[#EDF3F6] rounded-3xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#0087CA] font-semibold shadow-sm">
                        JM
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#162A42]">
                          bassahakjm@pyramidmail.cm
                        </p>
                        <Badge variant="outline" className="bg-white border-none text-[10px]">
                          Compte Principal
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-slate-400 hover:text-[#162A42]">
                      Gérer
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-slate-100 border-2 font-semibold text-slate-600 gap-2"
                  >
                    <PlusIcon size={18} /> Ajouter un autre compte
                  </Button>
                </div>
              </section>
            )}

            {activeSection === "vacation" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Réponse automatique</h2>
                  <p className="text-sm text-slate-500">
                    Envoyez une réponse automatique quand vous êtes absent.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-[#EDF3F6] rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[#162A42]">Activer le répondeur</p>
                      <p className="text-[10px] text-slate-500">
                        Envoyer des réponses automatiques
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleUpdate({ vacationEnabled: !localSettings.vacationEnabled })
                      }
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors relative",
                        localSettings.vacationEnabled ? "bg-[#0087CA]" : "bg-slate-300"
                      )}
                    >
                      <div
                        className={cn(
                          "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                          localSettings.vacationEnabled ? "left-7" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase">
                        Premier jour
                      </label>
                      <Input
                        type="date"
                        className="bg-[#EDF3F6] border-none rounded-xl"
                        value={localSettings.vacationStart || ""}
                        onChange={(e) => handleUpdate({ vacationStart: e.target.value })}
                        disabled={!localSettings.vacationEnabled}
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase">
                        Dernier jour (optionnel)
                      </label>
                      <Input
                        type="date"
                        className="bg-[#EDF3F6] border-none rounded-xl"
                        value={localSettings.vacationEnd || ""}
                        onChange={(e) => handleUpdate({ vacationEnd: e.target.value })}
                        disabled={!localSettings.vacationEnabled}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Objet</label>
                    <Input
                      placeholder="Absence du bureau"
                      className="bg-[#EDF3F6] border-none rounded-xl"
                      value={localSettings.vacationSubject || ""}
                      onChange={(e) => handleUpdate({ vacationSubject: e.target.value })}
                      disabled={!localSettings.vacationEnabled}
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase">Message</label>
                    <textarea
                      className="w-full min-h-[120px] bg-[#EDF3F6] border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20 resize-none"
                      placeholder="Je serai de retour le..."
                      value={localSettings.vacationMessage || ""}
                      onChange={(e) => handleUpdate({ vacationMessage: e.target.value })}
                      disabled={!localSettings.vacationEnabled}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeSection === "security" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Sécurité</h2>
                  <p className="text-sm text-slate-500">Protégez votre compte et vos données.</p>
                </div>

                <div className="space-y-6">
                  {/* Password Change */}
                  <div className="p-6 bg-[#EDF3F6] rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0087CA] shadow-sm">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#162A42]">Mot de passe</p>
                          <p className="text-[10px] text-slate-500">
                            Modifié pour la dernière fois le{" "}
                            {securityInfo?.lastLoginAt
                              ? new Date(securityInfo.lastLoginAt).toLocaleDateString()
                              : "n/a"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={showPasswordForm ? "outline" : "default"}
                        onClick={() => setShowPasswordForm(!showPasswordForm)}
                        className={cn(
                          "rounded-xl font-semibold h-9",
                          !showPasswordForm && "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white"
                        )}
                      >
                        {showPasswordForm ? "Annuler" : "Modifier"}
                      </Button>
                    </div>

                    {showPasswordForm && (
                      <div className="grid gap-4 pt-4 border-t border-white/50">
                        <div className="grid gap-2">
                          <label className="text-[10px] font-semibold text-slate-400 uppercase">
                            Mot de passe actuel
                          </label>
                          <Input
                            type="password"
                            value={passwordForm.current}
                            onChange={(e) =>
                              setPasswordForm((p) => ({ ...p, current: e.target.value }))
                            }
                            className="bg-white border-none rounded-xl"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase">
                              Nouveau mot de passe
                            </label>
                            <Input
                              type="password"
                              value={passwordForm.new}
                              onChange={(e) =>
                                setPasswordForm((p) => ({ ...p, new: e.target.value }))
                              }
                              className="bg-white border-none rounded-xl"
                            />
                          </div>
                          <div className="grid gap-2">
                            <label className="text-[10px] font-semibold text-slate-400 uppercase">
                              Confirmer
                            </label>
                            <Input
                              type="password"
                              value={passwordForm.confirm}
                              onChange={(e) =>
                                setPasswordForm((p) => ({ ...p, confirm: e.target.value }))
                              }
                              className="bg-white border-none rounded-xl"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={async () => {
                            if (passwordForm.new !== passwordForm.confirm) {
                              showToast("Les mots de passe ne correspondent pas", "error");
                              return;
                            }
                            try {
                              await changePassword({
                                currentPassword: passwordForm.current,
                                newPassword: passwordForm.new,
                              });
                              showToast("Mot de passe modifié", "success");
                              setPasswordForm({ current: "", new: "", confirm: "" });
                              setShowPasswordForm(false);
                            } catch (err) {
                              showToast("Erreur lors de la modification", "error");
                            }
                          }}
                          disabled={
                            isChangingPassword || !passwordForm.current || !passwordForm.new
                          }
                          className="bg-[#162A42] hover:bg-[#162A42]/90 text-white rounded-xl font-semibold h-11"
                        >
                          {isChangingPassword ? (
                            <Loader2 className="animate-spin mr-2" size={18} />
                          ) : (
                            <Check className="mr-2" size={18} />
                          )}
                          Confirmer le changement
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Active Sessions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#162A42] uppercase tracking-widest">
                        Sessions Actives
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAllSessions()}
                        className="text-red-500 hover:bg-red-50 font-semibold rounded-lg h-8 text-[10px]"
                      >
                        Tout révoquer
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {sessions.map((session: any) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                session.isCurrent
                                  ? "bg-green-50 text-green-600"
                                  : "bg-slate-50 text-slate-400"
                              )}
                            >
                              <Smartphone size={20} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-[#162A42]">
                                  {session.device || "Appareil inconnu"}
                                </p>
                                {session.isCurrent && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[8px] font-semibold uppercase px-1.5 h-4">
                                    Actuelle
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500">
                                {session.ip || "IP inconnue"} • Dernier signe de vie :{" "}
                                {new Date(session.lastSeenAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <Button
                              variant="ghost"
                              onClick={() => revokeSession(session.id)}
                              className="text-red-500 hover:bg-red-50 rounded-xl font-semibold h-9 w-9 p-0"
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Danger Zone */}
                  <div className="pt-4">
                    <h3 className="text-sm font-semibold text-red-500 mb-4 uppercase tracking-widest">
                      Zone de danger
                    </h3>
                    <div className="p-6 border-2 border-red-50 rounded-3xl flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-[#162A42]">Supprimer mon compte</p>
                        <p className="text-xs text-slate-400">
                          Cette action est irréversible et supprimera toutes vos données.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        className="text-red-500 hover:bg-red-50 rounded-xl font-semibold"
                      >
                        <Trash2 size={18} className="mr-2" /> Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "administration" && (
              <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-1">
                  <h2 className="text-2xl font-semibold text-[#162A42]">Administration</h2>
                  <p className="text-sm text-slate-500">
                    Gérez l'organisation, l'équipe et les accès développeurs.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      label: "Tableau de bord",
                      description: "Statistiques et vue d'ensemble",
                      icon: LayoutDashboard,
                      path: "/admin/dashboard",
                      color: "text-blue-600",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Gestion d'équipe",
                      description: "Utilisateurs et permissions",
                      icon: UsersIcon,
                      path: "/admin/team",
                      color: "text-purple-600",
                      bg: "bg-purple-50",
                    },
                    {
                      label: "Abonnements",
                      description: "Facturation et quotas",
                      icon: CreditCard,
                      path: "/admin/billing",
                      color: "text-amber-600",
                      bg: "bg-amber-50",
                    },
                    {
                      label: "Développeurs",
                      description: "Clés API et webhooks",
                      icon: Code2,
                      path: "/admin/developers",
                      color: "text-emerald-600",
                      bg: "bg-emerald-50",
                    },
                  ].map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group p-6 bg-white border border-slate-100 rounded-[32px] hover:border-[#0087CA]/30 hover:shadow-xl hover:shadow-[#0087CA]/5 transition-all duration-300 flex flex-col gap-4"
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                          item.bg,
                          item.color
                        )}
                      >
                        <item.icon size={24} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-[#162A42] group-hover:text-[#0087CA] transition-colors">
                          {item.label}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        {/* Sticky Save Bar */}
        <div className="h-20 px-4 md:px-8 lg:px-12 border-t border-slate-100 flex items-center justify-end gap-4 shrink-0 bg-white/80 backdrop-blur-sm">
          {showSuccess && (
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm animate-in fade-in slide-in-from-right-4">
              <Check size={18} /> Paramètres sauvegardés
            </div>
          )}
          <Button
            variant="ghost"
            onClick={() => setLocalSettings(settings)}
            className="font-semibold text-slate-400"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 h-11 px-8 font-semibold shadow-lg shadow-[#0087CA]/20 disabled:opacity-70"
          >
            {updateSettingsMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Sauvegarder les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}

function Plus({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
