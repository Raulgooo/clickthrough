import { cn } from "@/utils/classNames";
import type { SuccessStateProps } from "@/types/primitives";

export function SuccessState({
  title,
  body,
  nextActions,
  className,
}: SuccessStateProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="SuccessState"
      className={cn("text-center py-md", className)}
    >
      <span className="material-symbols-outlined text-[32px] text-primary mb-sm">
        check_circle
      </span>
      <div className="font-headline-sm text-headline-sm font-semibold text-primary mb-xs">
        {title}
      </div>
      {body && (
        <div className="font-body-sm text-body-sm text-on-surface-variant mb-md">
          {body}
        </div>
      )}
      {nextActions && nextActions.length > 0 && (
        <div className="flex gap-sm justify-center flex-wrap">
          {nextActions.map((action, i) => (
            <button
              key={i}
              className="px-md py-sm bg-transparent text-on-surface-variant rounded font-label-mono text-label-mono hover:bg-surface-container-high transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
