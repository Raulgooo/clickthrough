import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { OverlayMode } from "../types/harness";

export type OverlayPositionerProps = {
  mode: OverlayMode;
  anchor?: { x: number; y: number } | string;
  children: React.ReactNode;
  onDismiss?: () => void;
  dismissible?: boolean;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button',
  'textarea',
  'input:not([type="hidden"])',
  'select',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export const OverlayPositioner: React.FC<OverlayPositionerProps> = ({
  mode,
  anchor,
  children,
  onDismiss,
  dismissible = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [arrowOffset, setArrowOffset] = useState(16);

  // ── Escape to dismiss ──
  useEffect(() => {
    if (!dismissible || !onDismiss) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dismissible, onDismiss]);

  // ── Spotlight scroll lock ──
  useEffect(() => {
    if (mode !== "spotlight") return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [mode]);

  // ── Focus trap (spotlight + side_panel) ──
  useEffect(() => {
    if (mode !== "spotlight" && mode !== "side_panel") return;

    const container = containerRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ).filter((el) => !(el as HTMLInputElement).disabled && el.offsetParent !== null);

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || focusable.length === 0) return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    return () => container.removeEventListener("keydown", handleTab);
  }, [mode]);

  // ── Measure position for inline_prompt / anchored_popover ──
  useLayoutEffect(() => {
    if (mode !== "inline_prompt" && mode !== "anchored_popover") return;
    if (!anchor) return;

    if (typeof anchor === "string") {
      const el = document.querySelector(anchor);
      if (el) {
        const rect = el.getBoundingClientRect();
        setPopoverPos({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
        if (mode === "anchored_popover") {
          setArrowOffset(Math.max(12, rect.width / 2 - 8));
        }
      }
    } else {
      setPopoverPos({
        top: anchor.y + window.scrollY,
        left: anchor.x + window.scrollX,
      });
      if (mode === "anchored_popover") {
        setArrowOffset(16);
      }
    }
  }, [mode, anchor]);

  // ── native_insertion ──
  if (mode === "native_insertion") {
    return <>{children}</>;
  }

  // ── inline_prompt ──
  if (mode === "inline_prompt") {
    return (
      <div
        ref={containerRef}
        className="ct-panel-enter absolute z-[9999] w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{
          top: popoverPos ? `${popoverPos.top}px` : undefined,
          left: popoverPos ? `${popoverPos.left}px` : undefined,
        }}
      >
        {children}
      </div>
    );
  }

  // ── anchored_popover ──
  if (mode === "anchored_popover") {
    return (
      <div
        ref={containerRef}
        className="ct-panel-enter absolute z-[9999] w-80 rounded-lg border border-gray-200 bg-white shadow-lg"
        style={{
          top: popoverPos ? `${popoverPos.top}px` : undefined,
          left: popoverPos ? `${popoverPos.left}px` : undefined,
        }}
      >
        {/* Arrow */}
        <div
          className="absolute -top-2 h-4 w-4 rotate-45 border-l border-t border-gray-200 bg-white"
          style={{ left: `${arrowOffset}px` }}
        />
        <div className="relative">{children}</div>
      </div>
    );
  }

  // ── side_panel ──
  if (mode === "side_panel") {
    return (
      <div
        ref={containerRef}
        className="ct-panel-enter fixed inset-y-0 right-0 z-[9999] w-[400px] overflow-y-auto border-l border-gray-200 bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }

  // ── spotlight ──
  if (mode === "spotlight") {
    return (
      <div className="fixed inset-0 z-[9999]">
        {/* Dimmer — sibling, not wrapper */}
        <div className="absolute inset-0 bg-black/[0.04]" />
        {/* Centered panel */}
        <div
          ref={containerRef}
          className="ct-panel-enter absolute left-1/2 top-1/2 max-h-[80vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    );
  }

  // ── fullscreen_workbench ──
  if (mode === "fullscreen_workbench") {
    return (
      <div
        ref={containerRef}
        className="ct-panel-enter fixed inset-0 z-[9999] overflow-y-auto bg-white"
        tabIndex={-1}
      >
        {children}
      </div>
    );
  }

  return null;
};
