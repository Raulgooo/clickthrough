import { cn } from "@/utils/classNames";
import type { SourceTrailProps } from "@/types/primitives";

export function SourceTrail({
  steps = [],
  currentStep,
  className,
}: SourceTrailProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="SourceTrail"
      className={cn("flex items-center gap-xs flex-wrap", className)}
    >
      {steps.map((step, i) => {
        const isDone =
          step.state === "done" ||
          (currentStep !== undefined && i < currentStep);
        const isRunning = step.state === "running" || i === currentStep;
        const isFailed = step.state === "failed";

        return (
          <div key={i} className="flex items-center gap-xs">
            <div className="flex items-center gap-xs font-label-mono text-label-mono text-on-surface-variant">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isFailed
                    ? "bg-error"
                    : isDone || isRunning
                    ? "bg-primary"
                    : "border border-outline"
                )}
              />
              {step.label}
            </div>
            {i < steps.length - 1 && (
              <div className="w-4 h-px bg-outline-variant" />
            )}
          </div>
        );
      })}
    </div>
  );
}
