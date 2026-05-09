import { cn } from "@/utils/classNames";
import type { SelectProps } from "@/types/primitives";

export function Select({
  label,
  value,
  options,
  onChange,
  className,
}: SelectProps & { onChange?: (value: string) => void; className?: string }) {
  return (
    <div className={cn("w-full", className)} data-ct-primitive="Select">
      {label && (
        <label className="block font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-[4px]">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-[8px] py-[4px] bg-white border border-[#c4c4c4] rounded-[0.25rem] text-[12px] text-[#1b1b1b] outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-all cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b6b6b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "32px",
        }}
      >
        {options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
