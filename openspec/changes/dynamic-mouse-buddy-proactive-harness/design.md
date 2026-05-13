## Context

Current frontend reality:

- `src/extension/content.tsx` always opens a fixed `right-4 top-4 w-[440px]` panel.
- `src/browser/pageBridge.ts` builds page context but does not include cursor, hovered element, or focus history.
- `src/browser/domScanner.ts` already extracts visible interactive elements, stable `data-ct-element-id` values, bounds, page type, selected text, and structured page context.
- `src/types/ui.ts` already has a strong anchor contract: `selection`, `focused_element`, `hovered_element`, `cursor`, `page_region`, `viewport`, and `none`.
- `src/harness/runtime/session.ts` has a typed session/event stream but currently uses a linear classify -> skeleton -> tools -> generate flow and maps intent to overlay mode with a fixed switch.
- `src/renderer/OverlayPositioner.tsx` can position inline prompts and anchored popovers, but the extension shell bypasses it.

Decision: the current frontend harness is not the implementation substrate. It is salvage material. Keep useful context packets, page scanners, primitive contracts, overlay positioning ideas, host-theme adaptation, and validation helpers. Discard the one-shot orchestration path.

Shipping decision:

- Ship as a lightweight Wails desktop app, not a browser extension.
- Go owns tray, global hotkeys, push-to-talk, transparent overlay windows, OS adapters, process supervision, cancellation, budgets, and panic stop.
- TypeScript owns the MI runtime, tool schemas, prompt/skill modules, and React generated UI.
- Browser integration is an optional connector/context provider, not the product container.

`mi/` reality:

- `mi/index.mjs` is a very small autonomous harness: stream chat completions, accumulate tool calls, execute tools, append tool results, repeat until no tools.
- `mi/tools/*.mjs` show useful harness primitives: hot-loaded tools, skill loading, delegation, and a goal loop with a verification check.
- `mi` should be ported fully as the runtime spine.
- Its unsafe execution surface should be patched after the port through Clickthrough execution chambers, not avoided by rebuilding a weaker frontend loop.

## External Research Summary

The strongest current options are:

- **AG-UI**: best fit for Clickthrough's visible runtime state stream. It maps naturally to state changes, tool progress, skeletons, partial UI patches, and final generated primitive trees.
- **MCP Apps / MCP tools**: useful for discoverable external tools such as search, fetch, profile lookup, and possibly browser/page context services. It should be a tool discovery layer, not the core UI runtime.
- **CopilotKit**: useful only if it accelerates React-side wiring, human approval, and agent state. It is risky if it pulls the product into chat/sidebar framing.
- **LangGraph / similar graph runtimes**: strong for durable, interruptible, human-in-the-loop workflows. Useful later if Clickthrough needs persistence, retries, and explicit graph nodes. Too heavy for the hackathon path unless the current harness stalls.
- **OpenAI Agents SDK / Responses-style tool calling**: strong hosted/model loop and tool abstractions. Useful as a model provider path, but Clickthrough still needs its own browser-native event/schema/policy layer.
- **A2UI**: useful as vocabulary and possible schema influence for agent-rendered interfaces, but should not block the internal primitive schema.
- **Google DeepMind AI Pointer**: validates the pointer as the context carrier. Its useful principles for Clickthrough are maintain flow, show-and-tell, make "this" and "that" meaningful, and turn pixels into actionable entities.
- **Clicky for Mac**: validates the companion form factor: cursor-adjacent buddy, screen awareness, voice input, walkthrough guidance, teaching inside the current app, and background agents.
- **Clicky-style browser assistant patterns**: a separate Chrome product using the Clicky name adds concrete privacy and targeting patterns worth borrowing without conflating it with Clicky for Mac: push-to-talk, point at the actual element, combine screenshot with structure, session-only memory, and avoid background scraping.
- **Obscura**: validates the agent-side browser-worker chamber. It is a lightweight Rust headless browser with V8 JavaScript execution, Chrome DevTools Protocol support, Puppeteer/Playwright compatibility, input dispatch, cookies/network handling, screenshots/extraction, and optional stealth/tracker blocking. For Clickthrough, Obscura is the isolated browser execution chamber for rendered fetch, source verification, extraction, screenshots, and replay checks. It is not a replacement for the user's active browser context.

Absolute best implementation for this repo: port MI fully, patch its execution through Clickthrough policy gates, salvage useful frontend harness ideas as tools/context/render contracts, and add Obscura as the isolated browser-worker chamber.

