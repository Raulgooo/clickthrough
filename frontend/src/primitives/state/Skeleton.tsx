import { cn } from "@/utils/classNames";
import type { SkeletonProps } from "@/types/primitives";

const widths = ["w-4/5", "w-3/5", "w-full", "w-2/5", "w-3/4"];

export function Skeleton({
  shape = "line",
  count = 4,
  className,
}: SkeletonProps & { className?: string }) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      data-ct-primitive="Skeleton"
      className={cn("space-y-sm w-full", className)}
    >
      {items.map((i) => {
        const isBlock = shape === "block" || (shape === "form" && i === 2);
        const isCard = shape === "card";
        const isDiagram = shape === "diagram";

        return (
          <div
            key={i}
            className={cn(
              "rounded animate-[skeletonSweep_1.5s_ease-in-out_infinite]",
              isDiagram ? "h-32" : isCard ? "h-24" : isBlock ? "h-10" : "h-4",
              shape === "line" || shape === "form" ? widths[i % widths.length] : "w-full"
            )}
            style={{
              background:
                "linear-gradient(90deg, #eeeeee 25%, #e2e2e2 50%, #eeeeee 75%)",
              backgroundSize: "200% 100%",
            }}
          />
        );
      })}
    </div>
  );
}
