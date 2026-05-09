import { cn } from "@/utils/classNames";
import type { LabelProps } from "@/types/primitives";

export function Label({ children, htmlFor, tone = "normal", size = "sm", className }: LabelProps & { className?: string }) {
  const toneClasses = {
    normal: "text-[#1b1b1b]",
    muted: "text-[#6b6b6b]",
    strong: "text-[#000000]",
  };

  const sizeClasses = {
    xs: "text-[10px]",
    sm: "text-[11px]",
    md: "text-[12px]",
  };

  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "font-['JetBrains_Mono'] uppercase tracking-wider inline-block",
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
      data-ct-primitive="Label"
    >
      {children}
    </label>
  );
}
