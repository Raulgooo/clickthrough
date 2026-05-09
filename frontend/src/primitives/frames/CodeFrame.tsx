import { useState } from "react";
import { type CodeFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function CodeFrame({
  code,
  language,
  filename,
  copyable,
  className,
}: CodeFrameProps & { className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div
      className={cn("bg-primary-container rounded overflow-hidden", className)}
      data-ct-primitive="CodeFrame"
    >
      <div className="flex items-center justify-between px-sm py-xs border-b border-inverse-surface/20">
        <span className="font-label-mono text-[10px] text-inverse-on-surface">
          {language || filename || "Code"}
        </span>
        {copyable && (
          <button
            onClick={handleCopy}
            className="p-xs hover:bg-inverse-surface/20 rounded transition-colors"
            title="Copy"
          >
            <span className="material-symbols-outlined text-[14px] text-inverse-on-surface">
              {copied ? "check" : "content_copy"}
            </span>
          </button>
        )}
      </div>
      <div className="p-sm font-label-mono text-[11px] text-inverse-on-surface leading-relaxed overflow-x-auto">
        <code className="whitespace-pre">{code}</code>
      </div>
    </div>
  );
}
