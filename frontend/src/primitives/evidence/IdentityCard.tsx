import { cn } from "@/utils/classNames";
import type { IdentityCardProps } from "@/types/primitives";

export function IdentityCard({
  name,
  aliases,
  avatarUrl,
  profiles,
  matchConfidence,
  className,
}: IdentityCardProps & { className?: string }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statusLabel =
    matchConfidence === undefined
      ? "Unverified"
      : matchConfidence >= 0.8
      ? "Verified"
      : matchConfidence >= 0.5
      ? "Partial"
      : "Unverified";

  const statusSolid = matchConfidence !== undefined && matchConfidence >= 0.5;

  return (
    <div
      data-ct-primitive="IdentityCard"
      className={cn(
        "flex items-center gap-md border border-outline rounded p-md",
        className
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="w-10 h-10 rounded-full border border-outline object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline flex items-center justify-center font-headline-sm text-headline-sm font-bold text-on-surface-variant flex-shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="font-body-md text-body-md font-semibold text-on-background truncate">
          {name}
        </div>
        {aliases && aliases.length > 0 && (
          <div className="font-label-mono text-label-mono text-on-surface-variant truncate">
            {aliases.join(", ")}
          </div>
        )}
        {profiles && profiles.length > 0 && (
          <div className="font-label-mono text-label-mono text-on-surface-variant truncate">
            {profiles.map((p) => p.label).join(" · ")}
          </div>
        )}
      </div>

      <span
        className={cn(
          "inline-flex items-center gap-xs px-sm py-xs rounded-full font-label-mono text-label-mono flex-shrink-0",
          statusSolid
            ? "bg-primary-container text-on-primary"
            : "bg-surface-container text-on-surface-variant border border-dashed border-outline"
        )}
      >
        <span
          className={cn(
            "w-2 h-2 rounded-full",
            statusSolid ? "bg-on-primary" : "border border-on-surface-variant"
          )}
        />
        {statusLabel}
      </span>
    </div>
  );
}
