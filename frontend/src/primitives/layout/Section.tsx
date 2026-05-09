import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { SectionProps } from "@/types/primitives";
import type { ReactNode } from "react";

export const Section = ({
  title,
  description,
  collapsible = false,
  defaultOpen = true,
  className,
  children,
}: SectionProps & { className?: string; children?: ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      data-ct-primitive="Section"
      data-collapsible={collapsible}
      className={cn("border-t border-outline pt-md", className)}
    >
      {title && (
        <div className="flex items-center justify-between mb-sm">
          <div className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
            {title}
          </div>
          {collapsible && (
            <button
              onClick={() => setOpen(!open)}
              className="p-xs hover:bg-surface-container-high rounded transition-colors"
              aria-label={open ? "Collapse" : "Expand"}
            >
              <span
                className={cn(
                  "material-symbols-outlined text-[16px] text-on-surface-variant transition-transform",
                  open ? "rotate-180" : ""
                )}
              >
                expand_more
              </span>
            </button>
          )}
        </div>
      )}
      {description && (
        <div className="font-body-sm text-body-sm text-on-surface-variant mb-sm">
          {description}
        </div>
      )}
      {(!collapsible || open) && (
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          {children}
        </div>
      )}
    </div>
  );
};
