import { cn } from "@/utils/classNames";
import type { BadgeProps } from "@/types/primitives";

const TONE_STYLES: Record<string, string> = {
  neutral: "bg-surface-container text-on-surface-variant border-outline",
  info: "bg-primary-container text-on-primary border-primary",
  success: "bg-surface-container text-on-surface-variant border-outline",
  warning: "bg-surface-container text-on-surface-variant border-outline",
  danger: "bg-error-container text-error border-error",
};

export function Badge({
  label,
  tone = "neutral",
  className,
}: BadgeProps & { className?: string }) {
  const isCircular =
    label.length <= 2 && /^[0-9!?.\-+]+$/.test(label);

  return (
    <span
      data-ct-primitive="Badge"
      className={cn(
        "inline-flex items-center justify-center",
        "font-label-mono text-[10px] font-bold",
        "border",
        isCircular
          ? "w-5 h-5 rounded-full"
          : "px-xs py-xs rounded",
        TONE_STYLES[tone] ?? TONE_STYLES.neutral,
        className
      )}
    >
      {label}
    </span>
  );
}
