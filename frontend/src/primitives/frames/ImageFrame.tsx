import { type ImageFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function ImageFrame({
  alt,
  caption,
  className,
}: ImageFrameProps & { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-container-low border border-outline-variant rounded overflow-hidden",
        className
      )}
      data-ct-primitive="ImageFrame"
    >
      <div
        className="h-32 bg-gradient-to-br from-surface-container-high to-surface-container flex items-center justify-center"
        aria-label={alt}
      >
        <span className="material-symbols-outlined text-[48px] text-outline-variant">
          image
        </span>
      </div>
      {caption && (
        <div className="p-sm border-t border-outline-variant">
          <div className="font-body-sm text-body-sm font-medium text-on-background">
            {caption}
          </div>
          {alt && (
            <div className="font-label-mono text-label-mono text-on-surface-variant">
              {alt}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
