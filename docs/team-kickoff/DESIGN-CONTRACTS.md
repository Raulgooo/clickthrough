# Clickthrough Parallel Execution Design Contracts

## Purpose

This document is the coordination contract for four users working in parallel.

The goal is speed without drift. Each user can build aggressively inside their lane, but shared data shapes, ownership boundaries, and integration gates are fixed here.

If a change breaks this contract, stop and update the contract first.

## Product Contract

Clickthrough is a browser-native runtime interface layer.

It should feel like a natural expansion of the cursor: invoked at the user's point of intent, anchored to the selected text, focused element, hovered control, cursor/caret point, or active page region, then expanded only as much as the task requires.

The visible product is generated UI, not a chat transcript, sidebar, or scripted demo.

## Parallel Ownership

| User | Owns | Primary Write Scope | Must Not Own |
|---|---|---|---|
| A | Harness runtime, classification, planning, tool policy, generated UI declarations, approval, verification | `frontend/src/harness/runtime/`, `frontend/src/types/harness.ts`, `frontend/src/types/ui.ts` | Renderer styling, DOM scanner internals, demo scene composition |
| B | DOM scanner, page bridge, browser action executor, SharkAuth discovery | `frontend/src/browser/` | Harness planning, primitive rendering, demo final UI |
| C | Overlay renderer, event stream consumer, primitive validation display, host style adaptation | `frontend/src/renderer/`, `frontend/src/primitives/`, `frontend/src/harness/useHarness.ts` | Tool planning, scanner heuristics, scenario acceptance |
| D | Scenario acceptance, integration checks, demo coherence, recording script | `frontend/src/demos/`, `frontend/src/test-fixtures/`, `docs/team-kickoff/`, `DEMO.md` | Core harness logic, generic scanner logic, renderer internals |

Cross-lane edits are allowed only when the owner agrees or the contract is updated.

## Integration Order

1. Shared contracts compile.
2. User A emits valid harness events and generated UI declarations.
3. User B produces real `PageContextPacket` values.
4. User C renders streamed `ClickthroughNode` patches.
5. User D proves each scene through acceptance checks, not scripted profiles.
6. Extension/content-script transport adapts to the same contracts after the in-process loop works.

## Data Contract Principles

- Runtime data is typed and structured.
- No raw DOM dumps go to the harness.
- No arbitrary HTML, CSS, scripts, JSX, or unregistered components come from the model.
- All web facts retain source URLs.
- All risky actions require approval before execution.
- No success claim without verification evidence.
- Optional fields must be treated as optional by all consumers.
- Providers are hidden behind Clickthrough contracts.

## Contract 1: User Intent Packet

Producer: User C or extension/content script.

Consumer: User A harness.

```ts
type UserIntentPacket = {
  prompt: string;
  inputMode: "text" | "voice" | "hotkey";
  selectedText?: string;
  anchorElementId?: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
};
```

Rules:

- `prompt` is the user's actual request.
- `selectedText` wins over cursor position as intent anchor.
- `anchorElementId` must refer to a stable DOM id from the scanner when present.
- `timestamp` is ISO-8601.

## Contract 2: Page Context Packet

Producer: User B scanner/page bridge.

Consumer: User A classifier/planner, User C overlay anchoring.

```ts
type PageContextPacket = {
  url: string;
  title: string;
  visibleText: string;
  selectedText?: string;
  focusedElement?: DomElementSummary;
  nearbyElements: DomElementSummary[];
  capabilityMap: PageCapabilitySummary[];
  hostTheme: HostTheme;
};
```

```ts
type DomElementSummary = {
  id: string;
  tagName: string;
  role?: string;
  label: string;
  text?: string;
  type?: string;
  href?: string;
  value?: string;
  visible: boolean;
  disabled: boolean;
  bounds?: { x: number; y: number; width: number; height: number };
};
```

```ts
type PageCapabilitySummary = {
  id: string;
  label: string;
  kind:
    | "button"
    | "link"
    | "form"
    | "input"
    | "select"
    | "table"
    | "menu"
    | "dialog"
    | "tab"
    | "workflow"
    | "unknown";
  elementIds: string[];
  confidence: number;
  description?: string;
};
```

Rules:

- `visibleText` is summarized and capped.
- `nearbyElements` prioritizes selected/focused region and visible interactive elements.
- Every `elementIds[]` entry must resolve to a current DOM element or be omitted.
- `confidence` is `0..1`; low confidence must not block rendering, only execution.
- B owns the scanner. A must not duplicate DOM heuristics.

## Contract 3: Host Theme

Producer: User B scanner/page bridge.

Consumer: User C renderer and User A style planner.

