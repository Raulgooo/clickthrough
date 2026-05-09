import { cn } from "@/utils/classNames";
import type { VerificationResultProps } from "@/types/primitives";

export function VerificationResult({
  status,
  summary,
  evidence,
  nextActions,
  className,
}: VerificationResultProps & { className?: string }) {
  const icon =
    status === "success"
      ? "check_circle"
      : status === "failed"
      ? "error"
      : "help";

  const title =
    status === "success"
      ? "Action completed"
      : status === "failed"
      ? "Action failed"
      : status === "partial"
      ? "Partial success"
      : "Verification result";

  return (
    <div
      data-ct-primitive="VerificationResult"
      className={cn("border border-primary rounded p-md", className)}
    >
      <div className="flex items-center gap-sm mb-sm">
        <span className="material-symbols-outlined text-[18px] text-primary">
          {icon}
        </span>
        <span className="font-headline-sm text-headline-sm font-semibold text-primary">
          {title}
        </span>
      </div>
      {summary && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
          {summary}
        </p>
      )}
      {evidence && evidence.length > 0 && nextActions && nextActions.length > 0 ? (
        <div className="flex gap-sm">
          <input
            className="flex-1 px-sm py-sm bg-surface-container-low border border-outline rounded font-label-mono text-[11px] text-on-background outline-none"
            readOnly
            value={evidence[0]}
          />
          <button
            data-action-id={nextActions[0].actionId}
            className="px-md py-sm bg-primary text-on-primary rounded border border-primary font-label-mono text-label-mono hover:bg-inverse-surface transition-colors"
          >
            {nextActions[0].label}
          </button>
        </div>
      ) : (
        <div className="flex gap-sm flex-wrap">
          {nextActions?.map((action, i) => (
            <button
              key={i}
              data-action-id={action.actionId}
              className={cn(
                "px-md py-sm rounded font-label-mono text-label-mono transition-colors",
                i === 0 && status === "success"
                  ? "bg-primary text-on-primary border border-primary hover:bg-inverse-surface"
                  : "bg-transparent text-on-surface-variant hover:bg-surface-container-high"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
