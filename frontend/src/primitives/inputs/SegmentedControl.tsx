import { cn } from "@/utils/classNames";
import type { SegmentedControlProps } from "@/types/primitives";

export function SegmentedControl({
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps & { onChange?: (value: string) => void; className?: string }) {
  return (
    <div
      className={cn("inline-flex border border-[#c4c4c4] rounded-[0.25rem] overflow-hidden", className)}
      data-ct-primitive="SegmentedControl"
    >
      {options?.map((opt, i) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange?.(opt.value)}
            className={cn(
              "px-[12px] py-[4px] font-['JetBrains_Mono'] text-[11px] transition-colors",
              isSelected
                ? "bg-[#eeeeee] text-[#1b1b1b] border-r border-[#c4c4c4]"
                : "bg-white text-[#6b6b6b] hover:bg-[#e8e8e8]",
              i === (options?.length ?? 0) - 1 && "border-r-0"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
