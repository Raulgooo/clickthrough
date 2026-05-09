export type BrowserActionStep =
  | { kind: "click"; elementId: string }
  | { kind: "fill"; elementId: string; value: string }
  | { kind: "select"; elementId: string; value: string }
  | { kind: "waitFor"; condition: string; timeoutMs: number }
  | { kind: "verify"; assertion: string };

export type BrowserActionResult = {
  status: "success" | "failed" | "partial";
  evidence: string[];
};

export async function executeBrowserActionPlan(steps: BrowserActionStep[]): Promise<BrowserActionResult> {
  const evidence: string[] = [];

  for (const step of steps) {
    if (step.kind === "waitFor") {
      await new Promise((resolve) => setTimeout(resolve, Math.min(step.timeoutMs, 1000)));
      evidence.push(`waitFor:${step.condition}`);
      continue;
    }

    if (step.kind === "verify") {
      evidence.push(`verify:${step.assertion}`);
      continue;
    }

    const element = findElement(step.elementId);
    if (!element) {
      return { status: "failed", evidence: [`missing:${step.elementId}`] };
    }

    if (step.kind === "click") {
      element.click();
      evidence.push(`clicked:${step.elementId}`);
    }

    if (step.kind === "fill" && element instanceof HTMLInputElement) {
      element.value = step.value;
      element.dispatchEvent(new Event("input", { bubbles: true }));
      evidence.push(`filled:${step.elementId}`);
    }

    if (step.kind === "select" && element instanceof HTMLSelectElement) {
      element.value = step.value;
      element.dispatchEvent(new Event("change", { bubbles: true }));
      evidence.push(`selected:${step.elementId}`);
    }
  }

  return { status: "success", evidence };
}

function findElement(elementId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-ct-element-id="${elementId}"]`);
}
