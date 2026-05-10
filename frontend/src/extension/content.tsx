import React, { Component, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./content.css";
import { buildPageContextPacket } from "@/browser/pageBridge";
import { useHarnessSession } from "@/harness/useHarnessSession";
import { PrimitiveRenderer } from "@/renderer/PrimitiveRenderer";
import {
  AgentStateIndicator,
  CTMark,
  Label,
  Panel,
  ProgressList,
  StatusPill,
  ToolProgressCard,
} from "@/primitives";
import type { DomElementSummary, PageContextPacket } from "@/harness/runtime";
import type { HostTheme } from "@/types/primitives";

const ROOT_ID = "clickthrough-extension-root";
const CSS_ASSET = "assets/content.css";
const ICON_FALLBACKS: Record<string, string> = {
  check: "✓",
  check_circle: "✓",
  close: "×",
  error: "!",
  verified: "✓",
  progress_activity: "◌",
  pause: "Ⅱ",
  play_arrow: "▶",
  stop: "■",
  expand_more: "⌄",
  expand_less: "⌃",
  content_copy: "⧉",
  lock: "◆",
  security: "◆",
  warning: "!",
  info: "i",
  image: "□",
  code: "{}",
};

class RenderGuard extends Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || "Generated UI failed to render" };
  }

  componentDidUpdate(previousProps: { children: React.ReactNode }) {
    if (previousProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded border border-error bg-error-container p-3 text-sm text-error">
          Generated UI could not render: {this.state.error}
        </div>
      );
    }

    return this.props.children;
  }
}

function getRuntimeUrl(path: string): string | null {
  const runtime = (globalThis as any).chrome?.runtime;
  return runtime?.getURL ? runtime.getURL(path) : null;
}

function ensureCssLink(): void {
  const href = getRuntimeUrl(CSS_ASSET);
  if (!href || document.querySelector(`link[data-clickthrough-css="${CSS_ASSET}"]`)) return;

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.clickthroughCss = CSS_ASSET;
  document.documentElement.appendChild(link);
}

function installIconFallback(root: HTMLElement): void {
  let applying = false;

  const apply = () => {
    if (applying) return;
    applying = true;
    try {
      root.querySelectorAll<HTMLElement>(".material-symbols-outlined").forEach((icon) => {
        const raw = icon.textContent?.trim() || "";
        const original = icon.dataset.ctLigature || raw;
        const fallback = ICON_FALLBACKS[original];

        if (!fallback) return;

        if (raw !== fallback) {
          icon.dataset.ctLigature = raw;
          icon.setAttribute("aria-label", raw.replace(/_/g, " "));
          icon.textContent = fallback;
        }
      });
    } finally {
      applying = false;
    }
  };

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(root, { childList: true, subtree: true });
}

function mapHarnessState(state: string): string {
  if (state.includes("observ")) return "observing";
  if (state.includes("classif") || state.includes("plan")) return "planning";
  if (state.includes("tool") || state.includes("search")) return "searching";
  if (state.includes("generat") || state.includes("ui")) return "generating";
  return "observing";
}

function inferPromptPlaceholder(page: PageContextPacket): string {
  if (page.selectedText) return "Ask CT about the selection...";
  if (page.capabilityMap.some((cap) => ["form", "input", "button"].includes(cap.kind))) {
    return "Ask CT to help handle this page...";
  }
  return "Ask CT to verify, explain, summarize, or draft...";
}

function getAnchorElement(page: PageContextPacket): DomElementSummary | undefined {
  if (page.focusedElement) return page.focusedElement;
  const selected = page.selectedText?.trim();
  if (selected) {
    return page.nearbyElements.find((element) => element.text?.includes(selected));
  }
  return page.nearbyElements.find((element) => element.bounds && element.text);
}

function useHostVariables(theme?: HostTheme): React.CSSProperties {
  return useMemo(
    () =>
      ({
        "--ct-host-font": theme?.fontFamily,
        "--ct-host-text": theme?.textColor,
        "--ct-host-muted": theme?.mutedTextColor,
        "--ct-host-surface": theme?.surfaceColor,
        "--ct-host-border": theme?.borderColor,
        "--ct-host-radius": `${theme?.borderRadius ?? 10}px`,
      }) as React.CSSProperties,
    [theme]
  );
}

