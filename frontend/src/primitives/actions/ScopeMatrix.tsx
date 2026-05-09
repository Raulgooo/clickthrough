import { cn } from "@/utils/classNames";
import type { ScopeMatrixProps } from "@/types/primitives";

export function ScopeMatrix({
  scopes,
  selectedScopes,
  mode: _mode,
  riskLabels,
  className,
}: ScopeMatrixProps & { className?: string }) {
  const isSelected = (id: string) => selectedScopes?.includes(id) ?? false;

  return (
    <div data-ct-primitive="ScopeMatrix" className={cn("w-full", className)}>
      <table className="w-full border-collapse text-body-sm">
        <thead>
          <tr className="border-b border-outline">
            <th className="text-left py-xs font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              Permission
            </th>
            <th className="text-center py-xs font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              Granted
            </th>
          </tr>
        </thead>
        <tbody>
          {scopes?.map((scope) => {
            const selected = isSelected(scope.id);
            const isHighRisk = scope.risk === "high";
            return (
              <tr
                key={scope.id}
                className={cn(
                  "border-b border-outline-variant",
                  isHighRisk && "bg-error-container"
                )}
              >
                <td
                  className={cn(
                    "py-xs",
                    isHighRisk
                      ? "text-error font-medium"
                      : "text-on-background"
                  )}
                >
                  {scope.label}
                  {scope.description && (
                    <div className="font-label-mono text-label-mono text-on-surface-variant">
                      {scope.description}
                    </div>
                  )}
                </td>
                <td className="py-xs text-center">
                  {selected && (
                    <span
                      className={cn(
                        "material-symbols-outlined text-[14px]",
                        isHighRisk ? "text-error" : "text-primary"
                      )}
                    >
                      check
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {riskLabels && (
        <div className="mt-sm font-label-mono text-label-mono text-on-surface-variant">
          {Object.entries(riskLabels).map(([k, v]) => (
            <div key={k}>
              {k}: {v}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