```ts
type HostTheme = {
  mode: "light" | "dark";
  fontFamily: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  borderRadius: number;
  controlRadius: number;
  shadowStyle: "none" | "soft" | "strong";
  density: "compact" | "comfortable" | "spacious";
  buttonStyle: "filled" | "outlined" | "ghost" | "mixed";
  inputStyle: "filled" | "outlined" | "underline";
};
```

Rules:

- Sampling failures must return safe defaults, never `null`.
- Approval gates may use `ct_controlled` style and intentionally contrast with host style.

## Contract 4: Intent Classification

Producer: User A classifier.

Consumer: User A planner, User D acceptance checks.

```ts
type IntentClassification = {
  family:
    | "verify"
    | "understand"
    | "act"
    | "respond"
    | "navigate"
    | "summarize"
    | "unknown";
  confidence: number;
  target?: "claim" | "selection" | "page" | "form" | "message" | "workflow";
  needsWebSearch: boolean;
  needsDomActions: boolean;
  needsApproval: boolean;
  riskLevel: "low" | "medium" | "high";
};
```

Rules:

- `unknown` must produce clarification UI, not a guessed workflow.
- `act` with API keys, credentials, permissions, sends, deletes, billing, or account changes is high risk.
- `verify` must expose uncertainty.
- `respond` must stay private and must not auto-send.

## Contract 5: Primordial Style Brief

Producer: User A fast style planner.

Consumer: User A principal planner, User C renderer as optional metadata.

```ts
type PrimordialStyleBrief = {
  intent: string;
  interfaceArchetype: string;
  anchorStrategy: string;
  layoutBias: string;
  visualTone: string;
  density: "compact" | "comfortable" | "spacious";
  hostAdaptation: "inherit" | "blend" | "contrast" | "ct_controlled";
  motionHint: "none" | "subtle" | "progressive" | "urgent";
  priorityOrder: string[];
  avoid: string[];
};
```

Rules:

- The brief guides generation; it is not authority.
- Safety, evidence, approval, viewport constraints, and validation override style guidance.
- The brief must not contain raw CSS, raw HTML, component code, or selectors.

## Contract 6: Generated UI Declaration

Producer: User A planner/generator.

Consumer: User C renderer, User D acceptance checks.

```ts
type GeneratedUI = {
  overlayMode: OverlayMode;
  styleBrief?: PrimordialStyleBrief;
  surface?: DeclarativeSurfacePlan;
  root: ClickthroughNode;
  dataModel?: Record<string, unknown>;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
  hostTheme?: HostTheme;
};
```

```ts
type OverlayMode =
  | "inline_prompt"
  | "anchored_popover"
  | "side_panel"
  | "spotlight"
  | "fullscreen_workbench"
  | "native_insertion";
```

Rules:

- `root` must be a valid `ClickthroughNode`.
- `surface` is optional during migration, but all new harness-generated UI should include it.
- `dataModel` may hold sources, risks, action steps, drafts, or explanations; consumers must not require scene-specific shape unless documented in a fixture.
- `requiredActions` must only reference harness-owned action ids.

## Contract 7: Declarative Surface Plan

Producer: User A planner/generator.

Consumer: User C overlay positioning/adaptation.

```ts
type DeclarativeSurfacePlan = {
  intent:
    | "verify"
    | "understand"
    | "act"
    | "respond"
    | "navigate"
    | "summarize"
    | "mixed";
  purpose: string;
  anchor: UIAnchorIntent;
  layout: UILayoutIntent;
  style: UIStyleIntent;
  interaction: UIInteractionIntent;
};
```

```ts
type UIAnchorIntent = {
  source:
    | "selection"
    | "focused_element"
    | "hovered_element"
    | "cursor"
    | "page_region"
    | "viewport"
    | "none";
  elementId?: string;
  selector?: string;
  textQuote?: string;
  point?: { x: number; y: number };
  fallbackMode: OverlayMode;
};
```

Rules:

- Anchor priority is selection, focused element, hovered element, cursor/caret, page region, viewport.
- If `elementId` cannot be resolved, C uses `fallbackMode`.
- `selector` is allowed only for renderer positioning; it must never be used for mutation.

## Contract 8: Clickthrough Primitive Tree

Producer: User A planner/generator.

Consumer: User C renderer.

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

Rules:

- `type` must match a registered primitive name.
- `props` must not include `dangerouslySetInnerHTML`, `style`, inline event handlers, scripts, or raw HTML.
- Dangerous actions must include an `ApprovalGate`.
- Unknown primitives render as recoverable validation errors, not blank failure.
- C owns visual implementation of primitives. A owns generated tree composition.

## Contract 9: Harness Event Stream

Producer: User A harness.

Consumer: User C stream reducer and D acceptance tests.

