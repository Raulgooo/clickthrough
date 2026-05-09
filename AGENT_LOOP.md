# Clickthrough Agent Loop

## Goal

Clickthrough should be its own browser-native intent agent. It must not depend on one model, one tool provider, or one app integration.

The architecture should work with both dumb and smart models by making the harness strong:

- explicit state machine
- typed context packets
- bounded memory
- small tool contracts
- validated UI schema
- approval gates
- deterministic execution and verification

The model should decide and synthesize. The harness should constrain, validate, route, and recover.

## Agent Identity

Clickthrough is not a wrapper around another assistant. It owns the browser intent loop.

Clickthrough owns:

- browser page understanding
- intent classification
- DOM capability mapping
- generated overlay UI
- tool routing
- user approval
- action execution
- verification
- short-term and long-term memory

Clickthrough may delegate to specialist tools:

- web search
- source fetch
- PDF/document extraction
- MCP apps
- browser DOM tools

The user talks to CT. CT decides what tools to use.

## Core Loop

```txt
Observe -> Recall -> Classify Intent -> Plan -> Generate UI -> Ask Approval -> Act -> Verify -> Remember
```

For some intents, steps are skipped:

- Verify: `Observe -> Recall -> Plan investigation -> Generate evidence UI -> Search -> Update UI -> Verdict -> Remember`
- Understand: `Observe -> Recall -> Extract content -> Generate explainer UI -> Refine -> Remember`
- Act: `Observe -> Recall -> Map capabilities -> Generate action UI -> Ask approval -> Act -> Verify -> Remember`
- Respond: `Observe -> Recall -> Explain context -> Generate draft UI -> User edits -> Remember`

## State Machine

Use explicit states instead of free-form agent flow.

```ts
type AgentState =
  | "idle"
  | "observing_page"
  | "recalling_context"
  | "classifying_intent"
  | "planning"
  | "generating_ui"
  | "waiting_for_user"
  | "running_tools"
  | "awaiting_approval"
  | "executing_action"
  | "verifying_result"
  | "remembering"
  | "completed"
  | "failed";
```

Every state transition should emit an AG-UI event so the overlay can show progress.

## Context Packets

The model should receive structured packets, not a raw browser dump.

### `UserIntentPacket`

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

### `PageContextPacket`

```ts
type PageContextPacket = {
  url: string;
  title: string;
  visibleText: string;
  selectedText?: string;
  focusedElement?: DomElementSummary;
  nearbyElements: DomElementSummary[];
  capabilityMap: PageCapability[];
  hostTheme: HostThemeSummary;
};
```

### `MemoryPacket`

Start with bounded memory. Twenty recent messages or events is acceptable for the prototype.

```ts
type MemoryPacket = {
  recentTurns: AgentTurn[];
  userPreferences: UserPreference[];
  siteMemories: SiteMemory[];
};
```

Rules:

- Keep short-term memory bounded.
- Summarize older turns into compact preferences.
- Never let memory override current page evidence.
- Treat remembered preferences as hints, not truth.

## Intent Classification

Classify the user's request into one or more intent families:

```ts
type IntentFamily =
  | "verify"
  | "understand"
  | "act"
  | "respond"
  | "navigate"
  | "summarize"
  | "unknown";
```

Classifier output:

```ts
type IntentClassification = {
  family: IntentFamily;
  confidence: number;
  target?: "claim" | "selection" | "page" | "form" | "message" | "workflow";
  needsWebSearch: boolean;
  needsDomActions: boolean;
  needsApproval: boolean;
  riskLevel: "low" | "medium" | "high";
};
```

Harness rule:

- Low-confidence classification should generate a clarification UI, not guess.
- Action intents with medium/high risk require approval.
- Verification intents must expose uncertainty.

## Planner

The planner decides what should happen, but does not execute browser actions directly.

Planner output:

```ts
type AgentPlan = {
  goal: string;
  intent: IntentClassification;
  uiMode: OverlayMode;
  toolCalls: PlannedToolCall[];
  actionPlan?: BrowserActionPlan;
  expectedResult: string;
  risks: RiskItem[];
};
```

Overlay modes:

```ts
type OverlayMode =
  | "inline_prompt"
  | "anchored_popover"
  | "side_panel"
  | "spotlight"
  | "fullscreen_workbench"
  | "native_insertion";
```

Planner rules:

- Prefer the smallest overlay that solves the task.
- Use side panels for evidence-heavy or diagram-heavy work.
- Use anchored popovers for local context.
- Use spotlight overlays for claim/selection/page-target emphasis.
- Use native insertion when generated controls should feel like the page grew a missing form.

## Tool Layer

Tools should be small, typed, and boring.

The model requests tools through explicit contracts. The harness executes them.

Examples:

