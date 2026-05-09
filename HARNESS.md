# Clickthrough Harness Spec

## Purpose

Clickthrough needs a strong browser-agent harness, not a fragile prompt loop.

The harness should make any model useful by controlling:

- page context
- memory
- tool execution
- generated UI schema
- permissions
- user approval
- browser actions
- verification
- streaming overlay state

The model proposes. The harness validates, routes, gates, executes, and verifies.

## Clean-Room Lessons Applied

The useful pattern from strong agent harnesses is simple:

1. Keep the loop tool-result driven.
2. Send compact structured context, not raw dumps.
3. Load tool schemas only when needed.
4. Run read-only tools in parallel.
5. Run mutating tools sequentially.
6. Enforce permissions outside the model.
7. Validate generated UI before rendering.
8. Compact memory deliberately.
9. Let users interrupt or redirect.
10. End every action with verification.

Everything below is specific to Clickthrough.

## Top-Level Architecture

```txt
Browser Extension / Overlay
  -> captures intent, selection, page context, DOM scan, host style
  -> streams events from backend
  -> renders variable GenUI overlays
  -> executes approved browser actions

Backend Harness
  -> receives context packets
  -> recalls memory
  -> classifies intent
  -> plans tool/UI/action work
  -> streams AG-UI events
  -> runs web/search/PDF/MCP tools
  -> validates generated UI trees
  -> requests approval
  -> verifies results
  -> writes memory
```

## Core Loop

```txt
Receive intent
Build page context
Recall memory
Classify intent and risk
Plan work
Generate initial UI skeleton
Run tools
Patch generated UI
Ask approval if needed
Execute approved browser actions
Verify result
Remember useful facts
Finish with typed result
```

## Intent Families

```ts
export type IntentFamily =
  | "verify"
  | "understand"
  | "act"
  | "respond"
  | "navigate"
  | "summarize"
  | "unknown";
```

Harness rules:

- `verify` must expose evidence, source quality, and uncertainty.
- `understand` should prefer diagrams and interactive explanations over paragraphs.
- `act` requires DOM capability mapping and approval for sensitive actions.
- `respond` must stay private until the user approves sending/posting.
- `unknown` should render a clarification UI, not guess.

## State Machine

```ts
export type HarnessState =
  | "idle"
  | "receiving_intent"
  | "observing_page"
  | "recalling_memory"
  | "classifying_intent"
  | "planning"
  | "generating_ui"
  | "running_tools"
  | "waiting_for_user"
  | "awaiting_approval"
  | "executing_actions"
  | "verifying"
  | "remembering"
  | "completed"
  | "cancelled"
  | "failed";
```

Every state transition should stream to the overlay.

```ts
export type HarnessEvent =
  | { type: "state.changed"; state: HarnessState; message?: string }
  | { type: "ui.patch"; patch: UiPatch }
  | { type: "tool.started"; call: ToolCallSummary }
  | { type: "tool.finished"; result: ToolResultSummary }
  | { type: "approval.requested"; request: ApprovalRequest }
  | { type: "approval.resolved"; decision: ApprovalDecision }
  | { type: "result"; result: HarnessResult };
```

## Run Budgets

Every run needs limits so demos do not hang.

```ts
export type RunBudget = {
  maxModelTurns: number;
  maxToolCalls: number;
  maxWallClockMs: number;
  maxCostUsd?: number;
};

export const DEFAULT_BUDGETS: Record<IntentFamily, RunBudget> = {
  verify: { maxModelTurns: 8, maxToolCalls: 16, maxWallClockMs: 45_000 },
  understand: { maxModelTurns: 6, maxToolCalls: 8, maxWallClockMs: 30_000 },
  act: { maxModelTurns: 10, maxToolCalls: 20, maxWallClockMs: 60_000 },
  respond: { maxModelTurns: 5, maxToolCalls: 6, maxWallClockMs: 20_000 },
  navigate: { maxModelTurns: 5, maxToolCalls: 10, maxWallClockMs: 25_000 },
  summarize: { maxModelTurns: 4, maxToolCalls: 6, maxWallClockMs: 20_000 },
  unknown: { maxModelTurns: 3, maxToolCalls: 4, maxWallClockMs: 15_000 }
};
```

Typed stop reasons:

```ts
export type HarnessStopReason =
  | "success"
  | "cancelled_by_user"
  | "max_turns"
  | "max_tool_calls"
  | "max_wall_clock"
  | "max_cost"
  | "tool_error"
  | "schema_validation_failed"
  | "approval_denied"
  | "verification_failed";
```

## Context Packets

Never send raw DOM to the model.

