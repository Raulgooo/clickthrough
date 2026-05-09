import { cn } from "@/utils/classNames";
import type { FollowUpBarProps } from "@/types/primitives";

export function FollowUpBar({
  suggestions = [],
  onSelect,
  className,
}: FollowUpBarProps & { className?: string }) {
  if (suggestions.length === 0) return null;

  return (
    <div
      data-ct-primitive="FollowUpBar"
      className={cn("flex gap-sm overflow-x-auto pb-xs", className)}
    >
      {suggestions.map((suggestion, i) => (
        <button
          key={`${suggestion}-${i}`}
          type="button"
          className={cn(
            "px-sm py-xs rounded border border-outline",
            "font-label-mono text-[10px] text-on-surface-variant",
            "hover:bg-surface-container-high transition-colors whitespace-nowrap",
            i === suggestions.length - 1 &&
              "border-primary bg-primary-container text-on-primary hover:bg-inverse-surface"
          )}
        >
          {suggestion}
        </button>
      ))}
      {onSelect && (
        <span className="sr-only">Follow-up action: {onSelect}</span>
      )}
    </div>
  );
}
