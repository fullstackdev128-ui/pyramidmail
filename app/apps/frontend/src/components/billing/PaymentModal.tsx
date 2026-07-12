import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, CheckCircle2, Loader2, ArrowLeft, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { usePlan } from "@/hooks/usePlan";
import { setPlan } from "@/lib/mock-session";
import { useQueryClient } from "@tanstack/react-query";

type PaymentStep = "choice" | "form" | "loading" | "success";

interface PaymentMethod {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  abbr: string;
}

const METHODS: PaymentMethod[] = [
  { id: "mtn", label: "MTN Mobile Money", shortLabel: "MTN MoMo", color: "#FCD34D", abbr: "MTN" },
  { id: "orange", label: "Orange Money", shortLabel: "Orange Money", color: "#F97316", abbr: "OM" },
];

const PRICE = 2900;
const PRICE_LABEL = "2 900 FCFA / mois";

interface PaymentModalProps {
  onClose: () => void;
}

export function PaymentModal({ onClose }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>("choice");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handlePhoneChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 9);
    setPhone(cleaned);
  };

  const maskPhone = (num: string) => {
    if (num.length < 9) return num;
    return `${num.slice(0, 3)} ${num.slice(3, 6)} X${num.slice(8)}`;
  };

  const handlePay = () => {
    setStep("loading");
    setTimeout(() => {
      setStep("success");
    }, 2000);
  };

  const queryClient = useQueryClient();

  const handleConfirm = () => {
    setPlan("premium");
    queryClient.invalidateQueries({ queryKey: ["user", "plan"] });
    navigate("/inbox");
  };

  const formatPhoneDisplay = (num: string) => {
    if (num.length <= 3) return num;
    if (num.length <= 6) return `${num.slice(0, 3)} ${num.slice(3)}`;
    return `${num.slice(0, 3)} ${num.slice(3, 6)} ${num.slice(6)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={step === "loading" ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close button — hide during loading */}
        {step !== "loading" && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        )}

        {/* ===== STEP 1: Payment method choice ===== */}
        {step === "choice" && (
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[#162A42]">Choisir un moyen de paiement</h2>
              <p className="text-sm text-slate-500">
                Sélectionnez votre opérateur de paiement mobile
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                    selectedMethod?.id === method.id
                      ? "border-[#0087CA] bg-[#EDF3F6]"
                      : "border-[#DFE5E7] bg-white hover:border-slate-300"
                  )}
                >
                  {/* Simulated logo */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-semibold text-white shrink-0"
                    style={{ backgroundColor: method.color }}
                  >
                    {method.abbr}
                  </div>
                  <span className="text-sm font-semibold text-[#162A42]">{method.shortLabel}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl h-11 font-semibold"
              >
                Annuler
              </Button>
              <Button
                onClick={() => selectedMethod && setStep("form")}
                disabled={!selectedMethod}
                className={cn(
                  "flex-1 rounded-xl h-11 font-semibold",
                  "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white",
                  !selectedMethod && "opacity-50 cursor-not-allowed"
                )}
              >
                Continuer
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 2: Phone number input ===== */}
        {step === "form" && (
          <div className="p-6 space-y-6">
            {/* Header with back button */}
            <div className="space-y-1">
              <button
                onClick={() => setStep("choice")}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-[#0087CA] transition-colors mb-2"
              >
                <ArrowLeft size={14} />
                Retour
              </button>
              <h2 className="text-xl font-semibold text-[#162A42]">
                Entrez votre numéro {selectedMethod?.shortLabel}
              </h2>
              <p className="text-sm text-slate-500">Un code de confirmation vous sera envoyé</p>
            </div>

            {/* Method badge */}
            {selectedMethod && (
              <div className="flex items-center gap-2 bg-[#EDF3F6] px-3 py-2 rounded-xl">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[7px] font-semibold text-white shrink-0"
                  style={{ backgroundColor: selectedMethod.color }}
                >
                  {selectedMethod.abbr}
                </div>
                <span className="text-xs font-semibold text-[#162A42]">{selectedMethod.label}</span>
              </div>
            )}

            {/* Phone input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Smartphone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  type="tel"
                  placeholder="6XXXXXXXX"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="h-12 pl-10 bg-[#EDF3F6] border-none rounded-xl text-lg tracking-widest"
                />
              </div>
            </div>

            {/* Price recap */}
            <div className="bg-[#EDF3F6] rounded-xl p-3 text-center">
              <span className="text-sm font-semibold text-[#162A42]">{PRICE_LABEL}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setStep("choice")}
                className="flex-1 rounded-xl h-11 font-semibold"
              >
                Retour
              </Button>
              <Button
                onClick={handlePay}
                disabled={phone.length < 9}
                className={cn(
                  "flex-1 rounded-xl h-11 font-semibold",
                  "bg-[#0087CA] hover:bg-[#0087CA]/90 text-white",
                  phone.length < 9 && "opacity-50 cursor-not-allowed"
                )}
              >
                Payer maintenant
              </Button>
            </div>
          </div>
        )}

        {/* ===== STEP 3: Loading ===== */}
        {step === "loading" && (
          <div className="p-12 flex flex-col items-center justify-center space-y-6">
            <Loader2 size={48} className="animate-spin text-[#0087CA]" />
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-[#162A42]">
                Traitement du paiement en cours...
              </p>
              <p className="text-sm text-slate-500">Veuillez ne pas fermer cette fenêtre</p>
            </div>
          </div>
        )}

        {/* ===== STEP 4: Success ===== */}
        {step === "success" && (
          <div className="p-6 space-y-6 text-center">
            <CheckCircle2 size={64} className="text-[#10B981] mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[#162A42]">Paiement réussi !</h2>
              <p className="text-sm text-slate-500">Votre compte a été upgradé vers Premium</p>
            </div>

            {/* Recap */}
            <div className="bg-[#EDF3F6] rounded-xl p-4 space-y-2 text-left">
              {selectedMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase">
                    Moyen de paiement
                  </span>
                  <span className="text-sm font-semibold text-[#162A42]">
                    {selectedMethod.shortLabel}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-semibold uppercase">Montant</span>
                <span className="text-sm font-semibold text-[#162A42]">{PRICE_LABEL}</span>
              </div>
              {phone && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Numéro</span>
                  <span className="text-sm font-semibold text-[#162A42]">{maskPhone(phone)}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleConfirm}
              className="w-full rounded-xl h-12 font-semibold bg-[#0087CA] hover:bg-[#0087CA]/90 text-white text-base"
            >
              Accéder à Premium
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
