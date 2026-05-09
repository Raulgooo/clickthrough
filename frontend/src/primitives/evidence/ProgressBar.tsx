import { cn } from "@/utils/classNames";
import type { ProgressBarProps } from "@/types/primitives";

export function ProgressBar({
  value,
  label,
  tone = "neutral",
  className,
}: ProgressBarProps & { className?: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  const fillColor =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
      ? "bg-warning"
      : tone === "danger"
      ? "bg-error"
      : "bg-primary";

  return (
    <div
      data-ct-primitive="ProgressBar"
      className={cn("flex items-center gap-md", className)}
    >
      {label && (
        <span className="font-label-mono text-label-mono text-on-surface-variant w-20 truncate">
          {label}
        </span>
      )}
      <div className="flex-1 h-[3px] rounded-full bg-outline-variant overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", fillColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-tabular-data text-tabular-data font-semibold text-on-background w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}
