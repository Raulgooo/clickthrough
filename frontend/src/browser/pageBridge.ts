import { scanDom } from "./domScanner";
import { sampleHostTheme } from "./hostTheme";
import { captureViewport } from "./captureViewport";
import type { PageContextPacket } from "@/harness/runtime";

export async function buildPageContextPacket(): Promise<PageContextPacket> {
  const scan = scanDom();
  const screenshot = await captureViewport();

  return {
    url: window.location.href,
    title: document.title || "Untitled page",
    visibleText: scan.visibleText,
    selectedText: scan.selectedText,
    nearbyElements: scan.elements,
    capabilityMap: scan.capabilities,
    hostTheme: sampleHostTheme(),
    structured: scan.structured,
    screenshot,
  };
}
