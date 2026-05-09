import { cn } from "@/utils/classNames";
import type { SplitPaneProps } from "@/types/primitives";
import { Children } from "react";
import type { ReactNode } from "react";

export const SplitPane = ({
  ratio = "1:1",
  collapseBelow,
  className,
  children,
}: SplitPaneProps & { className?: string; children?: ReactNode }) => {
  const childArray = Children.toArray(children);

  return (
    <div
      data-ct-primitive="SplitPane"
      data-ratio={ratio}
      className={cn(
        "grid gap-sm",
        collapseBelow && `max-[${collapseBelow}px]:grid-cols-1`,
        ratio === "1:1" && "grid-cols-2",
        ratio === "2:1" && "grid-cols-[2fr_1fr]",
        ratio === "1:2" && "grid-cols-[1fr_2fr]",
        className
      )}
    >
      <div className="p-sm font-body-sm text-body-sm text-on-surface-variant">
        {childArray[0]}
      </div>
      <div className="p-sm border-l border-outline font-body-sm text-body-sm text-on-surface-variant">
        {childArray[1]}
      </div>
    </div>
  );
};
