import { cn } from "@/utils/classNames";
import type { SequenceDiagramProps } from "@/types/primitives";

export function SequenceDiagram({
  actors = [],
  messages = [],
  activeStep,
  highlightRisk,
  className,
}: SequenceDiagramProps & { className?: string }) {
  const leftActor = actors[0] ?? "Client";
  const rightActor = actors[1] ?? "Server";

  return (
    <div
      data-ct-primitive="SequenceDiagram"
      className={cn(
        "grid grid-cols-[auto_1fr_auto] gap-md items-center",
        className
      )}
    >
      {/* Left actor */}
      <div className="flex flex-col items-center justify-center">
        <div className="font-label-mono text-label-mono font-semibold text-on-surface-variant py-md px-sm border border-outline rounded writing-mode-vertical text-orientation-mixed rotate-180"
             style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          {leftActor}
        </div>
      </div>

      {/* Messages */}
      <div className="space-y-sm">
        {messages.map((msg, i) => {
          const isActive = activeStep === i;
          const isRisk = highlightRisk && msg.label.toLowerCase().includes(highlightRisk.toLowerCase());
          const isRight = msg.to === rightActor;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-xs px-3 py-1 rounded text-[11px] border",
                isRight ? "ml-8" : "",
                isRisk
                  ? "bg-error-container border-error text-error"
                  : isActive
                  ? "bg-surface-container-low border-primary text-on-background"
                  : "bg-surface-container-low border-outline-variant text-on-surface-variant"
              )}
            >
              <span className="font-label-mono text-label-mono whitespace-nowrap">
                {msg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Right actor */}
      <div className="flex flex-col items-center justify-center">
        <div className="font-label-mono text-label-mono font-semibold text-on-surface-variant py-md px-sm border border-outline rounded"
             style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}>
          {rightActor}
        </div>
      </div>
    </div>
  );
}
