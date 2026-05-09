import { cn } from "@/utils/classNames";
import type { ExecutionLogProps } from "@/types/primitives";

export function ExecutionLog({
  entries,
  currentEntry,
  mode,
  className,
}: ExecutionLogProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ExecutionLog"
      className={cn(
        "bg-primary-container text-inverse-on-surface rounded p-md font-label-mono text-label-mono overflow-y-auto",
        mode === "compact" ? "max-h-32" : "max-h-64",
        className
      )}
      style={{ lineHeight: "1.7" }}
    >
      {entries?.map((entry, i) => {
        const isActive = currentEntry === i;
        const icon =
          entry.status === "done"
            ? "✓"
            : entry.status === "failed"
            ? "!"
            : "○";
        const statusColor =
          entry.status === "failed"
            ? "text-error"
            : entry.status === "done"
            ? "text-on-primary"
            : "text-on-surface-variant";
        return (
          <div
            key={i}
            className={cn("flex gap-sm", isActive && "opacity-100")}
          >
            <span className={statusColor}>{icon}</span>
            <span>{entry.label}</span>
            {mode === "verbose" && entry.detail && (
              <span className="text-on-surface-variant ml-auto">
                {entry.detail}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
