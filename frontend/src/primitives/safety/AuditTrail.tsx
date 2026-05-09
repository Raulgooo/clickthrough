import { cn } from "@/utils/classNames";
import type { AuditTrailProps } from "@/types/primitives";

export function AuditTrail({
  entries,
  className,
}: AuditTrailProps & { className?: string }) {
  const iconForAction = (action: string) => {
    if (action.includes("approved")) return "person";
    if (action.includes("key")) return "key";
    if (action.includes("mail") || action.includes("notif")) return "mail";
    return "history";
  };

  return (
    <div
      data-ct-primitive="AuditTrail"
      className={cn(
        "space-y-xs font-label-mono text-label-mono text-on-surface-variant",
        className
      )}
    >
      {entries?.map((entry, i) => (
        <div key={i} className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-[14px]">
            {iconForAction(entry.action)}
          </span>
          <span>{entry.action}</span>
          {entry.actor && (
            <>
              <span className="text-outline">·</span>
              <span>{entry.actor}</span>
            </>
          )}
          <span className="text-outline">·</span>
          <span>{entry.timestamp}</span>
        </div>
      ))}
    </div>
  );
}
