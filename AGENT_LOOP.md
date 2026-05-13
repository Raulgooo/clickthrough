# Clickthrough Agent Loop

## Core Decision

Reconstruct the Clickthrough harness by porting MI fully as the runtime spine.

`mi` has the right loop:

```txt
call model
  -> stream response
  -> execute requested tools
  -> feed tool results back
  -> repeat until done
```

Clickthrough needs MI's actual agentic shape, not a light frontend imitation. The current frontend harness should be retired as the orchestrator. Salvage its page tools, context packets, primitive contracts, renderer ideas, and validation helpers, then run them as MI-facing capabilities behind policy gates.

## Loop Shape

```txt
screen/page signals + user intent/proactive insight
  -> observe context
  -> MI model/planner turn
  -> MI requested tools?
      -> route through policy broker
      -> execute inside allowed chamber
      -> emit tool progress
      -> feed structured results back
      -> loop
  -> surface plan
  -> primitive tree
  -> validate + fit check
  -> stream generated UI
  -> result
```

The loop is iterative. It is not a single classify/search/generate function.

## Execution Chambers

MI has powerful tool execution. Clickthrough keeps that power and patches where it can run.

```txt
MI tool request
  -> PolicyBroker
  -> CapabilityResolver
  -> ExecutionChamber
  -> StructuredResult
  -> Goal/verification check
```

Chambers:

- `page`: active user tab context and approved DOM actions.
- `screen`: OS/app/window context, screenshot crops, OCR, accessibility.
- `browser-worker`: isolated Obscura/CDP/Playwright worker for agent browsing.
- `terminal`: approved sandboxed commands only.
- `os`: visible CUA actions with verified targets.
- `web`: search/fetch/source tools.
- `memory`: bounded memory.

The user's real browser remains the source of truth for what the user sees. Obscura is for the agent's isolated browsing, replay, rendered fetches, extraction, and evidence collection.

## Browser-Safe Tool Registry

Default tools:

```txt
page.observe
page.scan
page.highlight
insight.score
web.search
web.fetch
ui.plan
ui.validate
ui.fitCheck
browserWorker.fetchRendered
browserWorker.extractText
browserWorker.extractLinks
browserWorker.screenshot
browserWorker.evalReadOnly
browserWorker.replayCheck
```

Allowed with constraints:

```txt
memory.read
memory.write
mcp.listTools
mcp.callTool
delegate.specialist
```

Approval-gated action tools:

```txt
dom.click
dom.fill
dom.submit
external.send
credential.create
permission.change
purchase.prepare
delete.prepare
```

Blocked raw tools:

```txt
shell.run
page.eval
unscoped.network
unverified.mutation
raw.coordinateControl
```

The model can request tools. The harness decides whether the tool exists and whether it is allowed.

## Dynamic Mouse Buddy States

```ts
type BuddyState =
  | "idle"
  | "aware"
  | "hinting"
  | "prompt"
  | "thinking"
  | "expanded"
  | "minimized";
```

State intent:

- `idle`: CT is quiet.
- `aware`: CT has cursor/selection/hover/focus context.
- `hinting`: CT shows a quiet proactive insight.
- `prompt`: user is giving intent.
- `thinking`: harness is running and streaming progress.
- `expanded`: generated UI is visible.
- `minimized`: CT remains as a compact anchor.

The buddy should not chase the cursor constantly. It should snap to meaningful intent anchors and stay out of the way.

## Context Packets

The model receives structured context, not raw DOM.

```ts
type PageContextPacket = {
  url: string;
  title: string;
  visibleText: string;
  selectedText?: string;
  cursorPosition?: { x: number; y: number };
  hoveredElement?: DomElementSummary & { dwellMs: number };
  focusedElement?: DomElementSummary;
  nearbyElements: DomElementSummary[];
  capabilityMap: PageCapabilitySummary[];
  hostTheme: HostTheme;
  sensitivity?: "none" | "private" | "credential" | "payment" | "account" | "health" | "legal";
};
```

For OS companion mode, use a parallel packet:

