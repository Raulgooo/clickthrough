import { cn } from "@/utils/classNames";
import type { AgentStateIndicatorProps } from "@/types/primitives";

const STATES = ["observing", "planning", "searching", "generating"] as const;

export function AgentStateIndicator({
  state = "observing",
  message,
  className,
}: AgentStateIndicatorProps & { className?: string }) {
  const activeIndex = STATES.indexOf(
    (state?.toLowerCase() as (typeof STATES)[number]) ?? "observing"
  );

  return (
    <div
      data-ct-primitive="AgentStateIndicator"
      className={cn("flex items-center gap-md", className)}
    >
      {STATES.map((s, i) => {
        const isActive = i === activeIndex;
        const isPast = i < activeIndex;

        return (
          <div key={s} className="flex items-center gap-sm">
            <div className="flex items-center gap-sm">
              <span
                className={cn(
                  "w-2 h-2 rounded-full shrink-0",
                  isActive && "bg-primary animate-[pulse-dot_2s_ease-in-out_infinite]",
                  isPast && "bg-primary",
                  !isActive && !isPast && "bg-on-surface-variant/40"
                )}
              />
              <span
                className={cn(
                  "font-body-sm text-body-sm capitalize",
                  isActive || isPast
                    ? "text-on-background"
                    : "text-on-surface-variant"
                )}
              >
                {s}
              </span>
            </div>
            {i < STATES.length - 1 && (
              <span className="text-on-surface-variant/40 text-body-sm">
                →
              </span>
            )}
          </div>
        );
      })}
      {message && (
        <span className="ml-auto font-label-mono text-label-mono text-on-surface-variant">
          {message}
        </span>
      )}
    </div>
  );
}
