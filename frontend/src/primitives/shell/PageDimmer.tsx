import { cn } from "@/utils/classNames";
import type { PageDimmerProps } from "@/types/primitives";

export const PageDimmer = ({
  strength = 0.04,
  preserveAnchor = false,
  className,
}: PageDimmerProps & { className?: string }) => {
  return (
    <div
      data-ct-primitive="PageDimmer"
      data-preserve-anchor={preserveAnchor}
      className={cn("absolute inset-0 flex items-center justify-center", className)}
      style={{ backgroundColor: `rgba(0, 0, 0, ${strength})` }}
    >
      <span className="font-label-mono text-label-mono text-on-surface-variant">
        {Math.round(strength * 100)}% opacity scrim
      </span>
    </div>
  );
};
