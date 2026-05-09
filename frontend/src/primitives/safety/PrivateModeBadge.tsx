import { cn } from "@/utils/classNames";
import type { PrivateModeBadgeProps } from "@/types/primitives";

export function PrivateModeBadge({
  label,
  className,
}: PrivateModeBadgeProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="PrivateModeBadge"
      className={cn(
        "inline-flex items-center gap-xs px-sm py-xs rounded-full bg-surface-container font-label-mono text-label-mono text-on-surface-variant border border-dashed border-outline",
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-on-surface-variant" />
      {label ?? "Private — nothing stored"}
    </div>
  );
}
