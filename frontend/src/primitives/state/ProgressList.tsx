import { cn } from "@/utils/classNames";
import type { ProgressListProps } from "@/types/primitives";

export function ProgressList({
  items = [],
  className,
}: ProgressListProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ProgressList"
      className={cn("space-y-sm", className)}
    >
      {items.map((item, i) => {
        const isDone = item.state === "done";
        const isRunning = item.state === "running";
        const isFailed = item.state === "failed";

        return (
          <div
            key={i}
            className={cn(
              "flex items-center gap-sm font-body-sm text-body-sm",
              isFailed
                ? "text-error"
                : isDone || isRunning
                ? "text-on-background"
                : "text-on-surface-variant"
            )}
          >
            {isDone && (
              <span className="material-symbols-outlined text-[16px] text-primary">
                check_circle
              </span>
            )}
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-primary ct-pulse" />
            )}
            {isFailed && (
              <span className="material-symbols-outlined text-[16px] text-error">
                error
              </span>
            )}
            {!isDone && !isRunning && !isFailed && (
              <span className="w-2 h-2 rounded-full border border-outline" />
            )}
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
