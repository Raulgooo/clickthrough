import { scanDom } from "./domScanner";
import { sampleHostTheme } from "./hostTheme";
import type { PageContextPacket } from "@/harness/runtime";

export function buildPageContextPacket(): PageContextPacket {
  const scan = scanDom();

  return {
    url: window.location.href,
    title: document.title || "Untitled page",
    visibleText: scan.visibleText,
    selectedText: scan.selectedText,
    nearbyElements: scan.elements,
    capabilityMap: scan.capabilities,
    hostTheme: sampleHostTheme(),
  };
}
