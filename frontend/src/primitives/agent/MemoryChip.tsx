import { cn } from "@/utils/classNames";
import type { MemoryChipProps } from "@/types/primitives";

const SOURCE_ICON: Record<string, string> = {
  user: "person",
  site: "language",
  session: "schedule",
};

export function MemoryChip({
  hint = "",
  source = "session",
  className,
}: MemoryChipProps & { className?: string }) {
  if (!hint) return null;

  const icon = SOURCE_ICON[source] ?? "memory";

  return (
    <span
      data-ct-primitive="MemoryChip"
      className={cn(
        "inline-flex items-center gap-xs px-xs py-xs rounded",
        "bg-surface-container font-label-mono text-[10px] text-on-surface-variant",
        "border border-outline",
        className
      )}
    >
      <span className="material-symbols-outlined text-[12px]">{icon}</span>
      {hint}
    </span>
  );
}
