import type { DomElementSummary, PageCapabilitySummary } from "@/harness/runtime";

export type DomScanResult = {
  visibleText: string;
  selectedText?: string;
  elements: DomElementSummary[];
  capabilities: PageCapabilitySummary[];
};

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[contenteditable='true']",
].join(",");

export function scanDom(root: ParentNode = document): DomScanResult {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
    .filter(isVisible)
    .slice(0, 120)
    .map(toElementSummary);

  return {
    visibleText: summarizeVisibleText(document.body?.innerText ?? ""),
    selectedText: window.getSelection()?.toString() || undefined,
    elements,
    capabilities: elements.map(toCapability),
  };
}

function toElementSummary(element: HTMLElement, index: number): DomElementSummary {
  const id = element.dataset.ctElementId || `ct-el-${index}`;
  element.dataset.ctElementId = id;
  const rect = element.getBoundingClientRect();

  return {
    id,
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute("role") ?? undefined,
    label: getAccessibleLabel(element),
    text: element.innerText?.trim() || undefined,
    type: element.getAttribute("type") ?? undefined,
    href: element instanceof HTMLAnchorElement ? element.href : undefined,
    value: element instanceof HTMLInputElement ? element.value : undefined,
    visible: true,
    disabled: "disabled" in element && Boolean(element.getAttribute("disabled")),
    bounds: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}

function toCapability(element: DomElementSummary): PageCapabilitySummary {
  return {
    id: `cap-${element.id}`,
    label: element.label || element.text || element.tagName,
    kind: inferKind(element),
    elementIds: [element.id],
    confidence: element.label ? 0.85 : 0.55,
  };
}

function inferKind(element: DomElementSummary): PageCapabilitySummary["kind"] {
  if (element.tagName === "a") return "link";
  if (element.tagName === "button" || element.role === "button") return "button";
  if (element.tagName === "select") return "select";
  if (["input", "textarea"].includes(element.tagName)) return "input";
  return "unknown";
}

function getAccessibleLabel(element: HTMLElement): string {
  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.innerText ||
    element.getAttribute("placeholder") ||
    element.getAttribute("name") ||
    ""
  ).trim();
}

function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function summarizeVisibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 4000);
}
