# Clickthrough Stack Decision

## Current Stack Direction

Clickthrough is a lightweight cross-platform OS pointer companion built with:

- Wails desktop shell
- Go native control plane
- React overlay UI
- TypeScript
- Tailwind plus CSS variables
- full MI harness port as the runtime spine
- Obscura-style isolated browser workers for agent browsing/replay
- Clickthrough primitive schema
- AG-UI-style event streaming
- browser/page perception tools
- OS/screen perception adapters
- provider-neutral web search/fetch tools

No browser extension is required for the product shell. Ship as a Wails app: Go owns tray/global hotkeys/overlay windows/screen and OS adapters/process supervision, while TypeScript owns MI/runtime/UI logic. Browser integration is an optional connector/context provider.

If browser-worker isolation is needed early, run Obscura/CDP as a sidecar chamber rather than replacing the user's active browser.

## Shipping Shell

Locked decision:

```txt
Wails / Go desktop shell
  -> tray
  -> global hotkeys / push-to-talk
  -> transparent overlay windows
  -> screen capture and OS adapters
  -> policy broker and execution chamber supervision
  -> context.Context cancellation, deadlines, budgets, panic stop
  -> TypeScript MI runtime
  -> React primitive renderer
  -> Obscura browser-worker chamber
```

Why:

- lighter than Electron
- cross-platform for Linux and Windows
- Go is pragmatic for native process supervision, cancellation, and OS adapters
- React/TypeScript keeps the generated UI and MI port close to existing frontend code
- Obscura remains isolated browser work, not the main app shell

## Product Shape

The visible product is the **AI pointer companion**.

It starts as a small CT presence near the user's point of intent:

- cursor
- selection
- hovered element
- focused control
- active page region
- active app or screenshot region

It can show quiet proactive insight chips, then expand into the smallest useful generated interface:

- inline prompt
- anchored popover
- spotlight
- side panel
- fullscreen workbench

Fixed top-right panels are fallback only.

## OS Companion Layer

The OS layer adds:

- active app/window metadata
- screenshot capture and region crops
- accessibility tree or OCR summaries where available
- pointer velocity and dwell tracking
- screen-region salience scoring
- action target previews
- before/after verification screenshots
- global pause/cancel/panic controls

The model never receives raw continuous screen capture by default. Screen context flows through:

```txt
ScreenCaptureBroker
  -> local redactor
  -> sensitivity classifier
  -> crop/context selector
  -> policy gate
  -> model packet
```

## Harness Shape

Port MI as the harness:

```txt
messages + tools
  -> model stream
  -> tool calls
  -> execute registered tools
  -> append structured results
  -> repeat until final UI/result
```

Clickthrough keeps MI's loop and patches execution for browser/OS safety and user trust:

- current frontend harness is discarded as the runtime base
- useful frontend pieces are salvaged as tools, context providers, renderer contracts, and validation ideas
- raw shell, browser automation, and OS actions run only through execution chambers
- no arbitrary DOM mutation tool exposed to the model
- no model-generated HTML/CSS/JS rendered directly
- strict turn, tool, time, and cost budgets
- structured tool results
- typed state/tool/UI/result events
- validation before render
- deterministic fallback when validation fails
- approval and target verification before impactful actions

## Execution Chambers

MI requests tools. The policy broker routes allowed requests into scoped chambers:

- `page`: active-tab perception and approved DOM actions.
- `screen`: screenshot crop, OCR, accessibility, app/window metadata.
- `browser-worker`: Obscura/CDP/Playwright isolated browser work.
- `terminal`: approved sandboxed commands only.
- `os`: verified computer-use actions with visible session controls.
- `web`: search, fetch, source retrieval, profile lookup.
- `memory`: bounded session/project memory.

Each chamber declares permission tier, input schema, budgets, allowed domains/paths, redaction rules, approval requirements, and verification checks.

## Obscura Role

