## 1. OpenSpec And Contracts

- [ ] 1.1 Add cursor-native and proactive insight requirements to runtime overlay, page perception, and harness stream specs.
- [ ] 1.2 Define `ProactiveInsight`, cursor/hover/focus context, buddy state, and surface expansion contracts.
- [ ] 1.3 Define MI as the ported runtime spine and specify the Clickthrough wrappers: typed harness events, structured tool results, policy broker, and primitive UI validation.
- [ ] 1.4 Define `OsContextPacket`, screenshot crop metadata, screen regions, and active app/window context.
- [ ] 1.5 Define permission tiers T0-T6 and map tools/actions to required tiers.
- [ ] 1.6 Lock Wails/Go as the desktop shipping shell and define the TS MI runtime boundary.
- [ ] 1.7 Define browser integration as an optional connector/context provider, not the product container.

## 1A. Wails Desktop Shell

- [ ] 1A.1 Scaffold Wails app with React/TypeScript overlay UI.
- [ ] 1A.2 Add tray lifecycle and app settings entry point.
- [ ] 1A.3 Add global hotkey and push-to-talk registration.
- [ ] 1A.4 Add transparent overlay window support for pointer buddy and generated surfaces.
- [ ] 1A.5 Add Go-side process supervision for MI runtime and Obscura browser-worker chamber.
- [ ] 1A.6 Add `context.Context` cancellation/deadline/budget plumbing for tool runs and panic stop.
- [ ] 1A.7 Expose typed Go bindings for screen, OS, browser-worker, terminal, and policy-broker calls.

## 2. Page Perception Signals

- [ ] 2.1 Track cursor position with throttling and viewport edge metadata.
- [ ] 2.2 Track hovered meaningful element with dwell time and stable element id.
- [ ] 2.3 Track focused input/control and recent selection changes.
- [ ] 2.4 Add salience scoring for claim-like text, dense paragraphs, reply boxes, forms, and risky controls.
- [ ] 2.5 Include these signals in `PageContextPacket` without sending raw DOM.

## 2A. OS Pointer Context

- [ ] 2A.1 Add a `ContextProvider` abstraction with browser and OS provider shapes.
- [ ] 2A.2 Define screenshot broker API for active-window capture, crop capture, redaction, and sensitivity classification.
- [ ] 2A.3 Define screen region extraction output for accessibility/OCR/vision regions.
- [ ] 2A.4 Define target confidence and before/after screenshot evidence for CUA verification.

## 3. Dynamic Mouse Buddy Shell

- [ ] 3.1 Implement cursor/selection-aware CT buddy in the Wails desktop overlay.
- [ ] 3.2 Replace fixed open panel path with inline prompt and anchored popover as the default invocation surfaces.
- [ ] 3.3 Add expansion transitions from buddy -> prompt -> skeleton -> generated UI.
- [ ] 3.4 Add viewport collision handling and non-occlusion rules.
- [ ] 3.5 Keep a clear CT trust mark in every buddy and expanded state.

## 4. Proactive Insight Engine

- [ ] 4.1 Implement deterministic local insight scoring for selected claims, dense text, reply contexts, and forms.
- [ ] 4.2 Show only quiet proactive chips above a confidence threshold and after dwell/selection stability.
- [ ] 4.3 Convert a clicked proactive chip into a normal harness run with a suggested prompt.
- [ ] 4.4 Add dismiss/minimize behavior and session-level suppression.
- [ ] 4.5 Add safe handling for sensitive contexts.

## 5. Full MI Harness Port

- [ ] 5.1 Port MI's model stream -> tool calls -> tool execution -> result append -> repeat loop into the Clickthrough runtime.
- [ ] 5.2 Port MI's tool loading/dispatch shape and expose tools through a Clickthrough policy broker.
- [ ] 5.3 Port MI's skill/prompt module pattern for verify, understand, respond, page copilot, and OS companion surfaces.
- [ ] 5.4 Port MI's delegation pattern for bounded specialist/background work.
- [ ] 5.5 Port MI's goal/check verification pattern.
- [ ] 5.6 Retire the current `LocalHarnessSession` orchestration path; salvage only useful context packets, page tools, primitive contracts, renderer hooks, and validation helpers.
- [ ] 5.7 Define typed tool schemas for `page.observe`, `screen.observe`, `web.search`, `web.fetch`, `ui.validate`, `insight.score`, and `browserWorker.*`.
- [ ] 5.8 Keep tools structured and permissioned; do not expose raw shell, arbitrary DOM mutation, raw coordinate control, or unscoped network tools outside execution chambers.
- [ ] 5.9 Add goal/check-style validation: generated UI must pass primitive validation and viewport fit before final emit.

## 5A. Obscura Browser Worker Chamber

- [ ] 5A.1 Define `browserWorker.*` tool contracts for open, rendered fetch, text/link extraction, screenshot, read-only eval, locate element, replay check, and close.
- [ ] 5A.2 Add an Obscura/CDP adapter behind the policy broker; keep Playwright/Puppeteer compatibility as an adapter detail.
- [ ] 5A.3 Enforce per-worker domain, navigation, action, wall-clock, data, cookie/storage, and network budgets.
- [ ] 5A.4 Keep browser workers isolated from the user's active browser context by default.
- [ ] 5A.5 Require explicit scoped approval before importing logged-in user state, cookies, or active-page data into a worker.
- [ ] 5A.6 Use browser-worker replay checks to verify selectors/actions before proposing active browser or OS actions.
- [ ] 5A.7 Keep stealth/anti-detect behavior opt-in, policy-gated, and unavailable for bypassing user/account/site boundaries.

## 6. Renderer Integration

- [ ] 6.1 Make Wails overlay shell consume `GeneratedUI.surface.anchor` and `overlayMode`.
- [ ] 6.2 Route anchored modes through `renderer/OverlayPositioner` or a shared geometry utility.
- [ ] 6.3 Add side-panel escalation only when content size/risk/evidence need exceeds anchored capacity.
- [ ] 6.4 Apply host theme variables to buddy, prompt, popover, and panel states.
- [ ] 6.5 Add OS companion surface primitives/states: pointer chip, screen annotation, action preview, permission gate, action receipt, before/after verification.

## 6A. CUA Capability Broker

- [ ] 6A.1 Define approval-gated `computer.focusApp`, `computer.clickTarget`, `computer.typeText`, `computer.hotkey`, `computer.drag`, `computer.scroll`.
- [ ] 6A.2 Require verified target ids for all CUA actions; never expose raw coordinate clicking to the model.
- [ ] 6A.3 Add global pause/cancel/panic-stop semantics.
- [ ] 6A.4 Add action receipts and post-action verifier results to the event stream.

## 7. Verification

- [ ] 7.1 Add unit tests for insight scoring, overlay mode selection, and geometry fallback.
- [ ] 7.2 Add harness tests for MI tool loop, policy broker routing, budget stop, validation failure, and deterministic fallback.
- [ ] 7.3 Add browser checks for cursor invocation, selected-text invocation, hover insight, and panel escalation.
- [ ] 7.4 Verify no mutating browser action is reachable without the required execution chamber, approval tier, target verification, and receipt.
- [ ] 7.5 Add browser-worker tests for isolation, budget enforcement, read-only eval, replay checks, and no default access to active user state.