```ts
type ToolCall =
  | { name: "web.search"; input: { query: string; recencyDays?: number } }
  | { name: "web.fetch"; input: { url: string } }
  | { name: "dom.scan"; input: { includeHidden?: boolean } }
  | { name: "dom.highlight"; input: { elementId: string; label?: string } }
  | { name: "dom.click"; input: { elementId: string } }
  | { name: "dom.fill"; input: { elementId: string; value: string } }
  | { name: "pdf.extract"; input: { pageRange?: string; selection?: string } }
  | { name: "memory.write"; input: { key: string; value: string; scope: "user" | "site" } };
```

Tool rules:

- The model never gets direct arbitrary browser execution.
- Tools return structured results.
- Tool failures are normal and must be reflected in UI.
- Browser action tools require stable element ids from the DOM scanner.
- Sensitive action tools require prior approval.

## DOM Scanner

The DOM scanner is a core subsystem.

It should produce a capability map that weaker models can reason over.

```ts
type PageCapability = {
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

Scanner responsibilities:

- visible text extraction
- selected text extraction
- accessible name extraction
- form field grouping
- button/link/menu detection
- table and list detection
- modal/dialog detection
- hidden/offscreen state detection
- host theme sampling
- stable element reference creation
- nearby context around focused/selected elements

## UI Generation

The model emits a Clickthrough UI tree, not arbitrary HTML.

```ts
type GeneratedUI = {
  overlayMode: OverlayMode;
  root: ClickthroughNode;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
};
```

Validation rules:

- Unknown primitive types are rejected.
- Props are validated by primitive type.
- Action buttons must bind to known action ids.
- Dangerous actions must be behind `ApprovalGate`.
- Medical/legal/financial/security contexts must include a guard or uncertainty note.
- Generated UI must include loading/error states for long-running tools.

## Approval

Approval is a harness-level requirement, not a model suggestion.

Require approval for:

- destructive actions
- account changes
- permission changes
- external sends/posts/messages
- payments/billing
- credential/API-key creation
- form submission with sensitive data

Approval packet:

```ts
type ApprovalRequest = {
  actionPlanId: string;
  summary: string;
  steps: string[];
  risks: RiskItem[];
  approveLabel: string;
  cancelLabel: string;
};
```

## Execution

Execution should be deterministic.

The executor receives an approved `BrowserActionPlan` and runs browser tools step by step.

```ts
type BrowserActionPlan = {
  id: string;
  steps: BrowserActionStep[];
};

type BrowserActionStep =
  | { kind: "click"; elementId: string }
  | { kind: "fill"; elementId: string; value: string }
  | { kind: "select"; elementId: string; value: string }
  | { kind: "waitFor"; condition: string; timeoutMs: number }
  | { kind: "verify"; assertion: string };
```

Execution rules:

- Stop on first unexpected failure.
- Stream progress to UI.
- Ask the planner to recover only when safe.
- Never silently continue after acting on the wrong element.

## Verification

Every action flow ends with verification.

Verification can use:

- DOM state
- visible success messages
- URL changes
- new table/list rows
- generated values
- API response if available

Verification output:

```ts
type VerificationResult = {
  status: "success" | "failed" | "partial" | "unknown";
  summary: string;
  evidence: string[];
  nextActions?: string[];
};
```

## Model-Agnostic Prompting Strategy

Make the model's job narrow.

Instead of asking:

> What should we do?

Ask:

> Given this intent classification, page capability map, and available primitives, produce an `AgentPlan` that satisfies this schema.

Then:

> Given this validated plan and these tool results, produce a `GeneratedUI` tree using only allowed primitives.

Then:

> Given this approved action plan and tool results, summarize verification.

This makes the system usable with weaker models and better with stronger ones.

## Error Recovery

Common failures:

- low confidence intent
- missing target element
- web search unavailable
- source contradiction
- schema validation failure
- action element disappeared
- verification unknown

Recovery behavior:

- Generate clarification UI for ambiguous intent.
- Show uncertainty instead of hiding it.
- Retry tool calls with narrower inputs.
- Ask for approval again if action plan changes.
- Fall back to explanation when action is unsafe.
- Preserve page state when failing.

## Minimum Prototype Memory

Start simple:

- last 20 agent/user turns
- current page session state
- user preferences captured explicitly
- site-specific successful workflow notes

Example memories:

- "User prefers source-heavy verification."
- "On SharkAuth, full-permission keys require approval and a warning."
- "When explaining CS topics, user likes diagrams first."

## Why This Harness Works

Smart models can reason deeply inside the loop.

Dumb models still succeed because the harness gives them:

- structured context
- explicit intent classes
- limited tool contracts
- validated UI primitives
- deterministic execution
- approval boundaries
- verification requirements

The product quality comes from the loop, not from hoping the model improvises correctly.