## Architecture

### 1. Wails Desktop Shell And AI Pointer Interaction Layer

Add a small persistent buddy controller inside the Wails desktop shell. The browser connector can supply context, but the desktop shell owns the pointer companion and overlay windows.

States:

```txt
idle
  -> aware        page has salient hover/focus/selection/cursor context
  -> hinting      CT has a low-confidence proactive insight chip
  -> prompt       user invokes or clicks buddy
  -> thinking     harness running, skeleton/agent state visible
  -> expanded     generated UI rendered in chosen mode
  -> minimized    compact CT mark remains anchored
```

The buddy should not constantly chase the cursor. It follows intent anchors, not raw pixels. It should:

- sample cursor position cheaply
- snap to selected text, focused fields, hovered meaningful affordances, or page regions
- avoid text occlusion and viewport edges
- keep pointer events passive except on the CT surface
- expose a compact CT mark, status dot, and one-line insight when appropriate
- support push-to-talk, hotkey, pointer grab, selection, click, and accepted insight as explicit activation boundaries
- show visible listening, capture, thinking, and action-preview states near the point of intent

OS companion extension points:

- active app/window metadata
- screenshot crop around pointer or selected region
- accessibility tree/OCR region summary
- pointer velocity and dwell
- screen annotation layer for boxes, arrows, labels, and target confidence
- capture indicator and redaction status
- panic/cancel control for background sessions and computer-use actions

Wails/Go responsibilities:

- tray lifecycle
- global hotkey and push-to-talk registration
- transparent overlay windows
- native screen capture adapters
- accessibility/OCR/provider bridges where available
- process supervision for MI and Obscura workers
- `context.Context` cancellation, deadlines, budgets, and panic stop

### 2. Proactive Insight Engine

Add a local signal scorer before invoking expensive model/tool loops.

Inputs:

- selected text
- hovered element and dwell time
- focused input
- visible claim-like text
- page type
- forms/actions available
- user prompt history in session
- risk/sensitivity hints

Outputs:

```ts
type ProactiveInsight = {
  id: string;
  confidence: number;
  kind: "verify" | "explain" | "summarize" | "respond" | "navigate" | "risk";
  anchor: UIAnchorIntent;
  title: string;
  preview: string;
  suggestedPrompt: string;
  urgency: "quiet" | "normal" | "important";
};
```

Only show proactive UI when confidence and timing are good. Quiet insights should be a small chip or pulsing CT mark, not a panel. User action promotes an insight into a normal harness run.

### 3. MI-Port Browser/OS Harness Loop

Replace the one-pass session loop with MI's bounded iterative loop:

```txt
context packet + intent/insight
  -> MI model/planner step
  -> MI tool calls?
      -> policy broker
      -> execution chamber
      -> append structured results
      -> emit AG-UI events
      -> loop
  -> generated surface plan + primitive tree
  -> validate/repair/check
  -> emit final UI
```

Port from MI:

- simple loop shape
- tool schemas visible to the model
- tools return compact results for the next iteration
- skill/prompt modules for specialist behavior
- delegation for bounded specialist tasks
- goal/check pattern for verification
- tool call accumulation and repeated execution
- conversation append semantics

Adapt for Clickthrough:

- tool results are structured, not raw strings
- every state change emits `HarnessEvent`
- every UI output is validated primitive schema
- browser and OS mutation tools are capability-scoped, approval-gated, and verified
- model never directly controls DOM or raw CSS
- model never receives raw shell, raw coordinate control, or arbitrary OS mutation
- loops have strict budgets
- proactive insights can be generated deterministically before model calls
- immediate guided help and longer background agent work are separate session modes
- background sessions require objective, budget, allowed tools, progress events, cancel control, and final review

Execution chamber routing:

```txt
MI tool request
  -> PolicyBroker
  -> CapabilityResolver
  -> page | screen | browser-worker | terminal | os | web | memory
  -> StructuredResult
  -> Goal/verification check
```

### 3A. Obscura Browser Worker Chamber

Obscura fits as the agent's isolated browser worker. It should not replace the active page bridge.

Active browser/page bridge answers:

```txt
What is the user seeing and pointing at?
```

Obscura browser workers answer:

```txt
What can the agent investigate, render, extract, or replay without disturbing the user?
```

Tools:

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

Rules:

