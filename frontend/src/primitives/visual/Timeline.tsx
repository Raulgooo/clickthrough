import { cn } from "@/utils/classNames";
import type { TimelineProps } from "@/types/primitives";

export function Timeline({
  items = [],
  activeId,
  className,
}: TimelineProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="Timeline"
      className={cn("relative pl-6 space-y-sm", className)}
    >
      {/* Vertical line */}
      <div
        className="absolute left-[11px] top-2 bottom-2 w-px bg-outline-variant"
        aria-hidden="true"
      />

      {items.map((item) => {
        const isActive =
          item.active || (activeId !== undefined && item.id === activeId);

        return (
          <div key={item.id ?? item.label} className="relative">
            {/* Dot */}
            <div
              className={cn(
                "absolute -left-[22px] top-1.5 w-[10px] h-[10px] rounded-full border-2",
                isActive
                  ? "border-primary bg-primary"
                  : "border-outline bg-surface"
              )}
            />
            <div className="font-body-sm text-body-sm font-medium text-on-background">
              {item.label}
            </div>
            {item.date && (
              <div className="font-label-mono text-label-mono text-on-surface-variant">
                {item.date}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
