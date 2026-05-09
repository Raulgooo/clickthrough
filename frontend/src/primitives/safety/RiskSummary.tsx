import { cn } from "@/utils/classNames";
import type { RiskSummaryProps } from "@/types/primitives";

export function RiskSummary({
  riskLevel,
  items,
  recommendation,
  className,
}: RiskSummaryProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="RiskSummary"
      className={cn(
        "border rounded p-md",
        riskLevel === "high"
          ? "border-error bg-error-container"
          : riskLevel === "medium"
          ? "border-warning bg-surface-container"
          : "border-outline bg-surface-container-low",
        className
      )}
    >
      <div className="flex items-center gap-sm">
        <span
          className={cn(
            "material-symbols-outlined text-[20px]",
            riskLevel === "high" ? "text-error" : "text-on-surface-variant"
          )}
        >
          warning
        </span>
        <div className="flex-1">
          <div
            className={cn(
              "font-body-sm text-body-sm font-semibold",
              riskLevel === "high" ? "text-error" : "text-on-background"
            )}
          >
            {riskLevel
              ? `${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} risk`
              : "Risk summary"}
            {items && items.length > 0 && ` — ${items.length} items`}
          </div>
          {recommendation && (
            <div
              className={cn(
                "font-label-mono text-label-mono",
                riskLevel === "high"
                  ? "text-on-error-container"
                  : "text-on-surface-variant"
              )}
            >
              {recommendation}
            </div>
          )}
        </div>
      </div>
      {items && items.length > 0 && (
        <ul className="mt-sm space-y-xs">
          {items.map((item, i) => (
            <li
              key={i}
              className={cn(
                "font-label-mono text-label-mono",
                item.level === "high" ? "text-error" : "text-on-surface-variant"
              )}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
