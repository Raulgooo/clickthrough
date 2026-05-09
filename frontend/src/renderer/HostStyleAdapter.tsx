import { useEffect } from "react";
import type { HostTheme } from "@/types/primitives";

export type HostStyleAdapterProps = {
  theme: HostTheme;
  children: React.ReactNode;
};

export const HostStyleAdapter = ({ theme, children }: HostStyleAdapterProps) => {
  useEffect(() => {
    const container = document.getElementById("ct-overlay-root");
    if (!container) return;

    const style = container.style;

    // Colors
    style.setProperty("--ct-mode", theme.mode);
    style.setProperty("--ct-font-family", theme.fontFamily);
    style.setProperty("--ct-text", theme.textColor);
    style.setProperty("--ct-muted-text", theme.mutedTextColor);
    style.setProperty("--ct-background", theme.backgroundColor);
    style.setProperty("--ct-surface", theme.surfaceColor);
    style.setProperty("--ct-border", theme.borderColor);
    style.setProperty("--ct-accent", theme.accentColor);
    style.setProperty("--ct-success", theme.successColor);
    style.setProperty("--ct-warning", theme.warningColor);
    style.setProperty("--ct-danger", theme.dangerColor);

    // Geometry & style
    style.setProperty("--ct-border-radius", `${theme.borderRadius}px`);
    style.setProperty("--ct-control-radius", `${theme.controlRadius}px`);
    style.setProperty("--ct-shadow-style", theme.shadowStyle);
    style.setProperty("--ct-density", theme.density);
    style.setProperty("--ct-button-style", theme.buttonStyle);
    style.setProperty("--ct-input-style", theme.inputStyle);
  }, [theme]);

  return <>{children}</>;
};