function ClickthroughContentApp() {
  const { state, uiTree, toolProgress, loading, error, sendIntent, cancel } = useHarnessSession();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [page, setPage] = useState<PageContextPacket | null>(null);
  const [anchor, setAnchor] = useState<DomElementSummary | undefined>();
  const hostVars = useHostVariables(page?.hostTheme);

  const refreshContext = useCallback(async () => {
    const packet = await buildPageContextPacket();
    setPage(packet);
    setAnchor(getAnchorElement(packet));
    if (!prompt) {
      setPrompt(packet.selectedText ? "CT, explain this visually." : "");
    }
    return packet;
  }, [prompt]);

  const openPrompt = useCallback(async () => {
    const packet = await refreshContext();
    setOpen(true);
    setAnchor(getAnchorElement(packet));
  }, [refreshContext]);

  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;
      if (isModifier && event.shiftKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        await openPrompt();
      }
      if (event.key === "Escape" && open) {
        cancel();
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [cancel, open, openPrompt]);

  const run = useCallback(async () => {
    const packet = await refreshContext();
    const text = prompt.trim() || "CT, help me handle this page.";
    setOpen(true);

    await sendIntent(
      {
        prompt: text,
        inputMode: "text",
        selectedText: packet.selectedText,
        anchorElementId: getAnchorElement(packet)?.id,
        pageUrl: packet.url,
        pageTitle: packet.title,
        timestamp: new Date().toISOString(),
      },
      packet
    );
  }, [prompt, refreshContext, sendIntent]);

  if (!open) {
    return (
      <button
        type="button"
        className="ct-extension-shell fixed bottom-5 right-5 z-[2147483647] flex items-center gap-2 rounded-full border border-outline bg-surface px-3 py-2 text-sm font-medium text-on-background shadow-lg"
        onClick={openPrompt}
        style={hostVars}
        aria-label="Open Clickthrough"
      >
        <CTMark variant="badge" status="idle" />
        <span>CT</span>
        <span className="font-label-mono text-label-mono text-on-surface-variant">Ctrl Shift K</span>
      </button>
    );
  }

  const highlightStyle = anchor?.bounds
    ? {
        left: anchor.bounds.x - 4,
        top: anchor.bounds.y - 4,
        width: anchor.bounds.width + 8,
        height: anchor.bounds.height + 8,
      }
    : undefined;

  return (
    <div className="ct-extension-shell" style={hostVars}>
      {highlightStyle && loading && <div className="ct-page-highlight" style={highlightStyle} />}

      <div className="fixed right-4 top-4 z-[2147483647] w-[440px] max-w-[calc(100vw-24px)]">
        <Panel chrome="standard" className="border-outline bg-surface shadow-lg">
          <div className="flex items-center gap-2 border-b border-outline p-3">
            <CTMark variant="badge" status={loading ? "working" : uiTree ? "verified" : "idle"} />
            <div className="min-w-0">
              <div className="font-body-sm text-body-sm font-semibold text-on-background">Clickthrough</div>
              <div className="font-label-mono text-label-mono text-on-surface-variant truncate">
                {page?.title || document.title || "Current page"}
              </div>
            </div>
            <span className="ml-auto">
              <StatusPill
                label={loading ? state.replace(/_/g, " ") : uiTree ? "generated" : "ready"}
                tone={error ? "danger" : loading ? "info" : uiTree ? "success" : "neutral"}
              />
            </span>
            <button
              type="button"
              className="rounded px-2 py-1 text-sm text-on-surface-variant hover:bg-surface-container-high"
              onClick={() => {
                cancel();
                setOpen(false);
              }}
              aria-label="Close Clickthrough"
            >
              x
            </button>
          </div>

          <div className="border-b border-outline p-3">
            <div className="flex gap-2">
              <input
                autoFocus
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void run();
                }}
                placeholder={page ? inferPromptPlaceholder(page) : "Ask Clickthrough..."}
                className="min-w-0 flex-1 rounded border border-outline bg-surface px-3 py-2 text-sm text-on-background outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => void run()}
                disabled={loading}
                className="rounded bg-primary px-4 py-2 text-sm font-semibold text-on-primary disabled:opacity-60"
              >
                {loading ? "Building" : "Generate"}
              </button>
            </div>
            {page?.selectedText && (
              <div className="mt-2 rounded border border-outline-variant bg-surface-container-low p-2">
                <Label tone="muted">Selected context</Label>
                <div className="mt-1 line-clamp-2 text-xs text-on-surface-variant">{page.selectedText}</div>
              </div>
            )}
            {error && <div className="mt-2 text-xs text-error">{error}</div>}
          </div>

          {loading && (
            <div className="space-y-2 border-b border-outline p-3">
              <AgentStateIndicator state={mapHarnessState(state)} message={state.replace(/_/g, " ")} />
              {toolProgress.length > 0 ? (
                toolProgress.map((tool) => (
                  <ToolProgressCard
                    key={tool.callId}
                    toolName={tool.toolName}
                    status={tool.status}
                    progress={tool.status === "done" ? 100 : tool.status === "running" ? 55 : 0}
                    detail={tool.summary || "Running read-only tool"}
                  />
                ))
              ) : (
                <ProgressList
                  items={[
                    { label: "Reading visible page context", state: "done" },
                    { label: "Choosing generated interface", state: "running" },
                    { label: "Preparing overlay primitives", state: "pending" },
                  ]}
                />
              )}
            </div>
          )}

          <div className="max-h-[68vh] overflow-y-auto p-3">
            {uiTree ? (
              <RenderGuard>
                <PrimitiveRenderer
                  tree={uiTree}
                  onAction={(actionId, payload) => {
                    console.log("[Clickthrough] Action triggered:", actionId, payload);
                    if (actionId === "action:copy") {
                      const value = payload?.value as string | undefined;
                      if (value) {
                        navigator.clipboard.writeText(value).catch(() => {});
                      } else {
                        // Try to find adjacent CopyField or TextArea value
                        const textArea = document.querySelector('[data-ct-primitive="TextArea"] textarea') as HTMLTextAreaElement | null;
                        if (textArea?.value) {
                          navigator.clipboard.writeText(textArea.value).catch(() => {});
                        }
                      }
                    }
                    if (actionId === "action:dismiss") {
                      cancel();
                      setOpen(false);
                    }
                    if (actionId === "action:retry") {
                      void run();
                    }
                    if (actionId === "action:refresh") {
                      void run();
                    }
                    if (actionId === "action:cancel") {
                      cancel();
                    }
                  }}
                />
              </RenderGuard>
            ) : (
              <div className="space-y-2 py-4 text-center">
                <Label tone="muted">Clickthrough will generate a page-native interface here.</Label>
                <div className="text-xs text-on-surface-variant">Try: "is this true?", "explain this visually", or "help me handle this page".</div>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function mount() {
  if (document.getElementById(ROOT_ID)) return;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  document.documentElement.appendChild(root);
  ensureCssLink();
  installIconFallback(root);

  createRoot(root).render(<ClickthroughContentApp />);
}

mount();
