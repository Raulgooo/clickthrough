import { cn } from "@/utils/classNames";
import type { UncertaintyNoteProps } from "@/types/primitives";

export function UncertaintyNote({
  reason,
  missingEvidence,
  whatWouldChangeVerdict,
  className,
}: UncertaintyNoteProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="UncertaintyNote"
      className={cn(
        "pt-sm border-t border-dashed border-outline-variant",
        className
      )}
    >
      <p className="font-body-sm text-body-sm text-on-surface-variant italic">
        {reason}
      </p>
      {missingEvidence && missingEvidence.length > 0 && (
        <div className="mt-xs font-label-mono text-label-mono text-on-surface-variant">
          Missing: {missingEvidence.join(", ")}
        </div>
      )}
      {whatWouldChangeVerdict && (
        <div className="mt-xs font-label-mono text-label-mono text-on-surface-variant">
          What would change the verdict: {whatWouldChangeVerdict}
        </div>
      )}
    </div>
  );
}
