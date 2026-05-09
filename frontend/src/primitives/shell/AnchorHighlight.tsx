import { cn } from "@/utils/classNames";
import type { AnchorHighlightProps } from "@/types/primitives";

export const AnchorHighlight = ({
  targetSelector,
  label,
  tone = "neutral",
  pulse = false,
  className,
}: AnchorHighlightProps & { className?: string }) => {
  const toneMap: Record<string, string> = {
    neutral: "border-primary",
    info: "border-primary",
    warning: "border-warning",
    danger: "border-error",
  };

  return (
    <div
      data-ct-primitive="AnchorHighlight"
      data-tone={tone}
      data-target={targetSelector}
      className={cn(
        "border-2 rounded p-sm",
        toneMap[tone] ?? toneMap.neutral,
        pulse && "animate-pulse",
        className
      )}
    >
      {label && (
        <span className="font-body-sm text-body-sm text-on-background">
          {label}
        </span>
      )}
    </div>
  );
};
