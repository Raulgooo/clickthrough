import { cn } from "@/utils/classNames";
import type { FlowDiagramProps } from "@/types/primitives";

export function FlowDiagram({
  nodes = [],
  edges = [],
  layout = "horizontal",
  className,
}: FlowDiagramProps & { className?: string }) {
  const isHorizontal = layout === "horizontal";
  const isRadial = layout === "radial";

  // Build adjacency for simple rendering
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // If no edges, just render nodes in a row
  if (edges.length === 0) {
    return (
      <div
        data-ct-primitive="FlowDiagram"
        className={cn(
          isHorizontal
            ? "flex items-center gap-sm flex-wrap"
            : "flex flex-col items-center gap-sm",
          className
        )}
      >
        {nodes.map((node, i) => (
          <FlowNode key={node.id} node={node} isLast={i === nodes.length - 1} />
        ))}
      </div>
    );
  }

  // For horizontal layout with edges, render nodes and arrows in order
  // We'll do a simple topological-ish walk for display purposes
  const visited = new Set<string>();
  const ordered: Array<{ id: string; label: string; edgeLabel?: string }> = [];

  function walk(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    const node = nodeMap.get(id);
    if (!node) return;

    const outEdges = edges.filter((e) => e.from === id);
    ordered.push({ id: node.id, label: node.label });
    for (const e of outEdges) {
      ordered.push({ id: e.to, label: e.label ?? "", edgeLabel: e.label });
      walk(e.to);
    }
  }

  // Find root nodes (no incoming edges)
  const incoming = new Set(edges.map((e) => e.to));
  const roots = nodes.filter((n) => !incoming.has(n.id));
  for (const r of roots) walk(r.id);

  // Add any remaining unvisited nodes
  for (const n of nodes) {
    if (!visited.has(n.id)) {
      ordered.push({ id: n.id, label: n.label });
    }
  }

  if (isRadial) {
    return (
      <div
        data-ct-primitive="FlowDiagram"
        className={cn("relative w-full h-48", className)}
      >
        {nodes.map((node, i) => {
          const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 40; // percent
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          return (
            <div
              key={node.id}
              className="absolute px-sm py-xs border border-outline rounded bg-surface font-label-mono text-label-mono text-on-surface-variant"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      data-ct-primitive="FlowDiagram"
      className={cn(
        isHorizontal
          ? "flex items-center gap-sm flex-wrap"
          : "flex flex-col items-center gap-sm",
        className
      )}
    >
      {ordered.map((item, i) => {
        const isEdge = item.edgeLabel !== undefined && i > 0;
        const isLastNode = i === ordered.length - 1 && !isEdge;

        if (isEdge) {
          return (
            <div key={`edge-${i}`} className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                arrow_forward
              </span>
              {item.edgeLabel && (
                <span className="font-label-mono text-[10px] text-on-surface-variant">
                  {item.edgeLabel}
                </span>
              )}
            </div>
          );
        }

        const node = nodeMap.get(item.id);
        if (!node) return null;

        return (
          <FlowNode
            key={`node-${item.id}-${i}`}
            node={node}
            isLast={isLastNode}
          />
        );
      })}
    </div>
  );
}

function FlowNode({
  node,
  isLast,
}: {
  node: { id: string; label: string };
  isLast?: boolean;
}) {
  return (
    <div
      className={cn(
        "px-sm py-xs border rounded font-label-mono text-label-mono text-on-surface-variant",
        isLast
          ? "border-primary bg-primary-container text-on-primary"
          : "border-outline"
      )}
    >
      {node.label}
    </div>
  );
}
