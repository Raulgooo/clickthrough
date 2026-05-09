import { useEffect, useCallback } from "react";

export type HotkeyCallback = () => void;

export function useHotkey(keys: string[], callback: HotkeyCallback) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const pressed = [];
      if (e.metaKey || e.ctrlKey) pressed.push("mod");
      if (e.shiftKey) pressed.push("shift");
      if (e.altKey) pressed.push("alt");
      pressed.push(e.key.toLowerCase());

      const target = keys.map((k) => k.toLowerCase()).sort().join("+");
      const actual = pressed.sort().join("+");

      if (target === actual) {
        e.preventDefault();
        e.stopPropagation();
        callback();
      }
    },
    [keys, callback]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
