import { cn } from "@/utils/classNames";
import type { ConclusionCardProps } from "@/types/primitives";

function verdictLabel(
  verdict?: ConclusionCardProps["verdict"]
): { text: string; style: string; dot: string } {
  switch (verdict) {
    case "true":
      return {
        text: "Likely true",
        style: "bg-primary-container text-on-primary",
        dot: "bg-on-primary",
      };
    case "false":
      return {
        text: "Likely false",
        style: "bg-error-container text-error",
        dot: "bg-error",
      };
    case "mixed":
      return {
        text: "Mixed",
        style: "bg-surface-container text-on-surface-variant border border-dashed border-outline",
        dot: "bg-on-surface-variant",
      };
    case "outdated":
      return {
        text: "Outdated",
        style: "bg-surface-container text-on-surface-variant border border-dashed border-outline",
        dot: "border border-on-surface-variant",
      };
    case "unverified":
      return {
        text: "Unverified",
        style: "bg-surface-container text-on-surface-variant border border-dashed border-outline",
        dot: "border border-on-surface-variant",
      };
    case "unknown":
    default:
      return {
        text: "Unknown",
        style: "bg-surface-container text-on-surface-variant border border-dashed border-outline",
        dot: "border border-on-surface-variant",
      };
  }
}

export function ConclusionCard({
  verdict,
  headline,
  summary,
  confidence,
  lastChecked,
  className,
}: ConclusionCardProps & { className?: string }) {
  const badge = verdictLabel(verdict);

  return (
    <div
      data-ct-primitive="ConclusionCard"
      className={cn("border-2 border-primary rounded p-md", className)}
    >
      <div className="mb-sm">
        <span
          className={cn(
            "inline-flex items-center gap-xs px-sm py-xs rounded-full font-label-mono text-label-mono",
            badge.style
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", badge.dot)} />
          {badge.text}
        </span>
      </div>
      {headline && (
        <p className="font-headline-sm text-headline-sm font-semibold text-primary mb-sm">
          {headline}
        </p>
      )}
      {summary && (
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
          {summary}
        </p>
      )}
      {(confidence !== undefined || lastChecked) && (
        <div className="flex items-center gap-sm font-label-mono text-label-mono text-on-surface-variant mt-sm">
          {confidence !== undefined && <span>Confidence: {Math.round(confidence)}%</span>}
          {lastChecked && (
            <>
              {confidence !== undefined && <span className="text-outline">·</span>}
              <span>Last checked: {lastChecked}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