```ts
type HarnessEvent =
  | { type: "state.changed"; state: HarnessState; message?: string }
  | { type: "ui.patch"; patch: UiPatch }
  | { type: "tool.started"; call: ToolCallSummary }
  | { type: "tool.finished"; result: ToolResultSummary }
  | { type: "approval.requested"; request: ApprovalRequest }
  | { type: "approval.resolved"; decision: ApprovalDecision }
  | { type: "result"; result: HarnessResult };
```

Rules:

- Every run starts with `state.changed: receiving_intent`.
- Long-running work emits skeleton/progress UI before final content.
- Tool calls emit `tool.started` and `tool.finished`.
- High-risk action emits `approval.requested` before execution.
- Every run ends with `result`.

Minimum state path for verify:

```txt
receiving_intent -> observing_page -> classifying_intent -> planning -> generating_ui -> running_tools -> generating_ui -> verifying -> completed
```

Minimum state path for high-risk act:

```txt
receiving_intent -> observing_page -> classifying_intent -> planning -> generating_ui -> awaiting_approval -> executing_actions -> verifying -> completed
```

## Contract 10: UI Patch

Producer: User A harness.

Consumer: User C stream reducer.

```ts
type UiPatch = {
  op: "add" | "remove" | "replace" | "move";
  path: string;
  value?: unknown;
};
```

Rules:

- `path: ""` or `"/"` replaces the root.
- Nested patches use slash paths into `children` and `props`.
- C must handle invalid paths without crashing.
- A should prefer root replace until nested patch tests pass.

## Contract 11: Tool Calls And Results

Producer: User A planner/tool registry.

Consumer: User A loop, User D acceptance.

```ts
type PlannedToolCall = {
  name: string;
  input: Record<string, unknown>;
};
```

```ts
type ToolResult<T = unknown> = {
  callId: string;
  toolName: string;
  status: "success" | "denied" | "failed" | "timeout";
  output?: T;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  summaryForModel: string;
  evidence?: string[];
};
```

Rules:

- Read-only tools may run without approval.
- Mutating tools require approval unless explicitly low risk.
- `summaryForModel` is compact and safe to send back to a model.
- Raw large outputs stay outside model context.

## Contract 12: Web Evidence

Producer: User A web tools.

Consumer: User A planner, User C evidence primitives, User D verification scene.

```ts
type GroundedWebSource = {
  id: string;
  url: string;
  title: string;
  publisher?: string;
  author?: string;
  publishedDate?: string;
  retrievedAt: string;
  snippet?: string;
  highlights?: { text: string; score?: number }[];
  score?: number;
  quality?: "high" | "medium" | "low" | "unknown";
  freshness?: "current" | "stale" | "unknown";
  imageUrl?: string;
  faviconUrl?: string;
  media?: WebMediaAsset[];
  provider: "exa" | "browser" | "cache" | "fallback";
  providerResultId?: string;
};
```

Rules:

- `provider` is allowed for diagnostics; Exa-specific raw response fields are not.
- Images are optional and must fall back to text-only evidence.
- Every image must remain tied to `url` or `sourceUrl`.
- No evidence UI may imply certainty if source quality is weak or missing.

## Contract 13: Approval

Producer: User A harness policy.

Consumer: User C approval UI, User B action executor.

```ts
type ApprovalRequest = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  risks: RiskItem[];
  actionPlanId?: string;
  approveLabel: string;
  cancelLabel: string;
  editableFields?: string[];
};
```

```ts
type ApprovalDecision =
  | { type: "approved"; requestId: string; modifiedInput?: unknown }
  | { type: "denied"; requestId: string; reason?: string }
  | { type: "redirected"; requestId: string; instruction: string };
```

Rules:

- Approval is enforced outside the model.
- Denial ends the action flow with `approval_denied`.
- Redirected approval must replan before execution.
- B must never execute mutating steps without an approval decision from A.

## Contract 14: Browser Action Plan

Producer: User A planner.

Consumer: User B action executor.

```ts
type BrowserActionPlan = {
  id: string;
  goal: string;
  steps: BrowserActionStep[];
};
```

```ts
type BrowserActionStep =
  | { kind: "click"; elementId: string }
  | { kind: "fill"; elementId: string; value: string }
  | { kind: "select"; elementId: string; value: string }
  | { kind: "waitFor"; condition: string; timeoutMs: number }
  | { kind: "verify"; assertion: string };
```

Rules:

- `elementId` must come from `PageContextPacket`.
- B stops on first missing or mismatched element.
- B returns evidence for every executed step.
- A verifies before claiming success.

## Contract 15: Verification Result

Producer: User A harness, with evidence from B/tools.

Consumer: User C result UI, User D acceptance.

```ts
type VerificationResult = {
  status: "success" | "failed" | "partial" | "unknown";
  summary: string;
  evidence: string[];
  nextActions?: string[];
};
```

Rules:

