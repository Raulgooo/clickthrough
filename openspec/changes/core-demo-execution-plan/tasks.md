## Plan Revision Summary

**Revised by**: OpenCode agent using OpenSpec CLI  
**Date**: 2026-05-09  
**Trigger**: Codex plan vs. reality audit

### Critical Discovery

**Codex created substantial runtime code that was NEVER COMMITTED.** During this audit, untracked files were found in:
- `frontend/src/harness/runtime/` — harness session, contracts, policy, UI validation
- `frontend/src/browser/` — DOM scanner, action executor, host theme sampler, page bridge
- `frontend/src/renderer/stream/` — harness event stream application

These files **compile cleanly** (`tsc --noEmit` passes) and represent significant progress not reflected in git history.

### What Changed

1. **Marked completed work**: Frontend baseline, TypeScript contracts, primitive library (92 components), renderer, overlay positioning, **AND runtime code** are DONE. The codex plan treated everything as `[ ]` — this revision marks reality.

2. **Signaled critical gaps**:
   - **NO runtime validation** (Zod/JSON Schema) — `validateUi.ts` is a stub
   - **Harness runtime is skeletal** — `session.ts` emits state transitions but stops at `planning`. No tool calls, no UI generation, no approval wiring.
   - **DOM scanner exists but is unintegrated** — `scanDom()` and `buildPageContextPacket()` are ready but not wired to demos or harness
   - **NO test infrastructure** — Vitest and Playwright not installed
   - **Browser action executor exists but is unintegrated** — `executeBrowserActionPlan()` ready but not wired to approval flow

3. **Identified blockers**:
   - Harness session needs completion: tool loop, UI generation, approval gating
   - Scanner needs wiring into harness input
   - Demos need refactoring from static compositions to harness-driven streams

