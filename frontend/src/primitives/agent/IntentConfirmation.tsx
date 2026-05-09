import { cn } from "@/utils/classNames";
import type { IntentConfirmationProps } from "@/types/primitives";

export function IntentConfirmation({
  intent,
  confidence,
  onConfirm,
  onReject,
  className,
}: IntentConfirmationProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="IntentConfirmation"
      className={cn("border border-primary rounded p-md bg-surface", className)}
    >
      <div className="font-label-mono text-label-mono text-primary uppercase tracking-wider mb-xs">
        Intent Detected
      </div>
      <p className="font-body-sm text-body-sm text-on-background mb-md">
        &ldquo;{intent}&rdquo;
      </p>
      {confidence !== undefined && (
        <div className="flex items-center gap-sm mb-md">
          <div className="flex-1 h-[3px] rounded-full bg-outline-variant overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, confidence * 100))}%` }}
            />
          </div>
          <span className="font-tabular-data text-tabular-data font-semibold text-on-background w-12 text-right">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
      <div className="flex gap-sm justify-end">
        {onReject && (
          <button
            type="button"
            className={cn(
              "px-md py-sm bg-transparent text-on-surface-variant rounded border border-outline",
              "font-label-mono text-label-mono hover:bg-surface-container-high transition-colors"
            )}
          >
            Not quite
          </button>
        )}
        {onConfirm && (
          <button
            type="button"
            className={cn(
              "px-md py-sm bg-primary text-on-primary rounded border border-primary",
              "font-label-mono text-label-mono hover:bg-inverse-surface transition-colors"
            )}
          >
            Yes, proceed
          </button>
        )}
      </div>
    </div>
  );
}
