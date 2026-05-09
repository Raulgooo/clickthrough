import { cn } from "@/utils/classNames";
import type { BudgetBarProps } from "@/types/primitives";

export function BudgetBar({
  turnsUsed,
  turnsMax,
  toolsUsed,
  toolsMax,
  elapsedMs,
  className,
}: BudgetBarProps & { className?: string }) {
  const turnsPct = turnsMax > 0 ? (turnsUsed / turnsMax) * 100 : 0;
  const toolsPct = toolsMax > 0 ? (toolsUsed / toolsMax) * 100 : 0;

  const elapsedSec = Math.round(elapsedMs / 1000);
  const elapsedLabel =
    elapsedSec < 60
      ? `${elapsedSec}s`
      : `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`;

  return (
    <div
      data-ct-primitive="BudgetBar"
      className={cn("space-y-sm", className)}
    >
      <div className="flex items-center justify-between font-label-mono text-[10px] text-on-surface-variant">
        <span>Turns</span>
        <span>
          {turnsUsed} / {turnsMax}
        </span>
      </div>
      <div className="h-2 bg-surface-container-low rounded overflow-hidden flex">
        <div
          className="h-full bg-primary border-r border-surface"
          style={{ width: `${Math.min(100, turnsPct)}%` }}
        />
        <div
          className="h-full bg-surface-container-high"
          style={{ width: `${Math.max(0, 100 - turnsPct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between font-label-mono text-[10px] text-on-surface-variant">
        <span>Tools</span>
        <span>
          {toolsUsed} / {toolsMax}
        </span>
      </div>
      <div className="h-2 bg-surface-container-low rounded overflow-hidden flex">
        <div
          className="h-full bg-primary border-r border-surface"
          style={{ width: `${Math.min(100, toolsPct)}%` }}
        />
        <div
          className="h-full bg-surface-container-high"
          style={{ width: `${Math.max(0, 100 - toolsPct)}%` }}
        />
      </div>

      <div className="flex items-center justify-between font-label-mono text-[10px] text-on-surface-variant pt-xs">
        <span>Elapsed</span>
        <span>{elapsedLabel}</span>
      </div>
    </div>
  );
}
