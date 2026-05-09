## Context

Clickthrough is currently a Vite React TypeScript frontend with a broad primitive library, four storyboard demos, host-style tokens, and mock harness hooks. The docs define a larger browser-native agent architecture: a page perception layer, model-agnostic harness, AG-UI-style stream, primitive validation, approval gates, action execution, and verification.

The hackathon constraint is speed with working code: the team needs a functional 2-4 minute demo that proves runtime generated UI, not a generic chatbot. Four users with agents will work in parallel, so the core plan must minimize merge conflict and maximize visible demo coherence.

**Revised baseline (post-audit)**:

- Frontend build passes cleanly (one minor Tailwind warning).
- TypeScript contracts are comprehensive: `harness.ts` (325 lines), `primitives.ts` (712 lines), `ui.ts`.
- 92 atomic primitives exist and are mapped in `PrimitiveRenderer.tsx`.
- `HostStyleAdapter`, `OverlayMount`, `OverlayPositioner`, and `PrimitiveRenderer` are functional.
- **Runtime code exists but is UNCOMMITTED**: `frontend/src/harness/runtime/`, `frontend/src/browser/`, `frontend/src/renderer/stream/`. These compile cleanly but are not in git.
- **Harness runtime is skeletal** — `LocalHarnessSession` implements async iterable events and state transitions up to `planning`, but stops there. No tool loop, UI generation, or approval wiring.
- **DOM scanner exists but is unintegrated** — `scanDom()`, `sampleHostTheme()`, `buildPageContextPacket()` are ready but not wired to harness input.
- **Browser action executor exists but is unintegrated** — `executeBrowserActionPlan()` ready but not wired to approval flow.
- **NO runtime validation** (Zod/JSON Schema) — `validateUi.ts` is a stub.
- **NO test infrastructure** — Vitest and Playwright not installed.
- Demos are manually composed React scenes, not generated primitive trees driven by a harness.

OpenSpec was initialized for this repo as part of this planning change. This design was revised after auditing the actual codebase state against the original codex plan.

## Goals / Non-Goals

**Goals:**

- Ship an end-to-end functional harness loop: observe page context, classify intent, plan, call tools, stream generated UI, request approval for risky action, execute approved DOM/API work, verify result.
- Keep the visible product as generated overlays on the current page.
- Make all four demo scenes distinct: verification dashboard, PDF explainer, SharkAuth action surface, and response assistant.
- Let four users work independently through owned lanes chosen for fastest quality and lowest merge contention.
- Use SharkAuth as a real target for the action scene while keeping the DOM scanner generic enough to work across arbitrary pages.
- Add a test strategy that catches harness, schema, scanner, approval, and browser-regression failures before recording.
- Use OpenSpec artifacts as the shared source for what must be true before implementation starts.

**Non-Goals:**

- Production browser extension packaging across stores.
- Perfect universal DOM automation for arbitrary sites.
- Full long-term memory, user accounts, billing, or SaaS admin surfaces.
- A full MCP app store or broad CopilotKit integration.
- A deterministic-only harness. Deterministic fixtures are acceptable for tests, local fallback, and predictable replay, but not as the primary product core.

## Decisions

### Decision 1: Build the full functional harness core first

The product core is the harness: intent input, page context packet, classification, planning, tool calls, primitive tree generation, approval decisions, action execution, verification, and event streaming. Demo scenes can be controlled for recording, but they must exercise the same harness interfaces.

Alternative considered: keep the existing handcrafted scene components or deterministic-only profiles. That is faster short term, but it fails the core judging question because the product would be a scripted animation rather than an agentic interface runtime.

### Decision 2: Implement the DOM scanner/page bridge as a harness subsystem

The DOM scanner is part of the harness boundary, not a side demo utility. It should work first in the Vite-controlled pages and SharkAuth, then generalize by extracting visible text, interactive elements, accessible names, forms, tables, stable element refs, anchors, and host theme without relying on scene-specific selectors.

Alternative considered: build a full Chrome extension first. That better matches the future product, but it increases packaging, permissions, reload, and content-script complexity before the harness loop is proven.

### Decision 3: Define shared contracts before adding runtime services

Shared TypeScript contracts should be the first implementation slice: `ClickthroughNode`, context packets, host theme, harness events, run profiles, tool results, approval packets, action plans, and verification results. Frontend, page bridge, and backend can then integrate without inventing local shapes.

Alternative considered: let each lane move independently and reconcile later. That is high risk with four agents because event names, primitive names, and action semantics will drift.

### Decision 4: Use a Claude Code-style TypeScript harness runtime, not an HTTP server first

The harness should be TypeScript-first because Clickthrough is browser-native, the renderer and primitives are already TypeScript, DOM scanning/action execution live naturally in browser/Playwright/CDP APIs, and OpenClaw-style native harness plugins are also described as TypeScript plugin contracts.

The runtime boundary should mimic Claude Code's SDK shape: a long-lived interactive session with streaming input, an async iterable of messages/events, partial output events for text/tool deltas, explicit interruption/approval handling, and a warm startup path. Claude Code's TypeScript SDK exposes `query()` as an async generator, supports streaming input mode for persistent sessions, and can warm a native subprocess before the first prompt. Clickthrough should use the same pattern internally:

