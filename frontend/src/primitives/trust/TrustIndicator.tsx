import { cn } from "@/utils/classNames";
import type { TrustIndicatorProps } from "@/types/primitives";

export function TrustIndicator({
  level = "unverified",
  label,
  detail,
  className,
}: TrustIndicatorProps & { className?: string }) {
  const config = {
    trusted: {
      icon: "verified",
      iconClass: "text-primary",
      textClass: "text-on-background",
    },
    unverified: {
      icon: "help",
      iconClass: "text-on-surface-variant",
      textClass: "text-on-surface-variant",
    },
    suspicious: {
      icon: "warning",
      iconClass: "text-error",
      textClass: "text-error",
    },
  };

  const { icon, iconClass, textClass } = config[level];
  const displayLabel =
    label ??
    (level === "trusted"
      ? "Cryptographically verified"
      : level === "suspicious"
      ? "Suspicious"
      : "Identity unconfirmed");

  return (
    <div
      data-ct-primitive="TrustIndicator"
      className={cn("flex items-center gap-sm", className)}
    >
      <span
        className={cn("material-symbols-outlined text-[16px]", iconClass)}
      >
        {icon}
      </span>
      <div>
        <span className={cn("font-body-sm text-body-sm", textClass)}>
          {displayLabel}
        </span>
        {detail && (
          <div className="font-label-mono text-label-mono text-on-surface-variant">
            {detail}
          </div>
        )}
      </div>
    </div>
  );
}