```ts
export type HarnessContext = {
  runId: string;
  sessionId: string;
  userIntent: UserIntentPacket;
  page: PageContextPacket;
  memory: MemorySlice;
  availableTools: ToolManifestSummary[];
  availablePrimitives: PrimitiveManifestSummary[];
  constraints: HarnessConstraints;
};
```

`PageContextPacket` should include:

- URL and title
- selected text
- visible text summary
- focused element
- nearby element summaries
- capability map
- host theme summary
- risk hints from the page

## Memory

Start with a small memory system.

### Active Run

Holds current:

- goal
- classification
- plan
- tool results
- generated UI tree
- approval state
- verification evidence

### Session Memory

Bounded to the active browser session:

- last 20 turns
- recent tool summaries
- current page state
- unresolved questions

### Site Memory

Scoped to origin/app:

- known workflows
- successful action paths
- app-specific warnings
- style preferences learned from the host

### User Memory

Cross-site preferences:

- explanation style
- source preferences
- tone preferences
- approval strictness

## Compaction

When memory grows, compact into:

```ts
export type CompactedSession = {
  currentGoal: string;
  activePage: string;
  decisions: string[];
  constraints: string[];
  toolFindings: string[];
  generatedUiState: string;
  approvalState?: string;
  verificationState?: string;
  openQuestions: string[];
};
```

Preserve:

- current task objective
- selected/anchored target
- user constraints
- action approval status
- tool findings that changed the plan
- verification evidence

Drop:

- raw HTML
- full search result pages
- repeated status messages
- stale failed plans

## Tool Registry

Tools must be typed, scoped, and permissioned.

```ts
export type ToolManifestSummary = {
  name: string;
  description: string;
  category: "dom" | "web" | "pdf" | "memory" | "mcp" | "browser_action" | "ui";
  readOnly: boolean;
  risk: "low" | "medium" | "high";
  requiresApproval: boolean;
};

export type ToolDefinition<Input, Output> = {
  name: string;
  description: string;
  inputSchema: unknown;
  outputSchema: unknown;
  readOnly: boolean;
  risk: "low" | "medium" | "high";
  requiresApproval: (input: Input, context: HarnessContext) => boolean;
  execute: (input: Input, context: ToolExecutionContext) => Promise<Output>;
};
```

Core tool groups:

- `dom.scan`
- `dom.highlight`
- `dom.click`
- `dom.fill`
- `dom.select`
- `dom.waitFor`
- `web.search`
- `web.fetch`
- `pdf.extract`
- `memory.read`
- `memory.write`
- `ui.validate`
- `mcp.listTools`
- `mcp.callTool`

## Tool Policy

```ts
export type PermissionMode =
  | "default"
  | "read_only"
  | "auto_low_risk"
  | "strict_approval"
  | "demo_trusted";
```

Rules:

- Read-only tools can auto-run in `default`.
- Mutating browser tools require approval unless explicitly marked low-risk.
- External sends/posts/messages always require approval.
- API key, credential, permission, billing, and destructive actions always require approval.
- Tool denial returns a typed result so the model can recover.

## Parallelization

Run these in parallel:

- DOM scan
- host theme sampling
- web search
- source fetch
- PDF extraction
- memory lookup

Run these sequentially:

- click
- fill
- select
- submit
- create API key
- send message
- write memory

## Tool Results

```ts
export type ToolResult<T = unknown> = {
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

The model should usually receive `summaryForModel`, not raw output.

Raw outputs can be stored in trace storage and referenced by id.

## DOM Scanner

The DOM scanner is the most important browser-side subsystem.

```ts
export type DomScanResult = {
  page: {
    url: string;
    title: string;
    visibleTextSummary: string;
    selectedText?: string;
  };
  elements: DomElementSummary[];
  capabilities: PageCapability[];
  forms: FormSummary[];
  tables: TableSummary[];
  dialogs: DialogSummary[];
  hostTheme: HostThemeSummary;
};
```

Scanner responsibilities:

- visible text extraction
- selected text extraction
- accessible name extraction
- role and tag detection
- visible bounding boxes
- form grouping
- table/list detection
- modal/dialog detection
- nearby context around target elements
- stable element references for current page state
- host style sampling
- capability map generation

Scanner constraints:

- cap element count
- prioritize visible and interactive elements
- prioritize selected-region-adjacent elements
- never send full raw DOM to the model

## UI Generation

The model emits Clickthrough primitives, not HTML.

```ts
export type GeneratedUI = {
  overlayMode: OverlayMode;
  root: ClickthroughNode;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
};
```

Pipeline:

```txt
Model proposes UI tree
Schema validation
Safety validation
Action binding validation
Host-theme adaptation
AG-UI patch stream
Overlay render
```

Reject:

- unknown primitive types
- invalid props
- missing approval gate for risky action
- unknown action bindings
- raw scripts
- unvalidated HTML
- medical/legal/financial/security certainty without a guard

Allow at most two repair attempts:

```ts
export const UI_SCHEMA_MAX_RETRIES = 2;
```

Fallback UI:

- compact explanation
- retry button
- visible tool progress
- safe text-only continuation

## Overlay Modes

```ts
export type OverlayMode =
  | "inline_prompt"
  | "anchored_popover"
  | "side_panel"
  | "spotlight"
  | "fullscreen_workbench"
  | "native_insertion";
