import { useState } from "react";
import { ChevronDown, ChevronRight, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApiEndpoint } from "@/types/developers";

interface EndpointDocCardProps {
  endpoint: ApiEndpoint;
}

const methodColors = {
  GET: "#0087CA",
  POST: "#16A34A",
  PUT: "#EA580C",
  DELETE: "#DC2626",
};

export function EndpointDocCard({ endpoint }: EndpointDocCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-[#DFE5E7] rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-[#EDF3F6] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="font-mono font-semibold text-white text-xs px-2 py-1"
              style={{ backgroundColor: methodColors[endpoint.method] }}
            >
              {endpoint.method}
            </Badge>
            <code className="text-sm font-mono text-[#162A42]">{endpoint.path}</code>
            {endpoint.auth ? (
              <Lock className="h-4 w-4 text-orange-500" />
            ) : (
              <Unlock className="h-4 w-4 text-green-500" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-[#9ACEE8] text-[#162A42]">
              {endpoint.category}
            </Badge>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[#091D35]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#091D35]" />
            )}
          </div>
        </div>
        <p className="text-sm text-[#091D35] mt-2">{endpoint.description}</p>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-[#DFE5E7] p-4 space-y-4">
          {/* Parameters */}
          {endpoint.params.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-[#162A42]">Paramètres</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#EDF3F6]">
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                        Requis
                      </th>
                      <th className="text-left py-2 px-3 text-[10px] font-semibold text-[#162A42] uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.params.map((param, index) => (
                      <tr
                        key={param.name}
                        className={cn(
                          "border-b border-slate-50 last:border-none",
                          index % 2 === 1 && "bg-[#F8FAFB]"
                        )}
                      >
                        <td className="py-2 px-3 font-mono text-[#162A42]">{param.name}</td>
                        <td className="py-2 px-3 text-[#091D35]">{param.type}</td>
                        <td className="py-2 px-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              param.required
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            )}
                          >
                            {param.required ? "Oui" : "Non"}
                          </Badge>
                        </td>
                        <td className="py-2 px-3 text-[#091D35]">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Response Example */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[#162A42]">Exemple de réponse</h4>
            <div className="bg-[#1e293b] rounded p-3 overflow-x-auto">
              <pre className="text-sm text-[#e2e8f0] font-mono whitespace-pre-wrap">
                {endpoint.responseExample}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
