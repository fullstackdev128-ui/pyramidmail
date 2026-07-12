import { useState } from "react";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface CodeSnippetBlockProps {
  snippets: {
    javascript: string;
    python: string;
    curl: string;
  };
}

export function CodeSnippetBlock({ snippets }: CodeSnippetBlockProps) {
  const [activeTab, setActiveTab] = useState("javascript");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const currentSnippet = snippets[activeTab as keyof typeof snippets];
    await navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightSyntax = (code: string, language: string) => {
    // Simple syntax highlighting for keywords
    const keywords = {
      javascript: [
        "const",
        "let",
        "var",
        "function",
        "async",
        "await",
        "try",
        "catch",
        "return",
        "import",
        "from",
        "export",
      ],
      python: ["def", "class", "import", "from", "try", "except", "return", "if", "for", "while"],
      curl: ["curl", "-X", "-H", "-d", "--data", "--header"],
    };

    const langKeywords = keywords[language as keyof typeof keywords] || [];
    let highlighted = code;

    // Highlight strings
    highlighted = highlighted.replace(/(["'`])(.*?)\1/g, '<span class="text-green-400">$&</span>');

    // Highlight keywords
    langKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      highlighted = highlighted.replace(regex, `<span class="text-blue-400">${keyword}</span>`);
    });

    return highlighted;
  };

  return (
    <div className="bg-[#1e293b] rounded-lg overflow-hidden">
      {/* Header with tabs and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f172a] border-b border-slate-700">
        <div className="flex-1">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab("javascript")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all relative",
                activeTab === "javascript" ? "text-[#0087CA]" : "text-slate-400 hover:text-white"
              )}
            >
              JavaScript
              {activeTab === "javascript" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0087CA]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("python")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all relative",
                activeTab === "python" ? "text-[#0087CA]" : "text-slate-400 hover:text-white"
              )}
            >
              Python
              {activeTab === "python" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0087CA]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("curl")}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-all relative",
                activeTab === "curl" ? "text-[#0087CA]" : "text-slate-400 hover:text-white"
              )}
            >
              cURL
              {activeTab === "curl" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0087CA]" />
              )}
            </button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-slate-400 hover:text-white hover:bg-slate-700 ml-2"
        >
          <Copy className="h-4 w-4" />
          {copied && <span className="ml-1 text-xs">Copié !</span>}
        </Button>
      </div>

      {/* Code content */}
      <div className="p-4 overflow-x-auto">
        {activeTab === "javascript" && (
          <pre className="text-sm text-[#e2e8f0] font-mono leading-relaxed">
            <code
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(snippets.javascript, "javascript"),
              }}
            />
          </pre>
        )}
        {activeTab === "python" && (
          <pre className="text-sm text-[#e2e8f0] font-mono leading-relaxed">
            <code
              dangerouslySetInnerHTML={{ __html: highlightSyntax(snippets.python, "python") }}
            />
          </pre>
        )}
        {activeTab === "curl" && (
          <pre className="text-sm text-[#e2e8f0] font-mono leading-relaxed">
            <code dangerouslySetInnerHTML={{ __html: highlightSyntax(snippets.curl, "curl") }} />
          </pre>
        )}
      </div>
    </div>
  );
}
