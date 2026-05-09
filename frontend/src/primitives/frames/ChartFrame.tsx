import { type ChartFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

const defaultLabels = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const defaultValues = [40, 65, 85, 55, 70];

export function ChartFrame({
  data,
  className,
}: ChartFrameProps & { className?: string }) {
  const values =
    data && data.length > 0
      ? data.map((d, i) => {
          const v = Number(
            d.value ?? d.count ?? d.y ?? defaultValues[i] ?? 50
          );
          return Number.isNaN(v) ? 50 : v;
        })
      : defaultValues;

  const labels =
    data && data.length > 0
      ? data.map((d, i) => String(d.label ?? d.x ?? defaultLabels[i] ?? ""))
      : defaultLabels;

  const max = Math.max(...values, 1);

  return (
    <div
      className={cn("bg-surface border border-outline rounded p-md", className)}
      data-ct-primitive="ChartFrame"
    >
      <div className="flex items-end gap-sm h-24 px-md">
        {values.map((v, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 rounded-t transition-all",
              i === 2 ? "bg-primary" : "bg-surface-container-high"
            )}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-xs font-label-mono text-[10px] text-on-surface-variant px-md">
        {labels.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  );
}
