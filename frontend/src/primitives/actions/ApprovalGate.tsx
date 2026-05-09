import { cn } from "@/utils/classNames";
import type { ApprovalGateProps } from "@/types/primitives";

export function ApprovalGate({
  title,
  summary,
  risks,
  approveLabel,
  cancelLabel,
  approvalActionId,
  className,
}: ApprovalGateProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ApprovalGate"
      className={cn("border border-outline rounded p-md subtle-lift", className)}
    >
      <div className="flex items-center gap-sm mb-sm">
        <span className="material-symbols-outlined text-[18px] text-error">
          warning
        </span>
        <span className="font-headline-sm text-headline-sm font-bold text-primary">
          {title}
        </span>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
        {summary}
      </p>
      {risks && risks.length > 0 && (
        <div className="space-y-xs mb-md">
          {risks.map((risk, i) => (
            <div key={i} className="font-label-mono text-label-mono text-error">
              {risk.label}
              {risk.level && ` (${risk.level})`}
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-sm justify-end">
        <button className="px-md py-sm bg-transparent text-on-surface-variant rounded font-label-mono text-label-mono hover:bg-surface-container-high transition-colors">
          {cancelLabel}
        </button>
        <button
          data-action-id={approvalActionId}
          className="px-md py-sm bg-error text-on-error rounded border border-error font-label-mono text-label-mono hover:opacity-90 transition-opacity"
        >
          {approveLabel}
        </button>
      </div>
    </div>
  );
}
