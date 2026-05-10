import { cn } from "@/utils/classNames";
import type { SourceQualityBadgeProps } from "@/types/primitives";

export function SourceQualityBadge({
  quality,
  reason,
  className,
}: SourceQualityBadgeProps & { className?: string }) {
  const isHigh = quality === "high";
  const isLow = quality === "low";

  return (
    <div
      data-ct-primitive="SourceQualityBadge"
      className={cn(
        "inline-flex items-center gap-xs px-xs py-xs rounded-full font-label-mono text-[10px]",
        isHigh
          ? "bg-primary-container text-on-primary"
          : isLow
          ? "bg-surface-container text-on-surface-variant border border-dashed border-outline"
          : "bg-surface-container text-on-surface-variant",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isHigh
            ? "bg-on-primary"
            : isLow
            ? "border border-on-surface-variant"
            : "bg-on-surface-variant"
        )}
      />
      {quality && quality !== "unknown"
        ? quality.charAt(0).toUpperCase() + quality.slice(1)
        : "Needs review"}
      {reason && (
        <span className="text-on-surface-variant ml-xs">{reason}</span>
      )}
    </div>
  );
}
