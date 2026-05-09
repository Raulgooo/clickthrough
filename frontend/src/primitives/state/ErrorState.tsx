import { cn } from "@/utils/classNames";
import type { ErrorStateProps } from "@/types/primitives";

export function ErrorState({
  title,
  body,
  retryActionId,
  details,
  className,
}: ErrorStateProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ErrorState"
      className={cn("text-center py-md", className)}
    >
      <span className="material-symbols-outlined text-[32px] text-error mb-sm">
        error
      </span>
      <div className="font-headline-sm text-headline-sm font-semibold text-error mb-xs">
        {title}
      </div>
      {body && (
        <div className="font-body-sm text-body-sm text-on-surface-variant mb-md">
          {body}
        </div>
      )}
      {details && (
        <div className="font-label-mono text-label-mono text-on-surface-variant mb-md bg-surface-container-low rounded p-sm">
          {details}
        </div>
      )}
      {retryActionId && (
        <button className="px-md py-sm bg-surface text-on-background rounded border border-outline font-label-mono text-label-mono hover:bg-surface-container-high transition-colors">
          Retry
        </button>
      )}
    </div>
  );
}
