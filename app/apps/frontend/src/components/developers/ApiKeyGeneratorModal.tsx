import { useState } from "react";
import { X, Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Permission } from "@/types/developers";

interface ApiKeyGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (name: string, permissions: Permission[]) => any;
  isGenerating: boolean;
}

export function ApiKeyGeneratorModal({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}: ApiKeyGeneratorModalProps) {
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<Permission[]>(["read"]);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const availablePermissions: { value: Permission; label: string }[] = [
    { value: "read", label: "Lire les messages" },
    { value: "send", label: "Envoyer des messages" },
    { value: "delete", label: "Supprimer des messages" },
    { value: "webhooks", label: "Gérer les webhooks" },
  ];

  const handlePermissionChange = (permission: Permission, checked: boolean) => {
    if (checked) {
      setPermissions((prev) => [...prev, permission]);
    } else {
      setPermissions((prev) => prev.filter((p) => p !== permission));
    }
  };

  const handleGenerate = () => {
    if (name.trim() && permissions.length > 0) {
      const newKey = onGenerate(name.trim(), permissions);
      setGeneratedKey(newKey.key);
    }
  };

  const handleCopy = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setPermissions(["read"]);
    setGeneratedKey(null);
    setCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-[#0087CA]" />
              <h2 className="text-lg font-semibold text-[#162A42]">
                {generatedKey ? "Clé API générée" : "Générer une nouvelle clé API"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-[#091D35] hover:bg-[#EDF3F6]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {!generatedKey ? (
            /* Generation Form */
            <div className="space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#162A42]">Nom de la clé *</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Application Mobile"
                  className="border-[#DFE5E7] focus:border-[#0087CA]"
                />
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-[#162A42]">Permissions</label>
                <div className="space-y-2">
                  {availablePermissions.map((perm) => (
                    <div key={perm.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={perm.value}
                        checked={permissions.includes(perm.value)}
                        onChange={(e) => handlePermissionChange(perm.value, e.target.checked)}
                      />
                      <label htmlFor={perm.value} className="text-sm text-[#091D35] cursor-pointer">
                        {perm.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!name.trim() || permissions.length === 0 || isGenerating}
                className="w-full bg-[#0087CA] text-white hover:bg-[#006fa8] disabled:opacity-50"
              >
                {isGenerating ? "Génération..." : "Générer la clé"}
              </Button>
            </div>
          ) : (
            /* Generated Key Display */
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ Copiez cette clé maintenant, elle ne sera plus visible après la fermeture de
                  cette fenêtre.
                </p>
              </div>

              {/* Key Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#162A42]">Votre clé API</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-[#1e293b] text-white px-3 py-2 rounded font-mono text-sm break-all">
                    {generatedKey}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="border-[#DFE5E7] text-[#162A42] hover:bg-[#EDF3F6] shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                    {copied && <span className="ml-1 text-xs">Copié !</span>}
                  </Button>
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={handleClose}
                className="w-full bg-[#0087CA] text-white hover:bg-[#006fa8]"
              >
                Fermer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
