import { cn } from "@/utils/classNames";
import type { ToolProgressCardProps } from "@/types/primitives";

const STATUS_ICON: Record<string, string> = {
  pending: "schedule",
  running: "autorenew",
  done: "check_circle",
  failed: "error",
};

export function ToolProgressCard({
  toolName = "Tool",
  status = "pending",
  progress = 0,
  detail,
  className,
}: ToolProgressCardProps & { className?: string }) {
  const icon = STATUS_ICON[status] ?? "build";

  return (
    <div
      data-ct-primitive="ToolProgressCard"
      className={cn(
        "border border-outline rounded p-sm bg-surface",
        className
      )}
    >
      <div className="flex items-center justify-between mb-sm">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
            {icon}
          </span>
          <span className="font-body-sm text-body-sm font-medium text-on-background">
            {toolName}
          </span>
        </div>
        {detail && (
          <span className="font-label-mono text-[10px] text-on-surface-variant">
            {detail}
          </span>
        )}
      </div>
      <div className="flex-1 h-[3px] rounded-full bg-outline-variant overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
