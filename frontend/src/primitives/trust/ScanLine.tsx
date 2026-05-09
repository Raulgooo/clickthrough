import { cn } from "@/utils/classNames";
import type { ScanLineProps } from "@/types/primitives";

export function ScanLine({
  active = true,
  progress,
  label,
  className,
}: ScanLineProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ScanLine"
      className={cn(
        "relative h-16 bg-surface-container-low rounded border border-outline-variant overflow-hidden",
        className
      )}
    >
      {active && (
        <div
          className="absolute top-1/2 left-0 h-px bg-primary ct-pulse"
          style={{
            width: progress !== undefined ? `${progress}%` : "100%",
          }}
        />
      )}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-label-mono text-label-mono text-on-surface-variant">
        {label || "Scanning..."}
      </div>
    </div>
  );
}
