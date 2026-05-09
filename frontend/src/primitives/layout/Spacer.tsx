import { cn } from "@/utils/classNames";
import type { SpacerProps } from "@/types/primitives";

export const Spacer = ({
  size = "md",
  className,
}: SpacerProps & { className?: string }) => {
  const sizeMap: Record<string, string> = {
    xs: "h-2",
    sm: "h-4",
    md: "h-8",
    lg: "h-12",
    xl: "h-16",
  };

  return (
    <div
      data-ct-primitive="Spacer"
      data-size={size}
      className={cn(
        "w-full bg-primary-container rounded",
        sizeMap[size] ?? sizeMap.md,
        className
      )}
    />
  );
};
