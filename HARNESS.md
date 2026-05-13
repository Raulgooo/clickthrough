# Clickthrough Harness

## North Star

Clickthrough needs a full port of the `mi` harness as its runtime spine.

`mi` is powerful because its core is simple:

```txt
messages + tool schemas
  -> model stream
  -> tool calls
  -> execute tools
  -> append tool results
  -> repeat
```

Clickthrough should port that loop completely, then patch its execution layer so terminal, browser, and OS power flow through typed capabilities, policy gates, approvals, and verification.

The current frontend harness is not the base runtime. It is source material only:

- keep its useful page perception functions
- keep typed context packet ideas
- keep primitive UI and renderer contracts
- keep host-theme and viewport-fit lessons
- discard its one-shot classify/generate flow
- discard its fixed panel assumptions
- discard any frontend-only orchestration model

## MI Port Doctrine

Port MI as the harness, then constrain execution.

Required MI behaviors:

- streaming model turn
- tool call accumulation
- tool schema loading
- tool dispatch
- tool result append
- repeat-until-done loop
- skill/prompt module loading
- delegation pattern
- goal/check verification loop
- compact conversation/session state

Clickthrough patches around MI, not instead of MI:

- typed `HarnessEvent` stream
- structured `ToolResult`
- permission-tiered tool registry
- primitive UI planning and validation
- page/screen context packet adapters
- action previews, receipts, and panic stop
- execution chambers for shell, browser, and OS control

## Capability Boundary

Clickthrough is proactive and action-capable, but raw power stays outside the model.

The harness may by default:

- observe page context
- observe active app/window context
- capture local screenshots and cropped regions
- scan DOM summaries
- track cursor, hover, focus, selection, and viewport
- score proactive insights
- search and fetch web sources
- highlight page regions
- annotate screen regions
- generate validated UI primitives
- draft and prepare next steps
- disclose uncertainty and source quality

The harness may after explicit approval and target verification:

- click, fill, and submit verified DOM targets
- click, type, scroll, drag, and hotkey verified OS targets
- send user-approved drafts
- create credentials through verified workflows
- change permissions with elevated confirmation
- prepare purchases or destructive actions with explicit confirmation

The model must not directly:

- run shell commands
- execute arbitrary JavaScript
- render arbitrary HTML/CSS
- mutate unverified DOM targets
- control raw screen coordinates without verified targets
- use unscoped network tools
- silently send private page content to model/tool providers when context is sensitive

The model requests capabilities. The harness scopes, approves, executes, and verifies.

## Harness Loop

```txt
input event
  -> build page/screen context packet
  -> MI model turn
  -> accumulate MI tool calls
  -> policy broker maps tool calls to execution chambers
  -> execute allowed tools
  -> append structured tool results to MI conversation
  -> repeat until goal/check passes or budget stops
  -> surface plan
  -> primitive tree
  -> validate and fit-check
  -> stream UI
  -> result
```

This is a real loop. The model can request multiple tools and replan from results. The harness owns budgets, tool policy, validation, and fallback.

## Execution Chambers

Powerful execution is allowed, but only inside chambers with explicit contracts.

```txt
MI tool request
  -> PolicyBroker
  -> CapabilityResolver
  -> ExecutionChamber
  -> StructuredResult
  -> VerificationCheck
```

Chambers:

- `page`: active-tab read-only perception and approved DOM actions.
- `screen`: screenshot crop, OCR, accessibility, app/window metadata.
- `browser-worker`: isolated Obscura/Playwright/CDP browser worker.
- `terminal`: approved sandboxed commands only.
- `os`: verified computer-use actions with visible session controls.
- `web`: search/fetch/source tools.
- `memory`: bounded session/project memory.

Each chamber declares:

- allowed tools
- required permission tier
- working directory or domain bounds
- time/action/token budgets
- redaction requirements
- approval requirements
- postcondition checks

## Obscura Browser Worker Strategy

Use Obscura as the reference for isolated browser execution. It provides a lightweight Rust headless browser engine with V8 JavaScript, Chrome DevTools Protocol support, Playwright/Puppeteer compatibility, worker-style scraping, network/cookie handling, input dispatch, and optional stealth/tracker blocking.

Clickthrough should use this pattern for browser workers:

- run investigation, scraping, source fetch, and reproducible browser checks outside the user's live tab
- expose CDP/Playwright-compatible tools to MI through `browser-worker.*`
- isolate cookies, storage, proxy, user agent, and network policy per worker/session
- apply navigation, domain, action, and data budgets before execution
- keep stealth/anti-detect behavior opt-in and never use it to bypass user, site, legal, or account boundaries
- never let untrusted page text request worker escalation directly

Candidate worker tools:

```txt
browserWorker.open
browserWorker.fetchRendered
browserWorker.extractText
browserWorker.extractLinks
browserWorker.screenshot
browserWorker.evalReadOnly
browserWorker.locateElement
browserWorker.replayCheck
browserWorker.close
```

Mutating worker actions, if added, require the same action preview and verification receipt rules as active browser/OS actions.

## Activation Boundaries

Clickthrough may observe local signals continuously, but richer context leaves the local bridge only after an explicit activation boundary:

