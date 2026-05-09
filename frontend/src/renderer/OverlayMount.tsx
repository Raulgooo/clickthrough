import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export type OverlayMountProps = {
  children: React.ReactNode;
  containerId?: string;
};

export const OverlayMount = ({ children, containerId }: OverlayMountProps) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const id = containerId || "ct-overlay-root";

  useEffect(() => {
    setMounted(true);

    let container = document.getElementById(id) as HTMLDivElement | null;
    if (!container) {
      container = document.createElement("div");
      container.id = id;
      // Isolate styles from host page
      container.style.position = "relative";
      container.style.zIndex = "2147483647";
      document.body.appendChild(container);
    }
    containerRef.current = container;

    return () => {
      if (container && container.childNodes.length === 0) {
        document.body.removeChild(container);
        containerRef.current = null;
      }
    };
  }, [id]);

  if (!mounted) return null;

  const container = containerRef.current || document.getElementById(id);
  if (!container) return null;

  return createPortal(children, container);
};
