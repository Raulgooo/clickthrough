import { cn } from "@/utils/classNames";
import type { EvidenceStackProps, EvidenceSourceProps } from "@/types/primitives";
import { EvidenceSource } from "./EvidenceSource";

function groupSources(
  sources: EvidenceSourceProps[] = [],
  groupBy: EvidenceStackProps["groupBy"]
): Array<{ key: string; items: EvidenceSourceProps[] }> {
  if (groupBy === "none" || !groupBy) {
    return [{ key: "Sources", items: sources }];
  }
  const map = new Map<string, EvidenceSourceProps[]>();
  for (const src of sources) {
    const rawKey = src[groupBy] as string | undefined;
    const key = rawKey && rawKey !== "unknown" ? rawKey : "Needs review";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(src);
  }
  return Array.from(map.entries()).map(([key, items]) => ({ key, items }));
}

export function EvidenceStack({
  sources = [],
  groupBy = "none",
  className,
}: EvidenceStackProps & { className?: string }) {
  const groups = groupSources(sources, groupBy);

  return (
    <div
      data-ct-primitive="EvidenceStack"
      className={cn(
        "border border-outline rounded overflow-hidden",
        className
      )}
    >
      <div className="p-sm border-b border-outline-variant flex items-center gap-sm">
        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
          link
        </span>
        <span className="font-body-sm text-body-sm text-on-background">
          {sources.length} source{sources.length !== 1 ? "s" : ""} found
        </span>
      </div>

      {groups.map((group, gi) => (
        <div key={group.key}>
          {groupBy !== "none" && groups.length > 1 && (
            <div className="px-sm py-xs font-label-mono text-[10px] uppercase tracking-wider text-on-surface-variant bg-surface-container-low">
              {group.key}
            </div>
          )}
          {group.items.map((item, ii) => (
            <div
              key={`${gi}-${ii}`}
              className={cn(
                "px-sm",
                ii < group.items.length - 1 && "border-b border-outline-variant"
              )}
            >
              <EvidenceSource {...item} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
