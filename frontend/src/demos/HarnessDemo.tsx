import { useState, useCallback } from "react";
import { useHarnessSession } from "@/harness/useHarnessSession";
import { buildPageContextPacket } from "@/browser/pageBridge";
import { PrimitiveRenderer } from "@/renderer/PrimitiveRenderer";
import {
  Skeleton,
  StatusPill,
  Label,
  Panel,
  ToolProgressCard,
  AgentStateIndicator,
} from "@/primitives";

function mapHarnessState(state: string): string {
  if (state.includes("observ")) return "observing";
  if (state.includes("plan")) return "planning";
  if (state.includes("tool") || state.includes("search") || state.includes("fetch")) return "searching";
  if (state.includes("generat") || state.includes("ui")) return "generating";
  return "observing";
}

export default function HarnessDemo() {
  const { state, uiTree, toolProgress, loading, error, sendIntent } =
    useHarnessSession();
  const [prompt, setPrompt] = useState("Hey CT, is this true?");

  const handleSubmit = useCallback(async () => {
    const page = buildPageContextPacket();
    await sendIntent(
      {
        prompt,
        inputMode: "text",
        selectedText: page.selectedText,
        pageUrl: page.url,
        pageTitle: page.title,
        timestamp: new Date().toISOString(),
      },
      page
    );
  }, [prompt, sendIntent]);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Host page: Twitter-like feed */}
      <div className="flex justify-center p-6">
        <div className="w-full max-w-[560px] space-y-3">
          <div className="p-4 border border-outline-variant rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-surface-container" />
              <div>
                <div className="font-semibold text-sm text-on-background">
                  Raul Garcia
                </div>
                <div className="text-[13px] text-on-surface-variant">
                  @raulgcc1
                </div>
              </div>
            </div>
            <div className="text-[15px] leading-relaxed mb-2 text-on-background">
              I'm excited to announce that I'm joining Amazon as a summer intern!
            </div>
            <div className="text-[13px] text-on-surface-variant">
              10:42 AM · May 9, 2026
            </div>
          </div>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="fixed top-16 right-4 z-[100] w-[420px] max-w-[calc(100vw-32px)]">
        <Panel chrome="standard" className="bg-surface border-outline shadow-lg">
          {/* Header */}
          <div className="flex items-center gap-2 p-3 border-b border-outline">
            <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
              CT
            </div>
            <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
              Clickthrough
            </span>
            <span className="ml-auto">
              <StatusPill
                label={loading ? state : uiTree ? "Ready" : "Idle"}
                tone={loading ? "info" : error ? "danger" : uiTree ? "success" : "neutral"}
              />
            </span>
          </div>

          {/* Prompt input */}
          <div className="p-3 border-b border-outline">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="flex-1 px-3 py-2 text-sm border border-outline rounded bg-surface text-on-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ask Clickthrough..."
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-medium disabled:opacity-50"
              >
                {loading ? "..." : "Ask"}
              </button>
            </div>
            {error && (
              <div className="mt-2 text-xs text-danger">{error}</div>
            )}
          </div>

          {/* Agent state + tool progress */}
          {loading && (
            <div className="p-3 border-b border-outline space-y-2">
              <AgentStateIndicator state={mapHarnessState(state)} message={state} />
              {toolProgress.length > 0 && (
                <div className="space-y-1">
                  {toolProgress.map((t) => (
                    <ToolProgressCard
                      key={t.callId}
                      toolName={t.toolName}
                      status={t.status}
                      progress={t.status === "done" ? 100 : t.status === "running" ? 50 : 0}
                      detail={t.summary || "Running..."}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Generated UI */}
          <div className="p-0 max-h-[60vh] overflow-y-auto">
            {loading && !uiTree && (
              <div className="p-3">
                <Skeleton shape="block" count={6} />
              </div>
            )}

            {uiTree && (
              <div className="p-3">
                <PrimitiveRenderer tree={uiTree} />
              </div>
            )}

            {!loading && !uiTree && !error && (
              <div className="p-6 text-center text-on-surface-variant text-sm">
                <Label tone="muted">Enter a prompt and click Ask to summon Clickthrough.</Label>
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
