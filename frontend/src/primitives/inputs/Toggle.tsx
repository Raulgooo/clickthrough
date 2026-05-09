import { cn } from "@/utils/classNames";
import type { ToggleProps } from "@/types/primitives";

export function Toggle({
  label,
  checked,
  description,
  onChange,
  className,
}: ToggleProps & { onChange?: (checked: boolean) => void; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[8px]", className)} data-ct-primitive="Toggle">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange?.(!checked)}
        className={cn(
          "w-[36px] h-[20px] rounded-full relative transition-colors duration-150 ease-in-out",
          checked ? "bg-[#000000]" : "bg-[#cfc4c5]"
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow transition-transform duration-150 ease-in-out",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
      <div className="flex flex-col">
        <span className="font-['Geist'] text-[12px] text-[#1b1b1b]">{label}</span>
        {description && <span className="font-['Geist'] text-[11px] text-[#6b6b6b]">{description}</span>}
      </div>
    </div>
  );
}