```

Rules:

- Use `inline_prompt` for invocation.
- Use `anchored_popover` for local claims, messages, and short context.
- Use `side_panel` for evidence dashboards and long-running work.
- Use `spotlight` to emphasize selected DOM regions.
- Use `fullscreen_workbench` only for dense diagrams or multi-step explanations.
- Use `native_insertion` when generated controls should feel like the page grew a missing form.

## Approval

Approval is enforced by the harness.

```ts
export type ApprovalRequest = {
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

export type ApprovalDecision =
  | { type: "approved"; requestId: string; modifiedInput?: unknown }
  | { type: "denied"; requestId: string; reason?: string }
  | { type: "redirected"; requestId: string; instruction: string };
```

Require approval for:

- external sends/posts/messages
- account changes
- permission changes
- API key or credential creation
- destructive actions
- purchases/billing
- sensitive personal outputs

## Action Execution

Approved action plans execute step by step.

```ts
export type BrowserActionPlan = {
  id: string;
  goal: string;
  steps: BrowserActionStep[];
};

export type BrowserActionStep =
  | { kind: "click"; elementId: string }
  | { kind: "fill"; elementId: string; value: string }
  | { kind: "select"; elementId: string; value: string }
  | { kind: "waitFor"; condition: string; timeoutMs: number }
  | { kind: "verify"; assertion: string };
```

Rules:

- Stop on first unexpected failure.
- Stream every step to `ExecutionLog`.
- Re-scan DOM after route changes or major UI changes.
- Do not silently continue after acting on a mismatched element.

## Verification

Every action flow ends with verification.

```ts
export type VerificationResult = {
  status: "success" | "failed" | "partial" | "unknown";
  summary: string;
  evidence: string[];
  nextActions?: string[];
};
```

Verification sources:

- DOM success state
- URL or route change
- visible toast/message
- table/list row appears
- field value changed
- generated API key appears
- external API response if available

If verification is `unknown`, do not claim success.

## Hooks

Hooks are deterministic code outside the model.

```ts
export type HarnessHook =
  | "BeforeRun"
  | "BeforeModelTurn"
  | "AfterModelTurn"
  | "BeforeToolUse"
  | "AfterToolUse"
  | "BeforeUiPatch"
  | "BeforeApproval"
  | "AfterApproval"
  | "BeforeActionExecution"
  | "AfterActionExecution"
  | "BeforeMemoryWrite"
  | "OnRunStop"
  | "BeforeCompaction";
```

Use hooks for:

- redacting secrets
- limiting DOM output size
- blocking unsafe tool inputs
- validating generated UI
- enforcing approval
- recording traces
- enforcing run budgets

If a rule must always hold, implement it as harness policy or hook, not as a prompt instruction.

## MCP Loading

MCP should be deferred.

Do not load every MCP tool schema into every model turn.

```ts
export type McpServerSummary = {
  name: string;
  description: string;
  toolCount: number;
  categories: string[];
  connected: boolean;
};
```

Load MCP tool schemas only when:

- intent classification matches the server category
- planner asks for a relevant tool type
- user explicitly requests an external app action

If MCP fails:

- remove unavailable tools from the manifest
- emit `tool.unavailable`
- explain the missing integration in the overlay
- offer a browser/DOM fallback when possible

## Interrupt And Steering

Users can interrupt any run.

```ts
export type UserSteeringEvent =
  | { type: "cancel" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "redirect"; instruction: string }
  | { type: "answer_question"; answers: Record<string, string | string[]> }
  | { type: "approve"; decision: ApprovalDecision };
```

Rules:

- `cancel` stops future tool calls.
- `pause` blocks new tool calls.
- `redirect` adds user instruction and replans.
- approval decisions resume paused action flows.

## Observability

Store traces outside model context.

```ts
export type RunTrace = {
  runId: string;
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  states: HarnessState[];
  modelTurns: number;
  toolCalls: ToolResultSummary[];
  approvals: ApprovalDecision[];
  stopReason?: HarnessStopReason;
  costUsd?: number;
};
```

Do not log:

- secrets
- raw API keys
- full private messages
- large raw DOM dumps

## Demo Run Profiles

### Twitter/X Verification

```ts
{
  family: "verify",
  needsWebSearch: true,
  needsDomActions: false,
  riskLevel: "low"
}
```

Flow:

1. `dom.scan` around tweet.
2. `dom.highlight` claim.
3. Render `VerificationDashboard` skeleton.
4. `web.search` public identity/source signals.
5. `web.fetch` top sources.
6. Patch evidence, contradictions, and confidence.
7. Render verdict with uncertainty.

### OAuth PDF Explainer

```ts
{
  family: "understand",
  needsWebSearch: false,
  needsDomActions: false,
  riskLevel: "low"
}
```

Flow:

1. `pdf.extract` selected paragraph.
2. Render `VisualExplainer`.
3. Patch `SequenceDiagram` steps.
4. Add with/without PKCE toggle.

### SharkAuth API Key

```ts
{
  family: "act",
  needsWebSearch: false,
  needsDomActions: true,
  riskLevel: "high"
}
```

Flow:

1. `dom.scan`.
2. Build capability map.
3. Render `ActionSurface`.
4. Request approval.
5. Execute browser action plan.
6. Verify new key exists.
7. Render `VerificationResult`.

### Social Context

```ts
{
  family: "respond",
  needsWebSearch: false,
  needsDomActions: false,
  riskLevel: "medium"
}
```

Flow:

1. `dom.scan` selected message only.
2. Render private `ResponseAssistant`.
3. Generate explanation, what-not-to-say, and reply drafts.
4. Require approval before sending or posting.

## Prototype Modules

Backend:

```txt
backend/src/harness/run.ts
backend/src/harness/state.ts
backend/src/harness/events.ts
backend/src/harness/budget.ts
backend/src/harness/context.ts
backend/src/harness/memory.ts
backend/src/harness/tools/registry.ts
backend/src/harness/tools/policy.ts
backend/src/harness/hooks.ts
backend/src/harness/ui/validate.ts
backend/src/harness/approval.ts
backend/src/harness/verification.ts
backend/src/harness/trace.ts
```

Browser/overlay:

```txt
extension/src/content/overlayMount.tsx
extension/src/content/domScanner.ts
extension/src/content/hostTheme.ts
extension/src/content/actionExecutor.ts
extension/src/content/pageBridge.ts
extension/src/overlay/eventStream.ts
extension/src/overlay/renderPrimitive.tsx
```

## Pseudocode

```ts
export async function runClickthrough(input: RunInput): Promise<HarnessResult> {
  const run = createRun(input);
  emit(run, { type: "state.changed", state: "receiving_intent" });

  const context = await buildContextPacket(input);
  const memory = await recallMemory(context);
  const classification = await classifyIntent(context, memory);
  const budget = budgetFor(classification.family);
  const tools = await selectToolManifest(classification, context);

  let plan = await planRun({ context, memory, classification, tools });
  let ui = await validateOrRepairUi(await generateInitialUi(plan), plan);
  emit(run, { type: "ui.patch", patch: mountUi(ui) });

  while (!run.done) {
    enforceBudget(run, budget);

    const requested = await nextToolCalls(plan, run.toolResults);
    const allowed = await applyToolPolicy(requested, context);

    if (allowed.approvalRequired) {
      const decision = await requestApproval(allowed.approval);
      if (decision.type !== "approved") {
        return stopRun(run, "approval_denied");
      }
    }

    const results = await executeTools(allowed.calls);
    run.toolResults.push(...results);

    ui = await validateOrRepairUi(await updateUiFromResults(plan, results), plan);
    emit(run, { type: "ui.patch", patch: renderPatch(ui) });

    if (planRequiresAction(plan) && approvalSatisfied(run)) {
      const execution = await executeBrowserActionPlan(plan.actionPlan);
      const verification = await verifyResult(plan, execution);
      return completeRun(run, verification);
    }

    if (plannerSaysDone(plan, run.toolResults)) {
      const verification = await verifyNonActionResult(plan, run.toolResults);
      return completeRun(run, verification);
    }

    plan = await replan(plan, run.toolResults);
  }

  return stopRun(run, "cancelled_by_user");
}
```

## Reference Sources

The clean-room lessons above were informed by public Claude Code docs on agent loops, approvals, hooks, tools, context, and best practices:

- https://code.claude.com/docs/en/agent-sdk/agent-loop
- https://code.claude.com/docs/en/how-claude-code-works
- https://code.claude.com/docs/en/agent-sdk/user-input
- https://code.claude.com/docs/en/features-overview
- https://code.claude.com/docs/en/best-practices

