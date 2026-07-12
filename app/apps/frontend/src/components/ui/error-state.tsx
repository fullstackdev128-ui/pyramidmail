import { AlertCircle } from "lucide-react";
import { Button } from "./button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  message = "Erreur de chargement. Réessayer.", 
  onRetry 
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <AlertCircle className="w-12 h-12 text-red-500" />
      <p className="text-slate-600 font-medium">{message}</p>
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="bg-[#0087CA] hover:bg-[#0087CA]/90 text-white rounded-xl"
        >
          Réessayer
        </Button>
      )}
    </div>
  );
}
