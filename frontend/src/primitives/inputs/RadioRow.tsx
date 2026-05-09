import { cn } from "@/utils/classNames";
import type { RadioRowProps } from "@/types/primitives";

export function RadioRow({
  label,
  name,
  items,
  value,
  onChange,
  className,
}: RadioRowProps & { onChange?: (value: string) => void; className?: string }) {
  return (
    <div className={cn("space-y-[4px]", className)} data-ct-primitive="RadioRow">
      {label && (
        <span className="block font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-[4px]">
          {label}
        </span>
      )}
      {items?.map((item) => {
        const isSelected = value === item.value;
        return (
          <label key={item.id} className="flex items-center gap-[8px] cursor-pointer">
            <div
              className={cn(
                "w-[18px] h-[18px] border rounded-full flex items-center justify-center transition-colors",
                isSelected ? "border-[#000000]" : "border-[#c4c4c4] hover:border-[#000000]"
              )}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-[#000000]" />}
            </div>
            <input
              type="radio"
              name={name}
              className="sr-only"
              value={item.value}
              checked={isSelected}
              onChange={() => onChange?.(item.value)}
            />
            <span
              className={cn(
                "font-['Geist'] text-[12px]",
                isSelected ? "text-[#1b1b1b]" : "text-[#6b6b6b]"
              )}
            >
              {item.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
