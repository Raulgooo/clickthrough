import { cn } from "@/utils/classNames";
import type { CalloutProps } from "@/types/primitives";

export function Callout({ title, body, tone = "info", action, className }: CalloutProps & { className?: string }) {
  const borderColors = {
    info: "border-l-[#000000]",
    success: "border-l-[#000000]",
    warning: "border-l-[#c4c4c4]",
    danger: "border-l-[#ba1a1a]",
  };

  const titleColors = {
    info: "text-[#1b1b1b]",
    success: "text-[#1b1b1b]",
    warning: "text-[#1b1b1b]",
    danger: "text-[#ba1a1a]",
  };

  return (
    <div
      className={cn("pl-[12px] border-l-2", borderColors[tone], className)}
      data-ct-primitive="Callout"
    >
      {title && (
        <p className={cn("font-['Geist'] text-[12px] font-semibold", titleColors[tone])}>{title}</p>
      )}
      <p className="font-['Geist'] text-[12px] text-[#6b6b6b] leading-relaxed">{body}</p>
      {action && typeof action.label === "string" && (
        <button className="mt-[8px] font-['JetBrains_Mono'] text-[11px] text-[#000000] underline underline-offset-2 hover:opacity-70 transition-opacity">
          {action.label}
        </button>
      )}
    </div>
  );
}
