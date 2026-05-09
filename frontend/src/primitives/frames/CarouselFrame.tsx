import { useState } from "react";
import { type CarouselFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function CarouselFrame({
  items,
  className,
}: CarouselFrameProps & { className?: string }) {
  const [current, setCurrent] = useState(0);
  const total = items?.length ?? 0;

  const goPrev = () => setCurrent((c) => (c > 0 ? c - 1 : total - 1));
  const goNext = () => setCurrent((c) => (c < total - 1 ? c + 1 : 0));

  return (
    <div
      className={cn(
        "bg-surface border border-outline rounded overflow-hidden",
        className
      )}
      data-ct-primitive="CarouselFrame"
    >
      <div className="h-28 bg-surface-container flex items-center justify-center relative">
        {total > 0 ? (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Image {current + 1} / {total}
          </span>
        ) : (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            No images
          </span>
        )}

        {total > 1 && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-surface border border-outline flex items-center justify-center hover:bg-surface-container-high transition-colors"
              aria-label="Previous"
            >
              <span className="material-symbols-outlined text-[14px]">
                chevron_left
              </span>
            </button>
            <button
              onClick={goNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded bg-surface border border-outline flex items-center justify-center hover:bg-surface-container-high transition-colors"
              aria-label="Next"
            >
              <span className="material-symbols-outlined text-[14px]">
                chevron_right
              </span>
            </button>
          </>
        )}
      </div>

      {total > 0 && (
        <div className="p-sm border-t border-outline-variant flex justify-center gap-xs">
          {items?.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                "w-4 h-1 rounded-full transition-colors",
                i === current ? "bg-primary" : "bg-outline-variant"
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
