import { type MapFrameProps } from "@/types/primitives";
import { cn } from "@/utils/classNames";

export function MapFrame({
  center,
  markers,
  className,
}: MapFrameProps & { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-container-low border border-outline-variant rounded overflow-hidden h-32 relative",
        className
      )}
      data-ct-primitive="MapFrame"
    >
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="border border-outline-variant/30" />
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-error border-2 border-surface" />

      {markers?.map((m, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary border border-surface"
          style={{
            top: `${30 + ((i * 17) % 40)}%`,
            left: `${30 + ((i * 23) % 40)}%`,
          }}
          title={m.label}
        />
      ))}

      {center && (
        <div className="absolute bottom-1 left-1 font-label-mono text-[10px] text-on-surface-variant bg-surface/80 px-xs py-xs rounded">
          {center.lat.toFixed(2)}, {center.lng.toFixed(2)}
        </div>
      )}
    </div>
  );
}
