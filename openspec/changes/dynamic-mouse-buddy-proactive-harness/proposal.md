## Why

Clickthrough currently has the right product thesis but the extension path still behaves like a fixed top-right frame. The computer should feel like it gained a small intelligent presence at the user's point of intent: cursor, selection, hover, focused field, page region, app window, or screenshot crop. That presence should be able to notice useful opportunities, suggest lightweight insights, and expand only when the task deserves a larger generated UI.

Shipping decision: Clickthrough ships as a lightweight Wails/Go desktop companion, not as a browser extension. Browser integration is an optional context provider. Go owns native shell, tray, global hotkeys, overlay windows, OS adapters, process supervision, cancellation, budgets, and panic stop. TypeScript owns MI runtime and generated UI logic.

The repo also contains `mi/`, a compact and effective autonomous harness. `mi` proves that an agent loop can stay simple: stream model output, execute typed tools, feed results back, delegate when useful, and iterate until done. Clickthrough should port MI fully as the runtime spine, then patch its powerful execution layer with browser/OS policy gates. The current frontend harness should be retired as the orchestrator and mined only for useful page perception, context packet, primitive renderer, and validation ideas.

Recent inspiration points in the same direction:

- Google DeepMind's AI Pointer argues that the pointer should understand what it is pointing at, preserve user flow, make "this" and "that" meaningful, and turn pixels into actionable entities.
- Clicky shows a Mac-native version of the same idea: an AI buddy beside the cursor that sees the active screen, answers by voice, teaches users through the current app, and can spin up background agents.
- A separate Chrome product also called Clicky gives browser-specific constraints worth borrowing without conflating the two products: push-to-talk, point at the actual DOM element, screenshot plus structure, session-only memory, and no background scraping.
- Obscura provides the right browser-worker inspiration: agent-side rendered browsing, CDP/Playwright compatibility, JS execution, screenshots/extraction, and worker isolation. It should power an isolated browser chamber, not replace the user's active browser context.

## What Changes

- Replace the fixed extension panel mental model with an AI pointer / dynamic mouse buddy system.
- Replace the extension-as-container plan with a Wails desktop shell.
- Add proactive, low-noise insight generation driven by page perception, hover/selection/focus/cursor signals, and intent likelihood.
- Add an OS companion horizon: active app/window metadata, screenshot crops, accessibility/OCR regions, screen annotations, and CUA-style actions through approval-gated capabilities.
- Port MI fully as the agent loop:
  - streaming model/tool loop
  - hot-loadable or registry-based tools
  - tool result append and repeated replanning
  - skills/prompt modules
  - delegation
  - goal/check loops
- Patch MI execution with Clickthrough policy:
  - typed tool results
  - streaming UI/state events
  - execution chambers for page, screen, browser-worker, terminal, OS, web, and memory
  - permission tiers and approval boundaries
  - primitive UI validation
- Preserve Clickthrough-specific requirements:
  - no arbitrary HTML
  - validated primitive trees
  - host-adapted overlays
  - visible trust boundary
  - AG-UI-style streaming events
  - page perception packets and anchor geometry
  - screen/app context packets and screenshot privacy gates
- Update the existing `core-demo-execution-plan` direction with a more intelligent interaction model: proactive surfaces first, explicit user intent second, large panels only when needed.

## Capabilities

### Modified Capabilities

- `runtime-overlay-renderer`: Render cursor-native buddy, insight chips, anchored popovers, and expansion transitions instead of always using a fixed panel.
- `page-perception-bridge`: Track cursor, hover, selection, focus, viewport, affordance salience, and page changes as ongoing context signals.
- `agent-harness-stream`: Adopt a `mi`-style iterative agent loop while retaining typed browser/page tools, approval policy, and generated UI event contracts.
- `browser-worker-chamber`: Use Obscura-style isolated browser workers for rendered fetch, extraction, screenshots, and replay checks.

## Non-Goals

- Do not turn Clickthrough into a terminal coding agent.
- Do not expose unrestricted shell/page/screen mutation tools.
- Do not build a noisy Clippy-like assistant that interrupts constantly.
- Do not replace the primitive renderer with model-generated React, HTML, or CSS.
- Do not require a backend server or browser extension before the desktop companion path works, but allow an Obscura/CDP sidecar when isolated browser-worker execution is needed.
- Do not treat screenshots as permission to act; CUA actions must be scoped, approved where needed, and verified.
- Do not use Obscura as a replacement for active-tab context or silent access to logged-in user state.

## Impact

- Desktop shell: new Wails/Go app for tray, hotkeys, overlay windows, OS adapters, process supervision, cancellation, budgets, and panic stop.
- Frontend extension shell: `frontend/src/extension/content.tsx`, `content.css` are reference/salvage material only.
- Page perception: `frontend/src/browser/pageBridge.ts`, `domScanner.ts`, new cursor/hover/focus tracking.
- Harness runtime: ported `mi/` loop and tool dispatch as the new runtime spine; current `frontend/src/harness/runtime/*` is reference/salvage material only.
- Browser worker: Obscura/CDP/Playwright adapter for isolated browser investigation and replay.
- Renderer: `frontend/src/renderer/OverlayPositioner.tsx`, stream application, primitive rendering.
- OpenSpec: updates to `runtime-overlay-renderer`, `page-perception-bridge`, and `agent-harness-stream`.
- `mi/`: treated as the runtime to port fully. Its unrestricted execution is patched after porting through policy-gated execution chambers.
