import { cn } from "@/utils/classNames";
import type { EvidenceSourceProps } from "@/types/primitives";

function qualityBadge(quality?: EvidenceSourceProps["quality"]) {
  switch (quality) {
    case "high":
      return {
        wrapper:
          "inline-flex items-center gap-xs px-xs py-xs rounded-full bg-primary-container font-label-mono text-[10px] text-on-primary",
        dot: "w-1.5 h-1.5 rounded-full bg-on-primary",
        label: "High",
      };
    case "medium":
      return {
        wrapper:
          "inline-flex items-center gap-xs px-xs py-xs rounded-full bg-surface-container font-label-mono text-[10px] text-on-surface-variant",
        dot: "w-1.5 h-1.5 rounded-full bg-on-surface-variant",
        label: "Med",
      };
    case "low":
      return {
        wrapper:
          "inline-flex items-center gap-xs px-xs py-xs rounded-full bg-surface-container font-label-mono text-[10px] text-on-surface-variant border border-dashed border-outline",
        dot: "w-1.5 h-1.5 rounded-full border border-on-surface-variant",
        label: "Low",
      };
    default:
      return {
        wrapper:
          "inline-flex items-center gap-xs px-xs py-xs rounded-full bg-surface-container font-label-mono text-[10px] text-on-surface-variant border border-dashed border-outline",
        dot: "w-1.5 h-1.5 rounded-full border border-on-surface-variant",
        label: "?",
      };
  }
}

export function EvidenceSource({
  title,
  url,
  publisher,
  date,
  snippet,
  stance,
  quality,
  freshness,
  className,
}: EvidenceSourceProps & { className?: string }) {
  const badge = qualityBadge(quality);
  const faviconText = (publisher || title).slice(0, 2).toLowerCase();

  return (
    <div
      data-ct-primitive="EvidenceSource"
      className={cn(
        "flex items-center gap-md py-xs",
        className
      )}
    >
      <div className="w-4 h-4 rounded-sm bg-surface-container-high border border-outline flex items-center justify-center font-label-mono text-[8px] text-on-surface-variant flex-shrink-0">
        {faviconText}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-body-sm text-body-sm font-medium text-on-background truncate">
          {publisher ? `${publisher} — ${title}` : title}
        </div>
        <div className="font-label-mono text-label-mono text-on-surface-variant truncate">
          {url}
        </div>
        {snippet && (
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-xs">
            {snippet}
          </p>
        )}
        {(date || stance || freshness) && (
          <div className="flex items-center gap-sm font-label-mono text-[10px] text-on-surface-variant mt-xs">
            {date && <span>{date}</span>}
            {stance && (
              <>
                {date && <span className="text-outline">·</span>}
                <span className="capitalize">{stance}</span>
              </>
            )}
            {freshness && (
              <>
                {(date || stance) && <span className="text-outline">·</span>}
                <span className="capitalize">{freshness}</span>
              </>
            )}
          </div>
        )}
      </div>

      <span className={cn(badge.wrapper, "flex-shrink-0")}>
        <span className={badge.dot} />
        {badge.label}
      </span>
    </div>
  );
}
