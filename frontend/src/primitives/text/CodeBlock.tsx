import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { CodeBlockProps } from "@/types/primitives";

export function CodeBlock({ code, language, showLineNumbers, copyable, className }: CodeBlockProps & { className?: string }) {
  const [copied, setCopied] = useState(false);
  const displayCode = typeof code === "string" ? code : "";

  const handleCopy = async () => {
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(displayCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const lines = displayCode.split("\n");

  return (
    <div className={cn("bg-[#1b1b1b] rounded-[0.25rem] p-[8px] overflow-x-auto relative", className)} data-ct-primitive="CodeBlock">
      {copyable && (
        <button
          onClick={handleCopy}
          className="absolute top-[8px] right-[8px] w-6 h-6 rounded border border-[#5c5c5c] flex items-center justify-center hover:bg-[#2e2e2e] transition-colors"
          title="Copy"
          type="button"
        >
          <span className="material-symbols-outlined text-[14px] text-white">
            {copied ? "check" : "content_copy"}
          </span>
        </button>
      )}
      <pre className="font-['JetBrains_Mono'] text-[11px] text-white leading-[1.7]">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              {showLineNumbers && (
                <span className="inline-block w-6 text-right mr-[12px] text-[#6b6b6b] select-none">{i + 1}</span>
              )}
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
      {language && (
        <span className="absolute bottom-[8px] right-[8px] font-['JetBrains_Mono'] text-[10px] text-[#6b6b6b] uppercase">
          {language}
        </span>
      )}
    </div>
  );
}
