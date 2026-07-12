import { useState } from "react";
import { Eye, EyeOff, Copy, Key, Calendar, Activity, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiKey } from "@/types/developers";

interface ApiKeyCardProps {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ApiKeyCard({ apiKey, onRevoke, onDelete }: ApiKeyCardProps) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const createdAt = new Date(apiKey.createdAt);
  const lastUsedAt = new Date(apiKey.lastUsedAt);

  const maskedKey = `pm_live_${"•".repeat(32)}`;

  return (
    <div className="bg-white border border-[#DFE5E7] rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="h-5 w-5 text-[#0087CA]" />
          <span className="font-medium text-[#162A42]">{apiKey.name}</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              apiKey.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            )}
          >
            {apiKey.status === "active" ? "Active" : "Révoquée"}
          </Badge>
        </div>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#091D35]">Clé API</label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-[#1e293b] text-white px-3 py-2 rounded font-mono text-sm">
            {showKey ? apiKey.key : maskedKey}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowKey(!showKey)}
            className="border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6]"
          >
            <Copy className="h-4 w-4" />
            {copied && <span className="ml-1 text-xs">Copié !</span>}
          </Button>
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[#091D35]">Permissions</label>
        <div className="flex flex-wrap gap-1">
          {apiKey.permissions.map((permission) => (
            <Badge
              key={permission}
              variant="secondary"
              className="text-xs bg-[#9ACEE8] text-[#162A42]"
            >
              {permission}
            </Badge>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-[#091D35]" />
          <div>
            <p className="text-[#091D35]">Créée le</p>
            <p className="font-medium text-[#162A42]">{createdAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-[#091D35]" />
          <div>
            <p className="text-[#091D35]">Dernière utilisation</p>
            <p className="font-medium text-[#162A42]">{lastUsedAt.toLocaleDateString("fr-FR")}</p>
          </div>
        </div>
      </div>

      {/* Request Count */}
      <div className="text-sm">
        <span className="text-[#091D35]">Requêtes : </span>
        <span className="font-medium text-[#162A42]">{apiKey.requestCount.toLocaleString()}</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-2 border-t border-[#DFE5E7]">
        {apiKey.status === "active" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRevoke(apiKey.id)}
            className="text-xs border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            Révoquer
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(apiKey.id)}
          className="text-xs border-red-500 text-red-500 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Supprimer
        </Button>
      </div>
    </div>
  );
}
