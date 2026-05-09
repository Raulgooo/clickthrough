import { cn } from "@/utils/classNames";
import type { PromptBarProps } from "@/types/primitives";

export const PromptBar = ({
  value,
  placeholder = "Enter generative command...",
  mode = "text",
  hotkeyLabel,
  status = "idle",
  className,
}: PromptBarProps & { className?: string }) => {
  return (
    <div
      data-ct-primitive="PromptBar"
      data-mode={mode}
      data-status={status}
      className={cn(
        "relative flex items-center border border-primary bg-surface-container-lowest rounded p-xs",
        className
      )}
    >
      <span className="material-symbols-outlined text-on-surface-variant ml-sm mr-sm text-[16px]">
        bolt
      </span>
      <input
        type="text"
        defaultValue={value}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-none outline-none font-label-mono text-label-mono py-sm text-primary placeholder-on-surface-variant focus:ring-0"
      />
      {hotkeyLabel && (
        <span className="font-label-mono text-label-mono text-on-surface-variant mr-sm">
          {hotkeyLabel}
        </span>
      )}
      <button className="bg-primary text-on-primary px-md py-xs rounded font-label-mono text-label-mono hover:bg-inverse-surface transition-colors">
        EXECUTE
      </button>
    </div>
  );
};
