import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDomains } from "@/hooks/useDomains";
import { Loader2, Plus, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function DomainsPage() {
  const [domainName, setDomainName] = useState("");
  const { user } = useAuth();
  const { domains, isLoading, createDomain, verifyDomain, isCreating, isVerifying } = useDomains();

  const isAuthed = Boolean(user);

  async function onAddDomain() {
    if (!domainName.trim()) return;
    try {
      await createDomain(domainName.trim());
      setDomainName("");
    } catch (err) {
      console.error("Failed to add domain", err);
    }
  }

  async function onVerify(domainId: string) {
    try {
      await verifyDomain(domainId);
    } catch (err) {
      console.error("Verification failed", err);
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0087CA]" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-[#162A42]">Domaines personnalisés</h1>
          <p className="text-sm text-slate-500">
            Gérez vos propres domaines pour envoyer et recevoir des emails.
          </p>
        </div>
        <Link
          to="/inbox"
          className="text-xs font-semibold text-[#0087CA] hover:bg-[#EDF3F6] px-3 py-1.5 rounded-lg transition-colors"
        >
          Retour à la boîte
        </Link>
      </div>

      {!isAuthed && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3 text-amber-800 text-sm">
          <XCircle className="shrink-0" size={18} />
          Vous devez être connecté pour gérer vos domaines.
        </div>
      )}

      {/* Add Domain Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#162A42]">Nouveau domaine</label>
          <div className="flex gap-2">
            <input
              className="flex-1 h-11 bg-slate-50 border-none rounded-xl px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0087CA]/20 transition-all"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="ex: mon-entreprise.cm"
              disabled={!isAuthed || isCreating}
            />
            <Button
              className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl h-11 px-6 font-semibold gap-2 shadow-lg shadow-[#0087CA]/10"
              disabled={!isAuthed || !domainName.trim() || isCreating}
              onClick={onAddDomain}
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Ajouter
            </Button>
          </div>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-1">
          Mes Domaines
        </h2>

        {domains.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
              <Plus size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              Aucun domaine configuré pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {domains.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6 transition-all hover:border-[#0087CA]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center",
                        d.isVerified ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                      )}
                    >
                      {d.isVerified ? <CheckCircle2 size={20} /> : <RefreshCcw size={20} />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#162A42]">{d.domainName}</h3>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {d.isVerified ? "Domaine Vérifié" : "En attente de vérification"}
                      </p>
                    </div>
                  </div>

                  {!d.isVerified && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-semibold border-slate-200 text-slate-600 hover:bg-[#EDF3F6] hover:text-[#0087CA] hover:border-[#0087CA]/20 h-9"
                      disabled={isVerifying}
                      onClick={() => onVerify(d.id)}
                    >
                      {isVerifying ? <Loader2 className="animate-spin mr-2" size={14} /> : null}
                      Vérifier maintenant
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Type / Host
                      </p>
                      <p className="text-xs font-mono text-[#162A42] truncate">
                        TXT / _pyramidmail.{d.domainName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Valeur attendue
                      </p>
                      <p className="text-xs font-mono bg-white p-2 rounded-lg border border-slate-100 text-[#0087CA] break-all">
                        {d.expectedTxtRecord}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Enregistrement SPF
                      </p>
                      <p className="text-xs font-mono text-slate-500 truncate">{d.spfRecord}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                        Enregistrement DMARC
                      </p>
                      <p className="text-xs font-mono text-slate-500 truncate">{d.dmarcRecord}</p>
                    </div>
                  </div>
                </div>

                {d.lastCheckedAt && (
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] text-slate-400 font-medium">
                      Dernière vérification : {new Date(d.lastCheckedAt).toLocaleString("fr-FR")}
                    </p>
                    {d.verificationError && (
                      <p className="text-[10px] text-red-500 font-semibold">
                        Erreur : {d.verificationError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
