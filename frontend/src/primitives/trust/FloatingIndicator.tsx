import { cn } from "@/utils/classNames";
import type { FloatingIndicatorProps } from "@/types/primitives";

export function FloatingIndicator({
  label,
  tone = "neutral",
  pulse = true,
  className,
}: FloatingIndicatorProps & { className?: string }) {
  const dotColor =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
      ? "bg-warning"
      : tone === "danger"
      ? "bg-error"
      : tone === "info"
      ? "bg-primary"
      : "bg-primary";

  if (!label) {
    return (
      <span
        data-ct-primitive="FloatingIndicator"
        className={cn(
          "inline-block w-3 h-3 rounded-full",
          dotColor,
          pulse && "ct-pulse",
          className
        )}
      />
    );
  }

  return (
    <span
      data-ct-primitive="FloatingIndicator"
      className={cn(
        "inline-flex items-center gap-xs px-xs py-xs rounded-full bg-surface border border-outline font-label-mono text-[10px] text-on-surface-variant",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          dotColor,
          pulse && "ct-pulse"
        )}
      />
      {label}
    </span>
  );
}
