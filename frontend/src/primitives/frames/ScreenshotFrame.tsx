import { type ScreenshotFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function ScreenshotFrame({
  src,
  caption,
  annotated,
  className,
}: ScreenshotFrameProps & { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface border border-outline rounded overflow-hidden",
        className
      )}
      data-ct-primitive="ScreenshotFrame"
    >
      <div className="h-4 bg-surface-container-high border-b border-outline-variant flex items-center px-sm gap-xs">
        <div className="w-2 h-2 rounded-full bg-error" />
        <div className="w-2 h-2 rounded-full bg-outline" />
        <div className="w-2 h-2 rounded-full bg-outline" />
        <span className="font-label-mono text-[10px] text-on-surface-variant ml-auto">
          {src}
        </span>
      </div>
      <div className="relative h-24 bg-surface-container flex items-center justify-center">
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Page screenshot
        </span>
        {annotated && (
          <>
            <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold">
              1
            </div>
            <div className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center font-label-mono text-[10px] font-bold">
              2
            </div>
          </>
        )}
      </div>
      {caption && (
        <div className="p-sm border-t border-outline-variant font-body-sm text-body-sm text-on-background">
          {caption}
        </div>
      )}
    </div>
  );
}
