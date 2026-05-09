import { cn } from "@/utils/classNames";
import type { DataStreamProps } from "@/types/primitives";

export function DataStream({
  label,
  active = true,
  throughput,
  className,
}: DataStreamProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="DataStream"
      className={cn(
        "bg-primary-container rounded p-sm font-label-mono text-label-mono text-on-primary",
        className
      )}
    >
      <span>{label || "Streaming data..."}</span>
      {active && <span className="ct-pulse">_</span>}
      {throughput && (
        <span className="ml-sm text-on-surface-variant">{throughput}</span>
      )}
    </div>
  );
}
