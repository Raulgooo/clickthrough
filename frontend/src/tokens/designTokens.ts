/**
 * Clickthrough Design Tokens
 *
 * Material Design 3 monochrome palette, spacing, radii, typography,
 * shadows, transitions, and borders derived from final_Design.md.
 */

// ── Colors (Light) ──

export const colors = {
  surface: "#ffffff",
  "surface-container-lowest": "#f9f9f9",
  "surface-container-low": "#eeeeee",
  "surface-container": "#e2e2e2",
  "surface-container-high": "#dadada",
  "surface-container-highest": "#d0d0d0",
  primary: "#000000",
  "on-primary": "#ffffff",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  outline: "#c4c4c4",
  "outline-variant": "#e0e0e0",
  error: "#ba1a1a",
  success: "#1a5c1a",
  warning: "#8c6b1f",
  danger: "#dc2626",
} as const;

// ── Colors (Dark) ──

export const darkColors = {
  surface: "#1a1a1a",
  "surface-container-lowest": "#141414",
  "surface-container-low": "#1f1f1f",
  "surface-container": "#262626",
  "surface-container-high": "#2e2e2e",
  "surface-container-highest": "#363636",
  primary: "#ffffff",
  "on-primary": "#000000",
  text: "#f0f0f0",
  muted: "#a0a0a0",
  outline: "#5c5c5c",
  "outline-variant": "#3d3d3d",
  error: "#ff5449",
  success: "#4ade80",
  warning: "#fbbf24",
  danger: "#ff5449",
} as const;

// ── Spacing ──

export const spacing = {
  xs: "2px",
  sm: "4px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  "2xl": "24px",
} as const;

// ── Radii ──

export const radii = {
  none: "0px",
  DEFAULT: "0.25rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

// ── Fonts ──

export const fonts = {
  "font-body": "Geist",
  "font-mono": "JetBrains Mono",
  "font-label-mono": "JetBrains Mono",
  "font-tabular": "JetBrains Mono",
} as const;

// ── Font Sizes ──

export const fontSizes = {
  "text-label": "11px",
  "text-caption": "11px",
  "text-body": "12px",
  "text-body-strong": "12px",
  "text-body-md": "13px",
  "text-heading-4": "13px",
  "text-heading-3": "14px",
  "text-heading-2": "15px",
  "text-heading-1": "16px",
} as const;

// ── Line Heights ──

export const lineHeights = {
  tight: "1.2",
  body: "1.3",
} as const;

// ── Shadows ──

export const shadows = {
  none: "none",
  "subtle-lift": "1px 1px 3px rgba(0,0,0,0.1)",
  "hard-shadow": "2px 2px 0px rgba(0,0,0,1)",
} as const;

// ── Transitions ──

export const transitions = {
  DEFAULT: "150ms ease-in-out",
  entrance: "150ms fade + 4px slide",
  skeleton: "1.5s opacity oscillation",
  diagram: "200ms path draw or fade",
} as const;

// ── Borders ──

export const borders = {
  DEFAULT: "1px solid #c4c4c4",
  variant: "1px solid #e0e0e0",
  emphasis: "1px solid #000000",
  error: "1px solid #ba1a1a",
  "hard-error": "2px solid #ba1a1a",
} as const;
