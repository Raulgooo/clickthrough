import { cn } from "@/utils/classNames";
import type { StepperProps } from "@/types/primitives";

export function Stepper({
  steps = [],
  activeStep,
  orientation = "horizontal",
  className,
}: StepperProps & { className?: string }) {
  const isVertical = orientation === "vertical";

  return (
    <div
      data-ct-primitive="Stepper"
      className={cn(
        isVertical ? "flex flex-col gap-sm" : "flex items-start gap-sm",
        className
      )}
    >
      {steps.map((step, i) => {
        const isDone = step.state === "done" || (activeStep !== undefined && i < activeStep);
        const isActive = step.state === "active" || i === activeStep;
        const isError = step.state === "error";

        return (
          <div key={i} className={cn(isVertical ? "flex items-start gap-sm" : "flex flex-col items-center gap-xs flex-1", isVertical && "w-full")}>
            {/* Circle */}
            <div
              className={cn(
                "w-6 h-6 rounded-full border flex items-center justify-center font-label-mono text-[10px] font-bold flex-shrink-0",
                isError
                  ? "border-error text-error"
                  : isDone || isActive
                  ? "border-primary text-primary"
                  : "border-outline text-on-surface-variant"
              )}
            >
              {isDone ? (
                <span className="material-symbols-outlined text-[14px]">
                  check
                </span>
              ) : (
                <span>{i + 1}</span>
              )}
            </div>

            {/* Connector */}
            {!isVertical && i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-px mt-[11px]",
                  isDone ? "bg-primary" : "bg-outline-variant"
                )}
              />
            )}
            {isVertical && i < steps.length - 1 && (
              <div className="w-px h-4 bg-outline-variant ml-[11px]" />
            )}

            {/* Label */}
            {!isVertical && (
              <div className="font-label-mono text-[10px] text-on-surface-variant text-center mt-1">
                {step.title}
              </div>
            )}
            {isVertical && (
              <div className="flex-1">
                <div className="font-body-sm text-body-sm font-medium text-on-background">
                  {step.title}
                </div>
                {step.body && (
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    {step.body}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
