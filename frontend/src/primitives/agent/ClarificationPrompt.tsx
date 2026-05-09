import { cn } from "@/utils/classNames";
import type { ClarificationPromptProps } from "@/types/primitives";

export function ClarificationPrompt({
  question,
  options = [],
  allowFreeform,
  className,
}: ClarificationPromptProps & { className?: string }) {
  return (
    <div
      data-ct-primitive="ClarificationPrompt"
      className={cn(
        "border border-outline rounded p-md bg-surface subtle-lift",
        className
      )}
    >
      <div className="flex items-center gap-sm mb-sm">
        <span className="material-symbols-outlined text-[18px] text-primary">
          help
        </span>
        <span className="font-body-sm text-body-sm font-medium text-on-background">
          {question}
        </span>
      </div>
      <div className="space-y-xs">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "w-full text-left px-sm py-sm rounded border border-outline",
              "font-body-sm text-body-sm text-on-background",
              "hover:bg-surface-container-high transition-colors"
            )}
          >
            {opt.label}
          </button>
        ))}
        {allowFreeform && (
          <input
            type="text"
            placeholder="Or type your own..."
            className={cn(
              "w-full px-sm py-sm rounded border border-outline",
              "bg-surface font-body-sm text-body-sm text-on-background",
              "outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            )}
          />
        )}
      </div>
    </div>
  );
}
