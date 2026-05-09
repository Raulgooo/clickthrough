import { cn } from "@/utils/classNames";
import type { SecurityBoundaryProps } from "@/types/primitives";
import type { ReactNode } from "react";

export function SecurityBoundary({
  level,
  children,
  className,
}: Omit<SecurityBoundaryProps, "children"> & {
  children?: ReactNode;
  className?: string;
}) {
  const borderColor =
    level === "high"
      ? "border-error"
      : level === "medium"
      ? "border-warning"
      : "border-primary";

  return (
    <div
      data-ct-primitive="SecurityBoundary"
      className={cn(
        "border-2 border-dashed rounded p-md",
        borderColor,
        className
      )}
    >
      <div className="flex items-center gap-sm mb-sm">
        <span className="material-symbols-outlined text-[16px] text-primary">
          security
        </span>
        <span className="font-label-mono text-label-mono text-primary uppercase tracking-wider">
          Clickthrough Controlled
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        This action surface is generated and controlled by Clickthrough. The
        host page cannot access these controls.
      </p>
      {children && <div className="mt-md">{children}</div>}
    </div>
  );
}