Obscura is the agent's browser worker chamber, not the user's live browser context.

Use it for:

- rendered page fetches
- JS-heavy source checks
- text/link extraction
- page screenshots for evidence
- read-only DOM evaluation
- replay checks before suggesting visible browser actions
- background web investigation

Do not use it to replace:

- active-tab page perception
- desktop overlay rendering
- user's logged-in live browser state
- approval-gated actions on the current page

## Tool Policy

Default tools:

- `page.observe`
- `page.scan`
- `page.highlight`
- `insight.score`
- `web.search`
- `web.fetch`
- `ui.plan`
- `ui.validate`
- `ui.fitCheck`
- `screen.observe`
- `screen.captureCrop`
- `screen.locate`
- `screen.redact`
- `browserWorker.fetchRendered`
- `browserWorker.extractText`
- `browserWorker.extractLinks`
- `browserWorker.screenshot`
- `browserWorker.evalReadOnly`
- `browserWorker.replayCheck`

Optional tools:

- `memory.read`
- `memory.write`
- `mcp.listTools`
- `mcp.callTool`
- bounded specialist delegation

Approval-gated browser tools:

- `dom.click`
- `dom.fill`
- `dom.submit`
- `external.send`
- `credential.create`
- `permission.change`
- `purchase.prepare`
- `delete.prepare`

Approval-gated OS tools:

- `computer.focusApp`
- `computer.clickTarget`
- `computer.typeText`
- `computer.hotkey`
- `computer.drag`
- `computer.scroll`
- `clipboard.writeApproved`
- `file.applyApprovedBatch`
- `terminal.runApprovedSandboxed`
- `browserWorker.mutateApproved`

Blocked raw tools:

- shell/bash
- arbitrary JavaScript eval
- unscoped network access
- unverified DOM mutation
- raw coordinate control without verified target

## UI Protocol

Use AG-UI-style events for the runtime stream:

- `state.changed`
- `tool.started`
- `tool.finished`
- `insight.suggested`
- `ui.patch`
- `approval.requested` later
- `result`

The event schema is Clickthrough-owned for now. AG-UI is the reference pattern for progressive, visible agent state.

## UI Schema

The agent emits Clickthrough primitives:

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

The renderer owns:

- component mapping
- accessibility
- responsive fit
- host style adaptation
- trust markers
- action wiring
- validation failure UI

The model never emits arbitrary HTML, JSX, CSS, scripts, or one-off components.

## Page Perception

Browser/page tools are first-class. The scanner should capture:

- URL and title
- selected text
- visible text summary
- cursor position
- hovered element and dwell time
- focused element
- nearby affordances
- stable element ids
- bounds
- host theme
- page type
- sensitivity hints

Desktop/screen providers should capture:

- active app and window title
- window/display bounds
- pointer position and velocity
- selected text where available
- focused UI element where available
- screenshot frame or cropped target image
- accessibility/OCR/vision region summaries
- recent action receipts

The model receives compact packets, not raw DOM dumps.

## External Protocols

- **AG-UI**: reference protocol for streaming runtime state into UI.
- **MCP Apps**: future tool discovery layer for search, fetch, profile lookup, document tools, and external capabilities.
- **A2UI**: possible schema vocabulary influence only.
- **CopilotKit**: optional React wiring helper only if it does not make the product look like chat.

## Build Priority

1. Replace fixed panel behavior with pointer-native buddy and anchored prompt.
2. Add signal capture: cursor, hover, focus, selection, screenshot region.
3. Port MI fully as the agent runtime loop.
4. Convert useful frontend harness pieces into MI tools/context providers/render contracts.
5. Add Obscura-style browser-worker chamber.
6. Add proactive local insight scoring.
7. Add screenshot broker, redaction, and sensitivity policy.
8. Render generated UI from validated primitive trees.
9. Escalate surfaces only when content/risk requires more space.
10. Add approval-gated CUA actions only after target verification and visible user confirmation.
