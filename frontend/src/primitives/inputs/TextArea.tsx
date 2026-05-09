import { cn } from "@/utils/classNames";
import type { TextAreaProps } from "@/types/primitives";

export function TextArea({
  label,
  value,
  rows = 3,
  maxLength,
  placeholder,
  onChange,
  className,
}: TextAreaProps & { onChange?: (value: string) => void; className?: string }) {
  return (
    <div className={cn("w-full", className)} data-ct-primitive="TextArea">
      {label && (
        <label className="block font-['JetBrains_Mono'] text-[11px] text-[#6b6b6b] uppercase tracking-wider mb-[4px]">
          {label}
        </label>
      )}
      <textarea
        value={value}
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-[8px] py-[4px] bg-white border border-[#c4c4c4] rounded-[0.25rem] text-[12px] text-[#1b1b1b] outline-none focus:border-[#000000] focus:ring-1 focus:ring-[#000000] transition-all resize-y"
      />
    </div>
  );
}
