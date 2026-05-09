import { cn } from "@/utils/classNames";
import type { GridProps } from "@/types/primitives";
import type { ReactNode, CSSProperties } from "react";

export const Grid = ({
  columns = 2,
  gap = "md",
  minColumnWidth,
  className,
  children,
}: GridProps & { className?: string; children?: ReactNode }) => {
  const gapMap: Record<string, string> = {
    xs: "gap-xs",
    sm: "gap-sm",
    md: "gap-md",
    lg: "gap-lg",
  };

  const gridStyle: CSSProperties = {};

  if (minColumnWidth) {
    gridStyle.gridTemplateColumns = `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`;
  } else if (typeof columns === "number") {
    gridStyle.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
  } else if (columns && typeof columns === "object") {
    gridStyle.gridTemplateColumns = Object.entries(columns)
      .map(([, v]) => `minmax(0, ${v}fr)`)
      .join(" ");
  }

  return (
    <div
      data-ct-primitive="Grid"
      className={cn("grid", gapMap[gap] ?? gapMap.md, className)}
      style={gridStyle}
    >
      {children}
    </div>
  );
};
