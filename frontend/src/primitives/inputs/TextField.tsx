import { cn } from "@/utils/classNames";
import type { TextFieldProps } from "@/types/primitives";

export function TextField({
  label,
  value,
  placeholder,
  required,
  validation,
  onChange,
  className,
}: TextFieldProps & { onChange?: (value: string) => void; className?: string }) {
  return (
    <div className={cn("w-full", className)} data-ct-primitive="TextField">
      {label && (
        <label className="block font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-[4px]">
          {label}
          {required && <span className="text-[#ba1a1a] ml-[2px]">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full px-[8px] py-[4px] bg-white border border-[#c4c4c4] rounded-[0.25rem] text-[12px] text-[#1b1b1b] outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-all",
          validation && "border-[#ba1a1a] focus:border-[#ba1a1a] focus:ring-[#ba1a1a]"
        )}
      />
      {validation && (
        <p className="mt-[4px] font-['JetBrains_Mono'] text-[10px] text-[#ba1a1a]">{validation}</p>
      )}
    </div>
  );
}
