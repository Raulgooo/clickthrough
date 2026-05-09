import { cn } from "@/utils/classNames";
import type { AnnotatedDiagramProps } from "@/types/primitives";

export function AnnotatedDiagram({
  title,
  imageOrSvg,
  callouts = [],
  className,
}: AnnotatedDiagramProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="AnnotatedDiagram"
      className={cn("space-y-sm", className)}
    >
      {title && (
        <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
          {title}
        </div>
      )}
      <div className="relative p-md bg-surface-container-low rounded border border-outline-variant min-h-[4rem]">
        {imageOrSvg ? (
          <img
            src={imageOrSvg}
            alt={title ?? "Annotated diagram"}
            className="w-full h-auto rounded border border-outline bg-surface"
          />
        ) : (
          <div className="h-16 bg-surface rounded border border-outline" />
        )}

        {callouts.map((c, i) => (
          <div
            key={i}
            className="absolute w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            title={c.label}
          >
            {i + 1}
          </div>
        ))}
      </div>
      {callouts.length > 0 && (
        <ol className="space-y-xs">
          {callouts.map((c, i) => (
            <li
              key={i}
              className="flex items-start gap-xs font-body-sm text-body-sm text-on-background"
            >
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold flex-shrink-0">
                {i + 1}
              </span>
              <span>{c.label}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
