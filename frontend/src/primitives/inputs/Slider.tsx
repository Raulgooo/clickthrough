import { cn } from "@/utils/classNames";
import type { SliderProps } from "@/types/primitives";

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
}: SliderProps & { onChange?: (value: number) => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[8px]", className)} data-ct-primitive="Slider">
      {label && (
        <span className="font-['Geist'] text-[12px] text-[#6b6b6b] w-12 shrink-0">{label}</span>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
        className="flex-1 h-1 bg-[#cfc4c5] rounded-lg appearance-none cursor-pointer accent-[#000000]"
      />
    </div>
  );
}