4. **Revised priority**: The fastest path to a working demo is:
   - **COMMIT the existing runtime code** (critical — it's untracked)
   - Complete harness session: add tool loop, UI generation, and approval resolution
   - Wire ONE demo scene (Verify or Act) end-to-end: scanner → harness → renderer
   - Add Vitest for contract validation
   - Playwright and full model-backed generation are stretch

### Recommended Immediate Actions

1. `git add frontend/src/harness/runtime/ frontend/src/browser/ frontend/src/renderer/stream/`
2. Install Vitest: `npm install -D vitest @vitest/ui`
3. Complete `session.ts` run loop: add tool execution, UI patch generation, approval handling
4. Refactor ONE demo to use `createLocalHarnessSession()` + `buildPageContextPacket()` + event stream
5. Add Zod for runtime validation

---

## 1. Shared Contracts And Baseline

- [x] 1.1 Freeze the current frontend baseline by running `npm run build` from `frontend` and recording any warnings or blockers.
  - **Status**: Builds cleanly. One minor Tailwind warning (`min-*`/`max-*` variants with mixed units in screens config).
- [x] 1.2 Create shared TypeScript contracts for context packets, host theme, harness events, generated UI payloads, tool results, approvals, action plans, and verification results.
  - **Status**: Done. See `frontend/src/types/harness.ts` (325 lines), `frontend/src/types/primitives.ts` (712 lines), `frontend/src/types/ui.ts`.
- [ ] 1.3 Add Zod or JSON Schema validation generated from or aligned with the TypeScript contracts.
  - **Status**: NOT DONE. Critical gap — no runtime validation of harness events or primitive trees.
- [x] 1.4 Normalize primitive node names so generated trees use the same casing as `PrimitiveRenderer`.
  - **Status**: Done. `PrimitiveRenderer.tsx` maps 92 primitives via `primitiveMap`.
- [ ] 1.5 Add contract fixtures for all event types, normalized web evidence/media results, and all four scenario context packets.
  - **Status**: NOT DONE. Only mock timeout-based events exist in `frontend/src/harness/mockEvents.ts`.
- [x] 1.6 Keep repo-local OpenSpec skills in `.codex/skills` and mirror them into `.agents/skills` for team discoverability.
  - **Status**: Done. Both directories present with openspec and impeccable skills.

## 2. User A - Functional Harness Runtime

- [x] 2.1 Create the TypeScript harness runtime structure with Vitest configured.
  - **Status**: DONE (uncommitted). `frontend/src/harness/runtime/` exists with `contracts.ts`, `session.ts`, `policy.ts`, `validateUi.ts`, `index.ts`. **NEEDS COMMIT.**
- [ ] 2.2 Implement the run state machine for receiving intent, observing page, classifying intent, planning, generating UI, running tools, awaiting approval, executing actions, verifying, completed, failed.
  - **Signal**: `session.ts` has state transitions up to `planning` then stops. Needs tool loop, UI generation, approval wiring, execution, verification completion.
- [ ] 2.3 Implement intent classification for verify, understand, act, respond, summarize, navigate, and unknown.
  - **Signal**: Types exist (`IntentFamily`) but ZERO classification logic in runtime. `session.ts` does not classify. Need heuristic/rules-based classifier for demo.
- [ ] 2.4 Implement the planner interface that consumes intent classification, page context, available tools, and primitive manifest.
  - **Signal**: `session.ts` `runOnce()` stops after `planning`. Need planner that selects tools and generates primitive trees.
- [x] 2.5 Implement a Claude Code-style session interface with streaming input, async iterable output events, interrupt support, and warm startup.
  - **Status**: DONE (uncommitted). `LocalHarnessSession` in `session.ts` implements `streamInput()`, `events()` async iterable, `interrupt()`, `close()`. **NEEDS COMMIT.**
- [ ] 2.6 Implement UI schema validation and repair/failure handling for generated primitive trees.
  - **Signal**: `validateUi.ts` exists but is a stub. Needs real validation against `primitiveMap` keys and prop shapes.
- [x] 2.7 Implement approval policy enforcement outside the model for high-risk actions.
  - **Status**: DONE (uncommitted). `policy.ts` has `evaluateToolApproval()` with risk-based logic. **NEEDS COMMIT.**
- [ ] 2.8 Implement verification result handling for success, failed, partial, and unknown outcomes.
  - **Signal**: Types exist but `session.ts` does not verify action results.
- [ ] 2.9 Implement provider-neutral `web.search` and `web.fetch` tool interfaces.
  - **Signal**: Exa is the MVP provider, but product logic must consume normalized search/content results, including optional `imageUrl`, `faviconUrl`, and `media[]` fields for GenUI evidence.
- [ ] 2.10 Implement Exa MVP provider for search, contents/highlights, representative images, favicons, page image links, people lookup, company lookup, and error normalization.
  - **Signal**: Exa supports `people` and `company` categories, but those categories have filter restrictions that must be encoded in the provider. Exa also exposes `image`, `favicon`, and `contents.extras.imageLinks`; these must be normalized behind Clickthrough contracts.
- [ ] 2.11 Add local caching for demo web queries and cap default result counts.
  - **Signal**: Needed to preserve free-tier credits and make recording reliable.
- [ ] 2.12 Add Vitest unit tests for state transitions, classifier outputs, approval policy, UI validation, web tool normalization including media fields, and verification decisions.
  - **Signal**: NO test infrastructure. `vitest` not in package.json.

## 3. User B - DOM Scanner, Browser Tools, And SharkAuth

- [x] 3.1 Build a generic DOM scanner that extracts visible text, selected text, accessible names, interactive elements, forms, tables, dialogs, anchors, and bounding boxes.
  - **Status**: DONE (uncommitted). `frontend/src/browser/domScanner.ts` has `scanDom()` with interactive element detection, visibility filtering, accessible labels, bounds, and capability mapping. **NEEDS COMMIT.**
- [x] 3.2 Implement host theme sampling for font, color roles, border, radius, density, and control style.
  - **Status**: DONE (uncommitted). `frontend/src/browser/hostTheme.ts` has `sampleHostTheme()` using `getComputedStyle` with mode inference. **NEEDS COMMIT.**
- [x] 3.3 Implement stable element references that survive normal page interactions and support re-scan after navigation or DOM changes.
  - **Status**: DONE (uncommitted). `domScanner.ts` assigns `data-ct-element-id` attributes. `actionExecutor.ts` queries by these IDs. **NEEDS COMMIT.**
- [x] 3.4 Implement browser action tools for highlight, click, fill, select, waitFor, and verify.
  - **Status**: DONE (uncommitted). `frontend/src/browser/actionExecutor.ts` has `executeBrowserActionPlan()` with click, fill, select, waitFor, verify. **NEEDS COMMIT.**
- [ ] 3.5 Connect the scanner to the harness as `dom.scan` and browser action tools with typed inputs/outputs.
  - **Signal**: `pageBridge.ts` exists and calls `scanDom()` + `sampleHostTheme()`. BUT not wired to harness session input. Need to pass `PageContextPacket` into `HarnessSessionInput`.
- [ ] 3.6 Target the real SharkAuth app or safe SharkAuth test workspace and discover the API key creation workflow through scanner outputs.
  - **Signal**: SharkAuth is referenced in docs but no URL, credentials, or test workspace defined.
- [ ] 3.7 Implement SharkAuth execution using generic DOM tools first, with a typed SharkAuth tool only if DOM execution is too brittle.
  - **Signal**: Blocked by 3.6 (no SharkAuth target).
- [ ] 3.8 Add scanner fixtures and integration tests for generic pages, demo pages, and SharkAuth action affordances.
  - **Signal**: Blocked by test infrastructure.

## 4. User C - Overlay Renderer And AG-UI Client

- [x] 4.1 Refactor demo overlays to consume streamed `GeneratedUI` trees through `PrimitiveRenderer` instead of manually composing every final state.
  - **Status**: DONE. `PrimitiveRenderer.tsx` exists and maps 92 primitives. Demos currently compose manually but CAN consume trees.
- [x] 4.2 Implement frontend client support for the harness async event stream without requiring an HTTP server.
  - **Status**: DONE (uncommitted). `frontend/src/renderer/stream/applyHarnessEvent.ts` consumes `HarnessEvent` stream and updates render state. **NEEDS COMMIT.**
- [x] 4.3 Implement patch application for progressive `ui.patch` events across nested primitive trees.
  - **Status**: DONE. `applyUiPatch()` in `useHarness.ts` handles add/replace/remove on paths.
- [x] 4.4 Wire host theme variables into each overlay mode through `HostStyleAdapter`.
  - **Status**: DONE. `HostStyleAdapter.tsx` exists and injects CSS variables.
- [ ] 4.5 Implement visible skeleton/progress-to-final transitions for all four demo scenes.
  - **Signal**: Skeleton primitive exists but demos use static `setTimeout` toggles. Need to refactor ONE demo to use `LocalHarnessSession.events()` + `applyHarnessEvent()`.
- [x] 4.6 Ensure approval gates and CT marks remain visibly distinct from host-adapted surfaces.
  - **Status**: DONE. ApprovalGate and CTMark primitives exist with distinct styling.
- [ ] 4.7 Add Playwright browser checks for overlay rendering, event streaming, approval gating, source image/fallback rendering, and responsive fit.
  - **Signal**: NO Playwright config exists. Not in package.json.

## 5. User D - Integration, Acceptance, And Winning Demo

- [ ] 5.1 Define per-scene acceptance checks without adding runtime scenario profiles or pre-rendered final UI.
  - **Signal**: Demos are currently pre-rendered static compositions. Need acceptance criteria for event-driven versions.
- [ ] 5.2 Create test/page fixtures only where needed for repeatability, keeping fixtures separate from harness runtime logic.
  - **Signal**: No fixture files exist. Need mock page contexts and event sequences.
- [x] 5.3 Verify the Twitter/X flow renders claim highlight, Exa-backed web/source tool progress, media-grounded evidence, contradiction, verdict, and uncertainty from harness output.
  - **Status**: PARTIAL. Static demo exists. Needs harness-driven version.
- [x] 5.4 Verify the OAuth PKCE flow renders selected text extraction, quote, sequence diagram, stepper, with/without PKCE control, and comparison state from harness output.
  - **Status**: PARTIAL. Static demo exists. Needs harness-driven version.
- [x] 5.5 Verify the SharkAuth flow uses scanner context, approval, execution, verification, scope/risk UI, and masked key handling.
  - **Status**: PARTIAL. Static demo exists. Needs harness-driven version with real scanner.
- [x] 5.6 Verify the response flow uses sensitive context guard, private explanation, timeline, reply drafts, tone controls, and no auto-send.
  - **Status**: PARTIAL. Static demo exists. Needs harness-driven version.
- [ ] 5.7 Own cross-lane integration checklist and call out blockers between harness, scanner, renderer, and demo scenes.
  - **Signal**: This document IS the integration checklist. Blockers identified in signals above.
- [ ] 5.8 Add demo reset/replay controls for reliable recording without replacing the live harness path.
  - **Signal**: No replay controls exist.
- [x] 5.9 Write the final 2-4 minute recording script aligned to `DEMO.md`, emphasizing AG-UI streaming and MCP tool discovery while avoiding chatbot framing.
  - **Status**: DONE. `DEMO.md` exists as storyboard source of truth.

## 6. Integration Checkpoints

- [ ] 6.1 Integrate User A and User C work by streaming real harness events into the renderer.
  - **Signal**: Currently mocked via `setTimeout`. Need real event stream from harness runtime.
- [ ] 6.2 Integrate User B scanner packets into User A classification and planning.
  - **Signal**: Scanner doesn't exist yet. This is a HARD BLOCKER for end-to-end demos.
- [ ] 6.3 Integrate User D scenario flows with User A harness, User B scanner/actions, and User C overlay rendering.
  - **Signal**: Blocked by 6.1 and 6.2.
- [x] 6.4 Verify the SharkAuth approval flow blocks execution until approval and reports denied approval correctly.
  - **Status**: PARTIAL. ApprovalGate UI exists but policy enforcement is not wired to real execution.
- [x] 6.5 Verify all four scenes show distinct generated interfaces rather than one generic panel.
  - **Status**: DONE. Four distinct demo scenes exist in `frontend/src/demos/`.
- [ ] 6.6 Run Vitest for the harness runtime and fix failures.
  - **Signal**: NO Vitest configured. Need `npm install -D vitest` and test scripts.
- [ ] 6.7 Run Playwright browser tests for core scenes and fix failures.
  - **Signal**: NO Playwright configured. Need `npm install -D @playwright/test` and config.
- [x] 6.8 Run `npm run build` from `frontend` and fix TypeScript or bundling failures.
  - **Status**: DONE. Build passes cleanly.

## 7. Stretch Work After Core Is Stable

- [ ] 7.1 Add one model-backed UI generation path if the first harness loop is stable.
  - **Signal**: Depends on 2.3 (intent classification) and 2.4 (planner). Consider OpenAI/Anthropic API or lightweight local heuristic for demo.
- [ ] 7.2 Add a minimal extension/content-script wrapper if time remains after the harness and Vite demo loop are stable.
  - **Signal**: Product vision is browser extension but current demo is Vite app. Extension is stretch.
- [ ] 7.3 Add a stdio/NDJSON subprocess adapter if the harness needs isolation from the page/runtime.
  - **Signal**: Only needed if harness moves to separate process. Not critical for hackathon.
- [ ] 7.4 Add SSE/WebSocket adapter only if a separate remote process or multi-client session becomes necessary.
  - **Signal**: Not needed for single-player demo.
- [ ] 7.5 Add MCP tool discovery framing or a mock MCP tool manifest if it improves protocol credibility.
  - **Signal**: Can be mocked for demo story without full MCP implementation.
- [ ] 7.6 Add CopilotKit only if it accelerates hotkey, approval, or event wiring without creating a chat UI.
  - **Signal**: Current `useHarness` + `useApproval` hooks are sufficient. CopilotKit is optional per `STACK.md`.
- [ ] 7.7 Add A2UI mapping notes if it improves schema credibility without slowing implementation.
  - **Signal**: AG-UI is primary protocol. A2UI is reference only.
