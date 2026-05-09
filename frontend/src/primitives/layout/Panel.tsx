import { cn } from "@/utils/classNames";
import type { PanelProps } from "@/types/primitives";
import type { ReactNode } from "react";

export const Panel = ({
  title,
  subtitle,
  size = "md",
  tone = "neutral",
  chrome = "standard",
  className,
  children,
}: PanelProps & { className?: string; children?: ReactNode }) => {
  const sizeClasses: Record<string, string> = {
    xs: "p-xs",
    sm: "p-sm",
    md: "p-md",
    lg: "p-lg",
    xl: "p-xl",
  };

  const toneBorder: Record<string, string> = {
    neutral: "border-outline",
    info: "border-primary",
    success: "border-success",
    warning: "border-warning",
    danger: "border-error",
  };

  return (
    <div
      data-ct-primitive="Panel"
      data-size={size}
      data-tone={tone}
      data-chrome={chrome}
      className={cn(
        "bg-surface border rounded subtle-lift overflow-hidden",
        toneBorder[tone] ?? toneBorder.neutral,
        chrome === "minimal" && "shadow-none",
        chrome === "dense" && "hard-shadow",
        className
      )}
    >
      {title && (
        <div className="p-md border-b border-outline">
          <div className="font-headline-sm text-headline-sm font-semibold">
            {title}
          </div>
          {subtitle && (
            <div className="font-label-mono text-label-mono text-on-surface-variant mt-xs">
              {subtitle}
            </div>
          )}
        </div>
      )}
      <div className={cn(sizeClasses[size] ?? sizeClasses.md)}>{children}</div>
    </div>
  );
};
