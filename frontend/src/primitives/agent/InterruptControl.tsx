import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { InterruptControlProps } from "@/types/primitives";

type ControlState = "running" | "paused";

export function InterruptControl({
  onCancel,
  onPause,
  onResume,
  className,
}: InterruptControlProps & { className?: string }) {
  const [state, setState] = useState<ControlState>("running");

  const isPaused = state === "paused";

  return (
    <div
      data-ct-primitive="InterruptControl"
      className={cn("flex gap-sm", className)}
    >
      {onPause && !isPaused && (
        <button
          type="button"
          onClick={() => setState("paused")}
          className={cn(
            "flex-1 px-md py-sm bg-surface text-on-background rounded border border-outline",
            "font-label-mono text-label-mono hover:bg-surface-container-high transition-colors",
            "flex items-center justify-center gap-sm"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">pause</span>
          Pause
        </button>
      )}
      {onResume && isPaused && (
        <button
          type="button"
          onClick={() => setState("running")}
          className={cn(
            "flex-1 px-md py-sm bg-primary text-on-primary rounded border border-primary",
            "font-label-mono text-label-mono hover:bg-inverse-surface transition-colors",
            "flex items-center justify-center gap-sm"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">play_arrow</span>
          Resume
        </button>
      )}
      {onCancel && (
        <button
          type="button"
          className={cn(
            "flex-1 px-md py-sm bg-error text-on-error rounded border border-error",
            "font-label-mono text-label-mono hover:opacity-90 transition-opacity",
            "flex items-center justify-center gap-sm"
          )}
        >
          <span className="material-symbols-outlined text-[16px]">stop</span>
          Stop
        </button>
      )}
    </div>
  );
}