- isolate cookies/storage/proxy/user agent per worker session
- apply domain, navigation, action, wall-clock, and data budgets
- default to read-only operations
- use replay checks before suggesting active-browser or OS actions
- do not import logged-in user state unless the user explicitly approves a scoped export
- keep stealth/anti-detect behavior opt-in and policy-gated

### 4. Dynamic Surface Planner

Overlay mode should be chosen from page geometry and task needs, not only intent family.

Policy:

- `inline_prompt`: initial user invocation near cursor/selection/focus.
- `anchored_popover`: quick verify/explain/respond over a local page target.
- `spotlight`: selected claim or paragraph needs focus while preserving page context.
- `side_panel`: evidence-heavy verification or multi-source analysis.
- `fullscreen_workbench`: rare visual explanation or complex comparison.
- `native_insertion`: approval-gated insertion near host controls after target verification and fit checks.

Expansion should preserve origin:

```txt
CT mark at cursor
  -> prompt pill
  -> skeleton popover
  -> final surface
  -> optional side panel/workbench if content exceeds local capacity
```

### 5. OS Companion And CUA Strategy

Computer-use-style perception is a capability layer, not raw control authority.

```txt
ScreenCaptureBroker
  -> LocalRedactor
  -> SensitivityClassifier
  -> RegionSelector
  -> PolicyGate
  -> OsContextPacket
```

CUA tools should use verified targets:

```txt
screen.observe
screen.captureCrop
screen.locate
computer.focusApp
computer.clickTarget
computer.typeText
computer.hotkey
computer.drag
computer.scroll
computer.verifyResult
```

The model may propose an action. The harness owns target verification, approval, execution, and post-action verification.

Activation boundary:

```txt
passive local observation
  -> user hotkey / push-to-talk / pointer grab / click / selection / accepted chip
  -> scoped page or screen packet
  -> model-visible context only for that run
```

Screen capture rules:

- prefer accessibility or DOM structure before screenshots
- prefer target crops before full-screen frames
- show capture state whenever microphone, screenshot, OCR, accessibility, or page context is gathered
- do not retain screenshots by default
- treat screenshots as perception evidence, not permission to act

Permission tiers:

```txt
T0 Observe Local       local screen/window metadata only
T1 Explain             redacted screenshot/model allowed, no action
T2 Prepare             drafts, values, steps; user applies manually
T3 Assisted Action     click/type/scroll with visible session controls
T4 Scoped Automation   bounded goal, app/domain, action set, time/action budget
T5 High-Risk Approval  send/delete/buy/permissions/credentials; confirm at point of risk
T6 Hand-Off Only       CAPTCHA, final financial transfer, password/security finalization
```

### 6. Safety And Trust

Proactive does not mean autonomous action.

- No raw page or OS mutation.
- No posting, deleting, buying, credential creation, permission changes, or form submission without explicit approval, verified targets, and result verification.
- Proactive chips must disclose uncertainty when suggesting verification.
- Sensitive contexts should default to private/local language and avoid model calls until user confirms.
- CT mark remains visible on every generated surface.

## Decision

Port MI as the product substrate and patch its execution layer.

Why this is best:

- MI is better at the agentic loop, tool extensibility, skills, delegation, and goal/check verification.
- The frontend harness is weak as orchestration, but useful as source material for browser context, primitive trees, host adaptation, overlay placement, and validation.
- A full MI port avoids maintaining two harness concepts.
- Obscura gives the agent a real browser worker without confusing that worker with the user's live browser.

Port MI wholesale as runtime, then patch execution. Do not preserve the current frontend harness as a competing runtime.

## Risks

- Proactive UI can become annoying. Mitigation: confidence threshold, dwell timing, quiet mode, explicit dismiss, per-site/app memory later.
- Cursor following can feel jittery. Mitigation: snap points, throttle, animation, avoid constant chase.
- Screenshots can expose private data. Mitigation: local redaction, crop-first capture, sensitivity suppression, explicit capture indicators.
- CUA can act on the wrong target. Mitigation: verified targets, action previews, approval gates, post-action verification, panic stop.
- Harness loops can be slow. Mitigation: deterministic local insight scorer, small model for surface plan, bounded tools, replay fallback.
- Model-generated UI may break layout. Mitigation: primitive validation, viewport fit check, deterministic fallback surface.
- Two harness concepts can diverge. Mitigation: MI is the single runtime spine; frontend harness code is either converted into tools/adapters or removed.
- Browser-worker power can blur into user-state automation. Mitigation: Obscura is isolated by default and cannot access active user state without explicit scoped approval.
