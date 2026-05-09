import { useState } from "react";
import { cn } from "@/utils/classNames";
import type { TabsProps } from "@/types/primitives";

export function Tabs({
  tabs = [],
  activeTab,
  className,
}: TabsProps & { className?: string }) {
  const [internalActive, setInternalActive] = useState<string | undefined>(
    activeTab ?? tabs[0]?.id
  );

  const current = activeTab ?? internalActive;

  if (tabs.length === 0) return null;

  return (
    <div data-ct-primitive="Tabs" className={cn("", className)}>
      <div className="border-b border-outline flex gap-sm">
        {tabs.map((tab) => {
          const isActive = current === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setInternalActive(tab.id)}
              className={cn(
                "px-sm py-xs font-label-mono text-label-mono transition-colors",
                isActive
                  ? "text-on-background border-b-2 border-primary"
                  : "text-on-surface-variant hover:text-on-background"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