```ts
const run = startClickthroughSession(options);
await run.streamInput(userOrPageEvents);

for await (const event of run.events()) {
  applyHarnessEvent(event);
}
```

For the Vite demo, this can be an in-process TypeScript runtime. For an extension or isolated runner, use a stdio/NDJSON subprocess bridge or extension message port with the same event schema. WebSocket/SSE should be an adapter only when a remote process or multi-client browser session requires it, not the first implementation.

Alternative considered: Python/FastAPI + Pydantic + pytest. Python is strong for tool orchestration and tests, and browser-use/Hermes-style browser harnesses can run in Python or JavaScript. But for this repo, adding Python creates cross-language schema drift and slows integration unless a specific Python-only tool becomes necessary. An HTTP server is also unnecessary for the first milestone because Claude Code-style agents expose a streaming library/process interface, not a mandatory app server.

### Decision 5: Browser actions require approval even in demo mode

The SharkAuth action scene must pause at an approval gate before any DOM or API action. The resulting execution log and verification result must be produced after approval, not pre-rendered as a static state. The scanner should discover SharkAuth affordances rather than hard-code the whole workflow.

Alternative considered: auto-run the action for demo smoothness. That weakens the trust story and violates the product safety rules.

### Decision 6: Protocol strategy for winning the hackathon

The handbook rewards working agent-rendered UI, sponsor protocols, and moving past chat. AG-UI should be the primary visible protocol because Clickthrough streams agent state, partial UI trees, approval requests, and results into runtime overlays. MCP Apps should be framed as the tool/app discovery layer for web search, SharkAuth actions, profile lookup, and browser tools. A2UI can be referenced as an influence if it improves schema framing, and CopilotKit should stay optional unless it accelerates hotkey/approval plumbing without creating chat.

Alternative considered: lead with CopilotKit or A2UI. CopilotKit risks making the product look like a copilot/chat surface, and A2UI is useful but less central to our streaming overlay proof.

### Decision 7: Four-person split optimizes for integration speed

The fastest high-quality split is:

- User A: TypeScript harness runtime, schema validation, event stream, approval policy, verification.
- User B: DOM scanner, page bridge, SharkAuth targeting, action executor.
- User C: overlay renderer, primitive validation, host adaptation, AG-UI client, replay controls.
- User D: scenario flows, prompt/run profiles, evidence/tool adapters, demo script, final integration polish.

This split keeps the harness and scanner separate, keeps renderer ownership clean, and gives one person responsibility for demo coherence.

## Risks / Trade-offs

- **Four lanes diverge on data shapes** -> Mitigation: shared contracts land first and all lanes consume them. **STATUS: Contracts are frozen and comprehensive.**
- **Demo becomes static again** -> Mitigation: every scene must show event-driven skeleton/progress-to-final UI. **STATUS: At risk. Current demos use `setTimeout` toggles, not real event streams.**
- **Full extension work consumes the schedule** -> Mitigation: harness plus extension-like page bridge first, extension packaging only if time remains. **STATUS: Extension is now explicitly stretch.**
- **Model/API instability breaks recording** -> Mitigation: real harness includes deterministic fixtures and replay mode for tests and fallback, while the primary architecture remains functional. **STATUS: No model integration yet. Recommend heuristic/rules-based harness for demo reliability.**
- **Action scene overpromises generic automation** -> Mitigation: use real SharkAuth where available, but keep scanner/action contracts generic and show verification evidence. **STATUS: SharkAuth target undefined. Need URL/test workspace.**
- **Host adaptation is shallow** -> Mitigation: sample at least font, radius, surface, text, border, accent, and density from each controlled host scene. **STATUS: `HostTheme` type exists but no sampling logic.**
- **Merge conflicts from broad frontend edits** -> Mitigation: ownership lanes avoid overlapping files; demos consume shared runtime rather than each lane editing every scene. **STATUS: Primitives and renderer are stable. New work should go in `harness/runtime/`, `scanner/`, and `demos/` (refactored).**
- **Harness/browser contract drift** -> Mitigation: keep core contracts in TypeScript, derive any JSON Schema from them, and test example payloads end to end. **STATUS: No validation layer. Zod needed.**
- **Premature transport work slows the core loop** -> Mitigation: implement async iterable/session-port first; add WebSocket/SSE only as a transport adapter after the harness loop works. **STATUS: No transport needed for Vite demo. In-process async iterable is sufficient.**
- **NEW RISK: Scanner is critical path** -> The DOM scanner blocks harness classification, planning, and all end-to-end demos. Without it, the harness has no page context. **Mitigation: Build minimal scanner first (selected text + URL + theme) before full capability map extraction.**
- **NEW RISK: Zero tests** -> No automated validation means regressions are invisible. **Mitigation: Add Vitest immediately for contract and harness state tests. Playwright can follow.**

## Open Questions

- Which local URL, auth state, and safe test workspace should the SharkAuth scene target?
- Which model/API key will power the harness during the hackathon, and what fallback mode is allowed if the network or model fails?
- Should OpenSpec repo-local skills be duplicated under `.agents/skills` as-is or wrapped with project-specific Clickthrough instructions?
