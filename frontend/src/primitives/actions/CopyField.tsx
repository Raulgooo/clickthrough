import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { CopyFieldProps } from "@/types/primitives";

export function CopyField({
  label,
  value,
  masked,
  revealRequiresClick,
  className,
}: CopyFieldProps & { className?: string }) {
  const [revealed, setRevealed] = useState(!masked);
  const [copied, setCopied] = useState(false);

  const displayValue =
    masked && !revealed ? "•".repeat(Math.min(value.length, 32)) : value;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReveal = () => {
    if (revealRequiresClick) setRevealed(true);
  };

  return (
    <div
      data-ct-primitive="CopyField"
      className={cn("flex gap-sm items-center", className)}
    >
      {label && (
        <div className="font-label-mono text-label-mono text-on-surface-variant w-20 shrink-0">
          {label}
        </div>
      )}
      <input
        className="flex-1 px-sm py-sm bg-surface-container-low border border-outline rounded font-label-mono text-[11px] text-on-background outline-none"
        readOnly
        value={displayValue}
        onClick={handleReveal}
      />
      <button
        className="w-8 h-8 rounded border border-outline flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
        title="Copy"
        onClick={handleCopy}
      >
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          {copied ? "check" : "content_copy"}
        </span>
      </button>
    </div>
  );
}
