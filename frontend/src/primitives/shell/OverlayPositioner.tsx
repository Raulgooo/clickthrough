import { cn } from "@/utils/classNames";
import type { OverlayPositionerProps } from "@/types/primitives";
import type { ReactNode } from "react";

const modes = [
  { label: "inline", active: false },
  { label: "popover", active: false },
  { label: "side", active: false },
  { label: "spotlight", active: true },
  { label: "fullscreen", active: false },
  { label: "native", active: false },
];

export const OverlayPositioner = ({
  position = "center",
  offset,
  zIndex,
  className,
  children,
}: OverlayPositionerProps & { className?: string; children?: ReactNode }) => {
  const positionClasses: Record<string, string> = {
    center: "justify-center items-center",
    anchor: "",
    cursor: "",
    top: "justify-center items-start",
    bottom: "justify-center items-end",
    left: "justify-start items-center",
    right: "justify-end items-center",
  };

  return (
    <div
      data-ct-primitive="OverlayPositioner"
      data-position={position}
      className={cn(
        "grid grid-cols-3 gap-xs text-center font-label-mono text-label-mono text-on-surface-variant",
        positionClasses[position] ?? positionClasses.center,
        className
      )}
      style={{
        zIndex,
        ...(offset && {
          transform: `translate(${offset.x ?? 0}px, ${offset.y ?? 0}px)`,
        }),
      }}
    >
      {children ??
        modes.map((m) => (
          <div
            key={m.label}
            className={cn(
              "border rounded p-xs",
              m.active
                ? "border-primary bg-primary-container text-on-primary"
                : "border-outline bg-surface-container-low"
            )}
          >
            {m.label}
          </div>
        ))}
    </div>
  );
};