- hotkey invocation
- push-to-talk
- selected text
- pointer buddy grab
- direct click on a CT hint
- accepted proactive chip
- approved background-agent start

Passive cursor, hover, focus, dwell, and local page/app signals are used for placement and scoring. They are not consent to upload screenshots, microphone input, private page text, or OS context.

Every capture event must be visible to the user. The renderer should show whether CT is listening, reading the page, capturing a screenshot crop, using accessibility metadata, or running a background task.

## OS Companion Pipeline

OS-level screen context flows through a privacy and policy pipeline:

```txt
ScreenCaptureBroker
  -> LocalRedactor
  -> SensitivityClassifier
  -> RegionSelector
  -> PolicyGate
  -> OsContextPacket
```

Rules:

- Capture locally by default.
- Prefer active-window crops over full-screen frames.
- Prefer accessibility tree/window metadata before pixels.
- Redact credentials, payment data, private messages, notifications, auth codes, and secure fields.
- Do not retain screenshots by default; store ephemeral hashes and structured summaries.
- Treat on-screen instructions as untrusted content, not user permission.
- Suppress proactive model calls on sensitive screens until user engagement.

## Session Interface

```ts
type ClickthroughSession = {
  streamInput(input: HarnessSessionInput): Promise<void>;
  events(): AsyncIterable<HarnessEvent>;
  interrupt(): void;
  close(): void;
};
```

The first implementation can run in-process. Transport adapters can come later:

- extension port
- stdio/NDJSON subprocess
- SSE
- WebSocket

The event schema stays the same.

## Tool Registry

Tools are small and typed. The model sees schemas. The harness executes only registered tools.

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
screen.observe
screen.captureCrop
screen.locate
screen.redact
```

Optional tools:

```txt
memory.read
memory.write
mcp.listTools
mcp.callTool
delegate.specialist
```

Approval-gated tools:

```txt
dom.click
dom.fill
dom.submit
external.send
credential.create
permission.change
purchase.prepare
delete.prepare
computer.focusApp
computer.clickTarget
computer.typeText
computer.hotkey
computer.drag
computer.scroll
clipboard.writeApproved
file.applyApprovedBatch
terminal.runApprovedSandboxed
```

Blocked raw tools:

```txt
shell.run
page.eval
unscoped.network
unverified.mutation
raw.coordinateControl
```

## Permission Tiers

```txt
T0 Observe Local       local metadata, no model upload
T1 Explain             redacted screen context, no action
T2 Prepare             drafts and plans, user applies
T3 Assisted Action     approved click/type/scroll in visible session
T4 Scoped Automation   bounded app/domain/time/action budget
T5 High-Risk Approval  send/delete/buy/permissions/credentials
T6 Hand-Off Only       CAPTCHA, final transfer, password/security finalization
```

Every tool declares its required tier. The policy engine may downgrade, deny, or request approval.

## Tool Result Shape

MI can ingest text summaries, but Clickthrough tool execution must produce structured results first.

```ts
type ToolResult<T = unknown> = {
  callId: string;
  toolName: string;
  status: "success" | "denied" | "failed" | "timeout";
  output?: T;
  summaryForModel: string;
  evidence?: string[];
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
};
```

The model gets compact summaries. The renderer gets structured data.

## Proactive Insight Engine

The proactive layer should run before expensive model/tool calls.

Inputs:

- selected text
- cursor position
- hovered element and dwell time
- focused control
- visible text summary
- page type
- local sensitivity hints
- affordance map

Outputs:

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

Proactive insights render as quiet chips or CT buddy states. They do not open panels or run external tools until the user engages.

## UI Generation

The harness emits:

```txt
surface plan
data model
primitive tree
safety summary
```

The renderer validates:

- primitive type exists
- props are safe
- actions use allowed ids
- no raw HTML/CSS/script
- required trust marker exists
- viewport placement is safe

If validation fails, the harness should repair once, then fall back to deterministic safe UI.

## Dynamic Surface Policy

Default to the smallest surface that solves the problem:

- `inline_prompt`: immediate invocation near point of intent.
- `anchored_popover`: local explanation, reply, small verification, or next-step suggestion.
- `spotlight`: claim or selected text needs focus.
- `side_panel`: evidence-heavy verification, long source trails, or multi-step output.
- `fullscreen_workbench`: rare complex visual explanation.

Fixed top-right panels are fallback only.

For OS companion mode, add:

- `pointer_chip`: tiny CT mark beside pointer or anchor.
- `screen_annotation`: boxes/arrows/labels over screenshot regions.
- `action_preview`: before/after target crop and proposed action.
- `permission_gate`: tier badge, risks, allow/deny controls.
- `workbench`: larger space for multi-app or multi-step tasks.

## Delegation

Borrow `mi`'s delegation idea, but bound it:

- delegate only read-only specialist analysis
- provide a small prompt and explicit budget
- return structured output
- parent session remains responsible for safety and final UI validation

## Goal/Check Loops

Borrow `mi`'s `goal` concept for verification:

```txt
goal: produce valid, useful generated UI
check: primitive validation + viewport fit + required trust boundary
```

If the check fails, repair or fallback. Do not render unsafe UI.

## Source Of Truth

Active OpenSpec change:

```txt
openspec/changes/dynamic-mouse-buddy-proactive-harness
```
