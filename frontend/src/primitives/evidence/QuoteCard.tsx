import { cn } from "@/utils/classNames";
import type { QuoteCardProps } from "@/types/primitives";

export function QuoteCard({
  claim,
  speaker,
  sourceUrl,
  sourceLabel,
  extractedFrom,
  className,
}: QuoteCardProps & { className?: string }) {
  const attribution = sourceLabel || sourceUrl || extractedFrom;

  return (
    <div
      data-ct-primitive="QuoteCard"
      className={cn(
        "border border-outline rounded p-md",
        className
      )}
    >
      <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider mb-xs">
        QUOTE
      </div>
      {claim && (
        <p className="font-headline-sm text-[14px] font-semibold text-on-background leading-relaxed">
          &ldquo;{claim}&rdquo;
        </p>
      )}
      {speaker && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
          &mdash; {speaker}
        </p>
      )}
      {attribution && (
        <div className="font-label-mono text-label-mono text-on-surface-variant mt-sm">
          Source: {attribution}
        </div>
      )}
    </div>
  );
}
