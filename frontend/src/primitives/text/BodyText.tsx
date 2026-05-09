import { cn } from "@/utils/classNames";
import type { BodyTextProps } from "@/types/primitives";

export function BodyText({ children, tone = "normal", maxLines, className }: BodyTextProps & { className?: string }) {
  const toneClasses = {
    normal: "text-[#1b1b1b]",
    muted: "text-[#6b6b6b]",
    strong: "text-[#000000]",
  };

  return (
    <p
      className={cn("font-['Geist'] text-[13px] leading-relaxed", toneClasses[tone], className)}
      style={
        maxLines
          ? {
              display: "-webkit-box",
              WebkitLineClamp: maxLines,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
          : undefined
      }
      data-ct-primitive="BodyText"
    >
      {children}
    </p>
  );
}
