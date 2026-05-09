import { cn } from "@/utils/classNames";
import type { TagProps } from "@/types/primitives";

export function Tag({
  label,
  removable,
  onRemove,
  className,
}: TagProps & { className?: string }) {
  return (
    <span
      data-ct-primitive="Tag"
      className={cn(
        "inline-flex items-center gap-xs px-xs py-xs rounded",
        "bg-surface-container font-label-mono text-[10px] text-on-surface-variant",
        "border border-outline",
        className
      )}
    >
      {label.startsWith("#") ? label : `#${label}`}
      {removable && (
        <button
          type="button"
          onClick={() => {
            /* onRemove is a string actionId in props; consuming code wires it */
            void onRemove;
          }}
          className="inline-flex items-center justify-center hover:text-on-background transition-colors"
          aria-label={`Remove ${label}`}
        >
          <span className="material-symbols-outlined text-[12px]">close</span>
        </button>
      )}
    </span>
  );
}
