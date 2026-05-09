import { cn } from "@/utils/classNames";
import type { EmptyStateProps } from "@/types/primitives";

export function EmptyState({
  title,
  body,
  action,
  className,
}: EmptyStateProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="EmptyState"
      className={cn("text-center py-md", className)}
    >
      <span className="material-symbols-outlined text-[32px] text-outline-variant mb-sm">
        inbox
      </span>
      <div className="font-headline-sm text-headline-sm font-semibold text-primary mb-xs">
        {title}
      </div>
      {body && (
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          {body}
        </div>
      )}
      {action && typeof action.label === "string" && (
        <button className="mt-md px-md py-sm bg-surface text-on-background rounded border border-outline font-label-mono text-label-mono hover:bg-surface-container-high transition-colors">
          {action.label}
        </button>
      )}
    </div>
  );
}
