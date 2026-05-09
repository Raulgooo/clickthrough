import { cn } from "@/utils/classNames";
import type { CTMarkProps } from "@/types/primitives";

export const CTMark = ({
  variant = "badge",
  status = "idle",
  className,
}: CTMarkProps & { className?: string }) => {
  if (variant === "wordmark") {
    return (
      <div
        data-ct-primitive="CTMark"
        data-variant={variant}
        data-status={status}
        className={cn("flex items-center gap-md", className)}
      >
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary font-bold text-[10px]">
          CT
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Clickthrough
        </span>
      </div>
    );
  }

  if (variant === "corner") {
    return (
      <div
        data-ct-primitive="CTMark"
        data-variant={variant}
        data-status={status}
        className={cn(
          "w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]",
          className
        )}
      >
        CT
      </div>
    );
  }

  if (variant === "icon") {
    return (
      <div
        data-ct-primitive="CTMark"
        data-variant={variant}
        data-status={status}
        className={cn(
          "w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary",
          className
        )}
      >
        <span className="material-symbols-outlined text-[14px]">verified</span>
      </div>
    );
  }

  // badge (default)
  return (
    <div
      data-ct-primitive="CTMark"
      data-variant={variant}
      data-status={status}
      className={cn(
        "w-6 h-6 bg-primary rounded flex items-center justify-center text-on-primary font-bold text-[10px]",
        className
      )}
    >
      CT
    </div>
  );
};
