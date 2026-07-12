import { useState } from "react";
import {
  Code2,
  Plus,
  Trash2,
  Ban,
  Copy,
  Check,
  RefreshCw,
  Activity,
  Zap,
  Key,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDevelopers } from "@/hooks/useDevelopers";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function AdminDevelopersPage() {
  const { showToast } = useToast();
  const { apiKeys, stats, isLoading, createApiKey, deleteApiKey, revokeApiKey } = useDevelopers();

  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    showToast("Clé API copiée dans le presse-papier", "success");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    try {
      await createApiKey({ name: newKeyName.trim(), permissions: ["all"] });
      showToast("Nouvelle clé API générée", "success");
      setNewKeyName("");
      setIsCreating(false);
    } catch (err) {
      showToast("Erreur lors de la génération", "error");
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-500 max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#162A42] flex items-center gap-3">
            <Code2 className="text-[#0087CA]" size={28} />
            Espace Développeurs
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gérez vos clés API et intégrez Pyramid Mail à vos applications.
          </p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl gap-2 h-11 px-6 font-semibold shadow-lg shadow-[#0087CA]/20"
        >
          <Plus size={18} />
          Générer une clé
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Zap size={20} />
            </div>
            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-none text-[10px] font-semibold">
              Total Requêtes
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#162A42]">{stats?.totalRequests || 0}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">30 derniers jours</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Activity size={20} />
            </div>
            <Badge className="bg-green-50 text-green-600 hover:bg-green-50 border-none text-[10px] font-semibold">
              Taux de succès
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#162A42]">{stats?.successRate || 0}%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Stabilité excellente</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Key size={20} />
            </div>
            <Badge className="bg-amber-50 text-amber-600 hover:bg-amber-50 border-none text-[10px] font-semibold">
              Clés Actives
            </Badge>
          </div>
          <div>
            <p className="text-3xl font-semibold text-[#162A42]">{stats?.activeKeys || 0}</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Sur {apiKeys.length} créées</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        {/* Creation Overlay */}
        {isCreating && (
          <div className="p-6 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top duration-300">
            <div className="flex items-end gap-4 max-w-2xl">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase ml-1">
                  Nom de la clé
                </label>
                <Input
                  placeholder="Ex: Application Mobile"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="bg-white border-none rounded-xl h-12 text-sm font-medium"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsCreating(false)}
                  className="rounded-xl h-12 font-semibold text-slate-400"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newKeyName.trim()}
                  className="bg-[#162A42] hover:bg-[#162A42]/90 text-white rounded-xl h-12 px-6 font-semibold"
                >
                  Générer Key
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Keys List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <Loader2 className="animate-spin text-[#0087CA]" size={32} />
              <p className="text-sm text-slate-400 font-semibold">Chargement des clés API...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <Shield size={48} className="text-slate-200" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-[#162A42]">Aucune clé API</p>
                <p className="text-sm text-slate-400 max-w-xs">
                  Générez votre première clé pour commencer à utiliser l'API Pyramid Mail.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {apiKeys.map((item: any) => (
                <div
                  key={item.id}
                  className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group"
                >
                  <div className="space-y-3 flex-1 mr-8">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#162A42]">{item.name}</h3>
                      {!item.isActive && (
                        <Badge
                          variant="outline"
                          className="text-red-500 border-red-100 bg-red-50 text-[10px] font-semibold"
                        >
                          Révoquée
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <code className="bg-[#EDF3F6] px-3 py-2 rounded-xl text-[13px] font-mono text-[#0087CA] flex-1 block overflow-hidden text-ellipsis whitespace-nowrap border border-[#0087CA]/10">
                        {item.isActive ? item.key : "••••••••••••••••••••••••••••••••"}
                      </code>
                      {item.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(item.key)}
                          className="rounded-xl hover:bg-[#0087CA] hover:text-white transition-all h-10 w-10 shrink-0"
                        >
                          {copiedKey === item.key ? <Check size={18} /> : <Copy size={18} />}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <RefreshCw size={12} />
                        Dernier usage:{" "}
                        {item.lastUsedAt
                          ? new Date(item.lastUsedAt).toLocaleDateString()
                          : "Jamais"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Plus size={12} />
                        Créée le {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.isActive && (
                      <Button
                        variant="ghost"
                        onClick={() => revokeApiKey(item.id)}
                        className="text-amber-600 hover:bg-amber-50 rounded-xl font-semibold h-10 px-4 gap-2"
                      >
                        <Ban size={16} />
                        Révoquer
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => deleteApiKey(item.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl font-semibold h-10 px-4 gap-2"
                    >
                      <Trash2 size={16} />
                      Supprimer
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