```ts
type OsContextPacket = {
  activeApp: string;
  windowTitle: string;
  displayBounds: { width: number; height: number };
  windowBounds?: { x: number; y: number; width: number; height: number };
  pointer: { x: number; y: number; velocity: number };
  selectedText?: string;
  focusedElement?: string;
  hoveredRegion?: {
    id: string;
    kind: "button" | "input" | "text" | "image" | "table" | "dialog" | "code" | "unknown";
    label?: string;
    bounds: { x: number; y: number; width: number; height: number };
    dwellMs: number;
  };
  visibleRegions: Array<{
    id: string;
    kind: string;
    bounds: { x: number; y: number; width: number; height: number };
    summary: string;
    confidence: number;
  }>;
  screenshot?: { id: string; crop?: string; hash: string };
  sensitivity: "none" | "private" | "credential" | "payment" | "account" | "health" | "legal" | "work";
  recentActions: string[];
};
```

## Proactive Insight

Proactive does not mean autonomous action.

```ts
type ProactiveInsight = {
  id: string;
  confidence: number;
  kind: "verify" | "understand" | "summarize" | "respond" | "navigate" | "risk";
  anchor: UIAnchorIntent;
  title: string;
  preview: string;
  suggestedPrompt: string;
  urgency: "quiet" | "normal" | "important";
};
```

Only quiet suggestions should appear without explicit user request. A proactive insight becomes a normal harness run only after the user accepts it.

## AI Pointer Principles

Clickthrough should follow these principles:

1. **Maintain flow**: CT appears where the user already works.
2. **Show and tell**: pointing, selection, screenshot crops, and voice/text combine into intent.
3. **Make "this" and "that" meaningful**: the harness resolves references from pointer context.
4. **Turn pixels into entities**: screenshots become typed regions, targets, risks, and actions.

The companion follows intent anchors, not raw cursor pixels. Constant chasing is wrong; stable snapping is right.

## Permission Tiers

```txt
T0 Observe Local       local screen/window metadata only
T1 Explain             redacted screenshot/model allowed, no action
T2 Prepare             drafts, values, steps; user applies manually
T3 Assisted Action     click/type/scroll with visible session controls
T4 Scoped Automation   bounded goal, app/domain, action set, time/action budget
T5 High-Risk Approval  send/delete/buy/permissions/credentials; confirm at point of risk
T6 Hand-Off Only       CAPTCHA, final financial transfer, password finalization, medical/legal final action
```

The harness may downgrade any request to a lower tier. The model cannot upgrade itself.

## Event Stream

Every meaningful transition emits a typed event:

```ts
type HarnessEvent =
  | { type: "state.changed"; state: HarnessState; message?: string }
  | { type: "insight.suggested"; insight: ProactiveInsight }
  | { type: "tool.started"; call: ToolCallSummary }
  | { type: "tool.finished"; result: ToolResultSummary }
  | { type: "ui.patch"; patch: UiPatch }
  | { type: "result"; result: HarnessResult };
```

The first implementation can use an async iterable. SSE, WebSocket, extension ports, or subprocess streams are adapters later.

## UI Output Contract

The model should produce a surface plan plus primitives:

```txt
surface plan -> data model -> primitive tree -> safety summary
```

The renderer validates and renders:

- known primitive names only
- safe props only
- action ids from an allowed list
- no arbitrary HTML
- no raw CSS
- no script
- viewport-safe placement
- CT trust mark visible

## Safety Rules

- Proactive observation and insight can happen without explicit prompts.
- Impactful action requires explicit approval, verified targets, and visible risk.
- Raw mutation tools are unavailable; only scoped browser capabilities can act.
- Browser-worker automation is isolated from the user's active tab and cannot mutate user state without an approved bridge.
- Sensitive pages suppress proactive model calls until the user engages.
- Verification must expose uncertainty and sources.
- The harness owns policy. The model cannot approve its own actions.

## Implementation Rule

When the current frontend harness conflicts with this document, prefer this document and the OpenSpec change:

```txt
openspec/changes/dynamic-mouse-buddy-proactive-harness
```
