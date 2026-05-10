export async function captureViewport(): Promise<string | undefined> {
  try {
    // Try native browser extension capture first
    const runtime = (globalThis as any).chrome?.runtime;
    if (runtime?.sendMessage) {
      const dataUrl = await new Promise<string | undefined>((resolve) => {
        runtime.sendMessage({ action: "captureViewport" }, (response: any) => {
          resolve(response?.dataUrl);
        });
      });
      if (dataUrl) return dataUrl;
    }

    // Fallback: html2canvas-style approach using dom-to-image or canvas
    // For hackathon MVP, we'll use a simple canvas-based approach
    const canvas = await htmlToCanvas(document.documentElement);
    if (canvas) {
      return canvas.toDataURL("image/jpeg", 0.7);
    }
  } catch (err) {
    console.warn("[captureViewport] Failed:", err);
  }
  return undefined;
}

async function htmlToCanvas(element: HTMLElement): Promise<HTMLCanvasElement | null> {
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(element, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      scale: 0.5, // Reduce quality for speed
      height: window.innerHeight,
      windowHeight: window.innerHeight,
    });
    return canvas;
  } catch {
    return null;
  }
}
