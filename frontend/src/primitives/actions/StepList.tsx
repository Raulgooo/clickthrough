import { cn } from "@/utils/classNames";
import type { StepListProps } from "@/types/primitives";

export function StepList({
  goal,
  steps,
  riskLevel,
  requiresApproval,
  className,
}: StepListProps & { className?: string }) {
  return (
    <div data-ct-primitive="StepList" className={cn("space-y-sm", className)}>
      {goal && (
        <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
          {goal}
        </div>
      )}
      <div className="space-y-sm">
        {steps?.map((step, i) => (
          <div key={i} className="flex gap-sm items-start">
            <span className="font-label-mono text-label-mono text-on-surface-variant w-4">
              {i + 1}.
            </span>
            <div>
              <div className="font-body-sm text-body-sm font-medium text-on-background">
                {step.label}
              </div>
              {step.status && (
                <div className="font-label-mono text-label-mono text-on-surface-variant">
                  {step.status}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {riskLevel && (
        <div className="font-label-mono text-label-mono text-on-surface-variant">
          Risk: {riskLevel}
        </div>
      )}
      {requiresApproval && (
        <div className="font-label-mono text-label-mono text-on-surface-variant">
          Requires approval
        </div>
      )}
    </div>
  );
}
