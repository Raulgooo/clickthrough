import { cn } from "@/utils/classNames";
import type { MetadataProps } from "@/types/primitives";

export function Metadata({ items, layout = "inline", className }: MetadataProps & { className?: string }) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className={cn(
        layout === "inline" ? "flex items-center gap-[8px] flex-wrap" : "flex flex-col gap-[4px]",
        className
      )}
      data-ct-primitive="Metadata"
    >
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-center", layout === "stack" ? "gap-[4px]" : "gap-[8px]")}>
          {layout === "stack" && (
            <span className="font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider">
              {item.label}
            </span>
          )}
          <span className="font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b]">{item.value}</span>
          {layout === "inline" && i < items.length - 1 && (
            <span className="text-[#c4c4c4]">&middot;</span>
          )}
        </div>
      ))}
    </div>
  );
}
