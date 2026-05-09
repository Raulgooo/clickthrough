import type { HostTheme } from "@/types/primitives";

export function sampleHostTheme(target: HTMLElement = document.body): HostTheme {
  const style = window.getComputedStyle(target);
  const radius = parseFloat(style.borderRadius || "4") || 4;
  const background = style.backgroundColor || "#ffffff";
  const text = style.color || "#1b1b1b";

  return {
    mode: inferMode(background),
    fontFamily: style.fontFamily || 'ui-sans-serif, "Segoe UI", system-ui, sans-serif',
    textColor: text,
    mutedTextColor: "rgba(27, 27, 27, 0.68)",
    backgroundColor: background,
    surfaceColor: background,
    borderColor: "rgba(0, 0, 0, 0.18)",
    accentColor: text,
    successColor: "#1a5c1a",
    warningColor: "#8a5a00",
    dangerColor: "#ba1a1a",
    borderRadius: radius,
    controlRadius: radius,
    shadowStyle: "soft",
    density: "comfortable",
    buttonStyle: "mixed",
    inputStyle: "outlined",
  };
}

function inferMode(color: string): HostTheme["mode"] {
  const numbers = color.match(/\d+/g)?.map(Number) ?? [255, 255, 255];
  const [red, green, blue] = numbers;
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance < 128 ? "dark" : "light";
}
