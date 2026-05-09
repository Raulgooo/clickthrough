import { cn } from "@/utils/classNames";
import type { RailProps } from "@/types/primitives";

export const Rail = ({
  items = [],
  activeId,
  orientation = "left",
  className,
}: RailProps & { className?: string }) => {
  return (
    <nav
      data-ct-primitive="Rail"
      data-orientation={orientation}
      className={cn(
        "flex gap-sm",
        orientation === "top" ? "flex-row items-center" : "flex-col items-center",
        orientation === "left" || orientation === "right" ? "w-16" : "",
        className
      )}
    >
      {items.map((item) => (
        <button
          key={item.id}
          className={cn(
            "w-10 h-10 rounded border flex items-center justify-center font-label-mono text-label-mono text-on-surface-variant transition-colors",
            item.id === activeId
              ? "border-primary bg-primary-container text-on-primary"
              : "border-outline hover:bg-surface-container-high"
          )}
          title={item.label}
        >
          {item.icon ? (
            <span className="material-symbols-outlined text-[16px]">
              {item.icon}
            </span>
          ) : (
            item.label.slice(0, 1)
          )}
        </button>
      ))}
    </nav>
  );
};
