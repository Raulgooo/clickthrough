import { cn } from "@/utils/classNames";
import type { DividerProps } from "@/types/primitives";

export const Divider = ({
  orientation = "horizontal",
  tone = "neutral",
  className,
}: DividerProps & { className?: string }) => {
  const toneMap: Record<string, string> = {
    neutral: "border-outline",
    muted: "border-outline-variant",
    strong: "border-primary",
  };

  return (
    <div
      data-ct-primitive="Divider"
      data-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? cn("w-full border-t", toneMap[tone] ?? toneMap.neutral)
          : cn("h-full border-l", toneMap[tone] ?? toneMap.neutral),
        className
      )}
    />
  );
};
