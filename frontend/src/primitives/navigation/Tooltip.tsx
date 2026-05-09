import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@/utils/classNames";
import type { TooltipProps } from "@/types/primitives";

const PLACEMENT_CLASSES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-1",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-1",
  left: "right-full top-1/2 -translate-y-1/2 mr-1",
  right: "left-full top-1/2 -translate-y-1/2 ml-1",
};

export function Tooltip({
  content,
  placement = "top",
  children,
  className,
}: TooltipProps & { children?: ReactNode; className?: string }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(true), 200);
  };

  const hide = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), 100);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <span
      data-ct-primitive="Tooltip"
      className={cn("relative inline-block", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children ?? (
        <span className="cursor-help border-b border-dashed border-outline font-body-sm text-body-sm text-on-background">
          Hover me
        </span>
      )}
      {visible && (
        <span
          className={cn(
            "absolute z-50 px-sm py-xs rounded border border-outline",
            "bg-surface font-body-sm text-body-sm text-on-background",
            "shadow-subtle-lift whitespace-nowrap pointer-events-none",
            PLACEMENT_CLASSES[placement] ?? PLACEMENT_CLASSES.top
          )}
          role="tooltip"
        >
          {content}
        </span>
      )}
    </span>
  );
}
