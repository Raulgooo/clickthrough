import { cn } from "@/utils/classNames";
import type { CheckboxRowProps } from "@/types/primitives";

export function CheckboxRow({
  label,
  items,
  onChange,
  className,
}: CheckboxRowProps & { onChange?: (id: string, checked: boolean) => void; className?: string }) {
  return (
    <div className={cn("space-y-[4px]", className)} data-ct-primitive="CheckboxRow">
      {label && (
        <span className="block font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-[4px]">
          {label}
        </span>
      )}
      {items?.map((item) => (
        <label key={item.id} className="flex items-center gap-[8px] cursor-pointer group">
          <div
            className={cn(
              "w-[18px] h-[18px] border rounded-sm flex items-center justify-center transition-colors",
              item.checked ? "bg-[#000000] border-[#000000]" : "border-[#c4c4c4] group-hover:border-[#000000]"
            )}
          >
            {item.checked && (
              <span className="material-symbols-outlined text-[14px] text-white">check</span>
            )}
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={item.checked}
            onChange={(e) => onChange?.(item.id, e.target.checked)}
          />
          <span className="font-['Geist'] text-[12px] text-[#1b1b1b]">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
