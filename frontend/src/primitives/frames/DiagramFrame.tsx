import { type DiagramFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function DiagramFrame({
  caption,
  className,
}: DiagramFrameProps & { className?: string }) {
  return (
    <div
      className={cn("bg-surface border border-outline rounded p-md", className)}
      data-ct-primitive="DiagramFrame"
    >
      <div className="flex items-center justify-center gap-md font-label-mono text-label-mono text-on-background">
        <div className="px-md py-sm border border-outline rounded">Client</div>
        <span className="text-on-surface-variant">→</span>
        <div className="px-md py-sm border border-primary bg-primary-container text-on-primary rounded">
          Server
        </div>
        <span className="text-on-surface-variant">→</span>
        <div className="px-md py-sm border border-outline rounded">DB</div>
      </div>
      {caption && (
        <div className="mt-sm text-center font-body-sm text-body-sm text-on-surface-variant">
          {caption}
        </div>
      )}
    </div>
  );
}
