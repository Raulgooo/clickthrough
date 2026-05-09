import { cn } from "@/utils/classNames";
import type { StackProps } from "@/types/primitives";
import type { ReactNode } from "react";

export const Stack = ({
  direction = "vertical",
  gap = "md",
  align = "stretch",
  wrap = false,
  className,
  children,
}: StackProps & { className?: string; children?: ReactNode }) => {
  const gapMap: Record<string, string> = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  const alignMap: Record<string, string> = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  return (
    <div
      data-ct-primitive="Stack"
      data-direction={direction}
      className={cn(
        "flex",
        direction === "vertical" ? "flex-col" : "flex-row",
        gapMap[gap] ?? gapMap.md,
        alignMap[align] ?? alignMap.stretch,
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
};
