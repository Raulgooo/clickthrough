import { cn } from "@/utils/classNames";
import type { PermissionBadgeProps } from "@/types/primitives";

export function PermissionBadge({
  permission,
  scope,
  status = "granted",
  className,
}: PermissionBadgeProps & { className?: string }) {
  const isDanger =
    permission.startsWith("admin:") ||
    permission.includes("*") ||
    status === "denied";

  return (
    <span
      data-ct-primitive="PermissionBadge"
      className={cn(
        "inline-flex items-center gap-xs px-xs py-xs rounded font-label-mono text-[10px]",
        isDanger
          ? "bg-error-container text-error border border-error"
          : status === "pending"
          ? "bg-surface-container text-on-surface-variant border border-dashed border-outline"
          : "bg-surface-container text-on-surface-variant border border-outline",
        className
      )}
    >
      {scope ? `${scope}:${permission}` : permission}
    </span>
  );
}
