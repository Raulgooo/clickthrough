import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { AccordionProps } from "@/types/primitives";

export function Accordion({
  items = [],
  className,
}: AccordionProps & { className?: string }) {
  const [openId, setOpenId] = useState<string | null>(
    items.find((i) => i.defaultOpen)?.id ?? null
  );

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  if (items.length === 0) return null;

  return (
    <div
      data-ct-primitive="Accordion"
      className={cn("border border-outline rounded overflow-hidden", className)}
    >
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "border-b border-outline-variant last:border-b-0",
              isOpen && "open"
            )}
          >
            <button
              type="button"
              onClick={() => toggle(item.id)}
              className={cn(
                "w-full flex items-center justify-between p-sm",
                "font-body-sm text-body-sm text-on-background",
                "hover:bg-surface-container-high transition-colors"
              )}
            >
              <span>{item.title}</span>
              <span
                className={cn(
                  "material-symbols-outlined text-[16px] transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              >
                expand_more
              </span>
            </button>
            <div
              className={cn(
                "overflow-hidden transition-[max-height] duration-200 ease-in-out",
                isOpen ? "max-h-48" : "max-h-0"
              )}
            >
              <div className="px-sm pb-sm font-body-sm text-body-sm text-on-surface-variant">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
