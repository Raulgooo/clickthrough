import { cn } from "@/utils/classNames";
import type { ComparisonTableProps } from "@/types/primitives";

export function ComparisonTable({
  columns = [],
  rows = [],
  highlightColumn,
  className,
}: ComparisonTableProps & { className?: string }) {
  return (
    <div data-ct-primitive="ComparisonTable" className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-outline">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left py-xs font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider",
                  highlightColumn === col.key && "text-primary"
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className={cn(
                ri < rows.length - 1 && "border-b border-outline-variant"
              )}
            >
              {columns.map((col) => {
                const cell = row[col.key];
                const isHighlighted = highlightColumn === col.key;
                return (
                  <td
                    key={col.key}
                    className={cn(
                      "py-xs",
                      isHighlighted
                        ? "text-on-background bg-surface-container-low"
                        : "text-on-surface-variant"
                    )}
                  >
                    {String(cell ?? "—")}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
