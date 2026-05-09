import { type MediaFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function MediaFrame({
  type,
  caption,
  controls,
  className,
}: MediaFrameProps & { className?: string }) {
  const isAudio = type === "audio";
  const progress = 33;

  return (
    <div
      className={cn("bg-primary-container rounded overflow-hidden", className)}
      data-ct-primitive="MediaFrame"
    >
      <div
        className={cn(
          "bg-inverse-surface flex items-center justify-center relative",
          isAudio ? "h-20" : "aspect-video"
        )}
      >
        <span className="material-symbols-outlined text-[48px] text-inverse-on-surface">
          {isAudio ? "audiotrack" : "play_circle"}
        </span>
        {controls && (
          <div className="absolute bottom-2 left-2 right-2 h-1 bg-inverse-on-surface/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-inverse-on-surface rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
      {caption && (
        <div className="p-sm">
          <div className="font-body-sm text-body-sm text-on-primary">
            {caption}
          </div>
          <div className="font-label-mono text-label-mono text-on-primary/70">
            0:42 / 2:15
          </div>
        </div>
      )}
    </div>
  );
}
