import { cn } from "@/utils/classNames";
import type { LoadingSpinnerProps } from "@/types/primitives";

export function LoadingSpinner({
  size = "md",
  label,
  className,
}: LoadingSpinnerProps & { className?: string }) {
  const sizeClass =
    size === "sm"
      ? "w-4 h-4 border-2"
      : size === "lg"
      ? "w-8 h-8 border-[3px]"
      : "w-6 h-6 border-2";

  return (
    <div
      data-ct-primitive="LoadingSpinner"
      className={cn("flex items-center justify-center py-md", className)}
    >
      <div
        className={cn(
          "border-outline-variant border-t-primary rounded-full animate-spin",
          sizeClass
        )}
      />
      {label && (
        <span className="ml-sm font-body-sm text-body-sm text-on-surface-variant">
          {label}
        </span>
      )}
    </div>
  );
}
