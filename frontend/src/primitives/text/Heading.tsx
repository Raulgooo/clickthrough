import { cn } from "@/utils/classNames";
import type { HeadingProps } from "@/types/primitives";

export function Heading({ level = 2, children, className }: HeadingProps & { className?: string }) {
  const levelClasses = {
    1: "text-[18px] font-bold leading-tight",
    2: "text-[16px] font-semibold",
    3: "text-[14px] font-semibold",
    4: "text-[13px] font-semibold",
  };

  const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";

  return (
    <Tag
      className={cn("font-['Geist'] text-[#000000]", levelClasses[level], className)}
      data-ct-primitive="Heading"
    >
      {children}
    </Tag>
  );
}
