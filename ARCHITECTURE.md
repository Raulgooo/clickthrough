# Clickthrough Architecture

## System Map

```txt
Wails / Go Desktop Shell
  |
  | tray / hotkey / overlay windows / OS adapters
  v
Browser page, desktop app, or screen region
  |
  | cursor / selection / hover / focus / viewport / screenshot
  v
Dynamic Mouse Buddy
  |
  | user intent or accepted proactive insight
  v
Context Packet
  |
  v
MI Runtime Spine
  |
  | full MI model/tool loop
  | execution chambers + approval-gated capabilities
  | validation goal checks
  v
Generated Surface Plan
  |
  v
Validated Primitive Tree
  |
  v
Host-adapted Overlay / OS Companion Renderer
```

## Major Components

### 1. Wails / Go Desktop Shell

The lightweight cross-platform product container.

Responsibilities:

- system tray and app lifecycle
- global hotkeys and push-to-talk
- transparent overlay windows
- screen capture adapters
- OS action adapters
- process supervision for MI and Obscura workers
- policy broker host
- cancellation, deadlines, budgets, and panic stop through Go `context.Context`

Browser connectors are optional context providers. They are not the product shell.

### 2. Dynamic Mouse Buddy

The interaction layer that lives near the user's point of intent.

Responsibilities:

- track cursor, selection, hover, focus, and active page region
- display quiet CT presence
- show proactive insight chips when confidence is high
- open inline prompt near the anchor
- expand into generated UI only when useful
- avoid blocking page content
- preserve page scroll and interaction

### 3. Page And Screen Perception

Builds compact browser and OS context.

Responsibilities:

- visible text summary
- selected text
- cursor position
- hovered element and dwell time
- focused element
- nearby elements and bounds
- page affordance summaries
- host theme
- sensitivity hints
- stable anchor ids
- active app/window metadata
- screenshot crops
- accessibility tree or OCR summaries
- before/after action evidence

It must not send raw DOM dumps to the model.

It must not send raw continuous screenshots to the model.

### 4. MI Runtime Spine

The ported MI loop adapted for browser/OS UI.

Responsibilities:

- receive intent or proactive insight
- expose MI tool schemas to the model
- accumulate requested tool calls
- route tool calls through the policy broker
- execute registered tools inside scoped execution chambers
- feed structured results back into the loop
- stream state/tool/UI events
- choose dynamic surface mode
- validate generated UI
- enforce capability policy
- fall back safely

The current frontend harness is not the orchestrator. It is mined for useful pieces: page perception, context packet shape, renderer contracts, primitive validation, and host adaptation.

### 5. Execution Chambers And Capability Registry

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
```

Tools are permissioned by the harness. The model cannot create new capabilities at runtime.

Obscura-backed browser-worker capabilities are isolated from the user's live browser:

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

Use browser workers for agent browsing, source verification, rendered fetch, extraction, and replay. Do not use them as a replacement for active-tab context or as silent access to logged-in user state.

OS companion capabilities include:

```txt
screen.observe
screen.captureCrop
screen.locate
screen.redact
computer.focusApp
computer.clickTarget
computer.typeText
computer.hotkey
computer.drag
computer.scroll
```

Mutation-capable tools require verified targets, visible approval where needed, and post-action verification.

### 6. Primitive Renderer

Renders validated `ClickthroughNode` trees.

Responsibilities:

- map primitive names to React components
- wire allowed action ids
- manage local UI state
- apply host theme tokens
- handle validation errors
- keep CT trust marker visible
- preserve accessibility and viewport fit

## Data Flow

```txt
1. Wails shell receives global hotkey, pointer event, or user interaction.
2. Page/screen perception updates local signals.
3. Insight scorer may produce a quiet proactive chip.
4. User invokes CT or accepts the chip.
5. MI runtime starts the model/tool loop.
6. Model requests tools.
7. Policy broker routes allowed calls into page, screen, browser-worker, terminal, OS, web, or memory chambers.
8. Tools return structured summaries.
9. MI loops until it has a surface plan and UI tree.
10. UI is validated and fit-checked.
11. React renderer expands the desktop overlay buddy into the chosen surface.
```

## Safety Boundary

Browser mutation is not raw model power. It is available only through scoped tools with:

- explicit approval
- visible risk summary
- deterministic target checks
- result verification
- easy cancellation

## Current Implementation Bias

Prefer porting MI into the repo as the actual runtime first and hosting it from the Wails desktop shell. Add browser connectors only when needed.

Do not keep the current frontend harness as the orchestration layer. Use it only as a source of tools and renderer/context lessons.
