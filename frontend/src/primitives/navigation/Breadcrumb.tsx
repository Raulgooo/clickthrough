import { cn } from "@/utils/classNames";
import type { BreadcrumbProps } from "@/types/primitives";

export function Breadcrumb({
  items = [],
  className,
}: BreadcrumbProps & { className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav
      data-ct-primitive="Breadcrumb"
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-xs font-label-mono text-[10px] text-on-surface-variant",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-xs">
            {index > 0 && <span className="text-outline">/</span>}
            {isLast ? (
              <span className="text-on-background font-medium">
                {item.label}
              </span>
            ) : item.href ? (
              <a
                href={item.href}
                className="hover:text-on-background cursor-pointer transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="hover:text-on-background cursor-pointer transition-colors">
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