- `unknown` and `partial` are valid outcomes.
- UI must show uncertainty instead of hiding it.
- Action scenes cannot emit `success` without visible DOM, fixture, or API evidence.

## Contract 16: Extension Transport

Owner: User A for shared types, User C for content overlay mount, User B for scanner compatibility.

Extension transport must not create a second harness.

```ts
type ExtensionToBackgroundMessage =
  | { type: "ct.run"; requestId: string; prompt: string }
  | { type: "ct.approval"; requestId: string; decision: ApprovalDecision }
  | { type: "ct.interrupt"; requestId: string; action: "cancel" | "pause" | "resume" };
```

```ts
type BackgroundToExtensionMessage =
  | { type: "ct.ready"; sessionId: string }
  | { type: "ct.event"; requestId: string; event: HarnessEvent }
  | { type: "ct.error"; requestId: string; message: string };
```

Rules:

- Extension message port carries the same `HarnessEvent` schema as local async iterable.
- Content script builds `UserIntentPacket` and `PageContextPacket`.
- Background or local in-page adapter owns `HarnessSession`.
- No extension-only event names without contract update.

## User A Contract

User A may change:

- `frontend/src/harness/runtime/**`
- `frontend/src/types/harness.ts`
- `frontend/src/types/ui.ts`
- harness runtime tests

User A must provide:

- `classifyIntent(input) -> IntentClassification`
- `createPrimordialStyleBrief(input) -> PrimordialStyleBrief`
- `createRunPlan(input) -> AgentPlan`
- `createInitialGeneratedUi(input) -> GeneratedUI`
- `validateGeneratedUi(ui) -> UiValidationResult`
- `createLocalHarnessSession(...) -> HarnessSession`
- provider-neutral `web.search` / `web.fetch` tool definitions

User A must not:

- change renderer component visuals
- create scenario-specific final UI trees in demos
- execute browser actions directly without User B executor
- depend on Exa-specific response fields outside web adapter

## User B Contract

User B may change:

- `frontend/src/browser/**`
- browser scanner/action tests
- SharkAuth fixture pages if coordinated with User D

User B must provide:

- `buildPageContextPacket() -> PageContextPacket`
- `scanDom() -> DomScanResult`
- `sampleHostTheme() -> HostTheme`
- `executeBrowserActionPlan(steps) -> BrowserActionResult`
- stable `data-ct-element-id` references

User B must not:

- classify user intent
- decide approval policy
- render final generated UI
- hard-code SharkAuth UI output into scanner logic

## User C Contract

User C may change:

- `frontend/src/renderer/**`
- `frontend/src/primitives/**`
- `frontend/src/harness/useHarness.ts`
- renderer/primitive tests

User C must provide:

- `PrimitiveRenderer` consumes valid `ClickthroughNode`
- `applyHarnessEvent(state, event)` consumes every `HarnessEvent`
- host theme variables map to overlay styles
- approval request events render visibly
- validation errors render recoverably

User C must not:

- invent alternate event names
- require Exa-specific fields
- execute DOM actions
- make all overlays one generic panel

## User D Contract

User D may change:

- `frontend/src/demos/**`
- `frontend/src/test-fixtures/**`
- `docs/team-kickoff/**`
- `DEMO.md`
- recording script/docs

User D must provide:

- per-scene acceptance checks
- fixture page contexts where repeatability is needed
- integration checklist across A/B/C
- final 2-4 minute script

User D must not:

- add runtime scenario profiles
- hard-code final UI event timelines
- bypass live harness path in normal demo mode
- weaken approval/verification to make recording easier

## Merge Gates

Before a lane merges:

- `npx tsc --noEmit` passes in `frontend`.
- Any lane-specific tests pass.
- Changed public data shapes are reflected in this file.
- OpenSpec validates if specs changed.
- The owner lists any known integration risk.

Before final integration:

- A emits a valid verify event stream from a `PageContextPacket`.
- B produces a real page context from a controlled demo page.
- C renders A's stream without custom scene code.
- D confirms each scene has an acceptance check.

## Conflict Rules

- If two users need the same file, define a narrow patch window.
- If a type must change, User A updates the type and this contract first.
- If a primitive prop must change, User C updates primitive type/rendering and this contract first.
- If scanner shape must change, User B updates `PageContextPacket` compatibility and this contract first.
- If demo acceptance requires new data, User D requests the data through this contract, not ad hoc props.

## Current Highest-Risk Seams

1. `GeneratedUI.surface` is optional during migration. New live harness output should include it.
2. `validateUi.ts` must use the same primitive registry as `PrimitiveRenderer`.
3. `applyHarnessEvent()` currently handles root replacement better than nested patches. A should prefer root replacement until C confirms nested patch support.
4. Extension infrastructure must stay a transport adapter, not a second product path.
5. SharkAuth target details are still external. B/D must define safe workspace data before live execution.

