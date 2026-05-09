import html2canvas from "html2canvas";

export async function captureViewport(): Promise<string> {
  try {
    const canvas = await html2canvas(document.body, {
      logging: false,
      useCORS: true,
      allowTaint: true,
      scale: 0.5, // smaller file size, faster upload
      x: window.scrollX,
      y: window.scrollY,
      width: window.innerWidth,
      height: window.innerHeight,
    });
    return canvas.toDataURL("image/jpeg", 0.7);
  } catch (err) {
    console.error("[captureViewport] Screenshot failed:", err);
    return "";
  }
}

export function getCursorPosition(): { x: number; y: number } {
  return { x: window.lastMouseX ?? window.innerWidth / 2, y: window.lastMouseY ?? window.innerHeight / 2 };
}

// Track mouse globally
declare global {
  interface Window {
    lastMouseX: number;
    lastMouseY: number;
  }
}

if (typeof window !== "undefined") {
  window.lastMouseX = window.innerWidth / 2;
  window.lastMouseY = window.innerHeight / 2;
  document.addEventListener("mousemove", (e) => {
    window.lastMouseX = e.clientX;
    window.lastMouseY = e.clientY;
  });
}
