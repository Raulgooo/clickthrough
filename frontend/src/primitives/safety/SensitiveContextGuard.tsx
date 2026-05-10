import { cn } from "@/utils/classNames";
import type { SensitiveContextGuardProps } from "@/types/primitives";

export function SensitiveContextGuard({
  category,
  message,
  continueActionId,
  onContinue,
  onCancel,
  className,
}: SensitiveContextGuardProps & { onContinue?: () => void; onCancel?: () => void; className?: string }) {
  return (
    <div
      data-ct-primitive="SensitiveContextGuard"
      className={cn(
        "border border-outline rounded p-md text-center subtle-lift",
        className
      )}
    >
      <span className="material-symbols-outlined text-[24px] text-on-surface-variant mb-sm">
        shield
      </span>
      <div className="font-headline-sm text-headline-sm font-semibold text-primary mb-xs">
        {category
          ? `${category.charAt(0).toUpperCase() + category.slice(1)} Topic`
          : "Sensitive Topic"}
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
        {message}
      </p>
      <div className="flex gap-sm justify-center">
        <button
          type="button"
          onClick={onCancel}
          className="px-md py-sm bg-transparent text-on-surface-variant rounded font-label-mono text-label-mono hover:bg-surface-container-high transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          data-action-id={continueActionId}
          onClick={onContinue}
          className="px-md py-sm bg-primary text-on-primary rounded border border-primary font-label-mono text-label-mono hover:bg-inverse-surface transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
