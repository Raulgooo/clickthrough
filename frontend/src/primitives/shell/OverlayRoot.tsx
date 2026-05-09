import { cn } from "@/utils/classNames";
import type { OverlayRootProps } from "@/types/primitives";
import type { ReactNode } from "react";

export const OverlayRoot = ({
  id,
  intent,
  anchor,
  mode,
  dismissible,
  hostTheme,
  className,
  children,
}: OverlayRootProps & { className?: string; children?: ReactNode }) => {
  return (
    <div
      id={id}
      data-ct-primitive="OverlayRoot"
      data-intent={intent}
      data-mode={mode}
      data-anchor={anchor}
      data-dismissible={dismissible}
      data-host-theme={hostTheme ? JSON.stringify(hostTheme) : undefined}
      className={cn(
        "fixed inset-0 z-[9999] pointer-events-none",
        className
      )}
    >
      <div className="relative w-full h-full">{children}</div>
    </div>
  );
};
