## Context

Clickthrough is currently a Vite React TypeScript frontend with a broad primitive library, four storyboard demos, host-style tokens, and mock harness hooks. The docs define a larger browser-native agent architecture: a page perception layer, model-agnostic harness, AG-UI-style stream, primitive validation, approval boundaries, action execution, and verification. For the hackathon MVP, the live path is read-only: action execution and SharkAuth automation are deferred.

The hackathon constraint is speed with working code: the team needs a functional 2-4 minute demo that proves runtime generated UI, not a generic chatbot. Four users with agents will work in parallel, so the core plan must minimize merge conflict and maximize visible demo coherence.

**Revised baseline (post-audit)**:

- Frontend build passes cleanly (one minor Tailwind warning).
- TypeScript contracts are comprehensive: `harness.ts` (325 lines), `primitives.ts` (712 lines), `ui.ts`.
- 92 atomic primitives exist and are mapped in `PrimitiveRenderer.tsx`.
- `HostStyleAdapter`, `OverlayMount`, `OverlayPositioner`, and `PrimitiveRenderer` are functional.
- **Runtime code exists but is UNCOMMITTED**: `frontend/src/harness/runtime/`, `frontend/src/browser/`, `frontend/src/renderer/stream/`. These compile cleanly but are not in git.
- **Harness runtime is skeletal** — `LocalHarnessSession` implements async iterable events and state transitions up to `planning`, but stops there. No tool loop, UI generation, or approval wiring.
- **DOM scanner exists but is unintegrated** — `scanDom()`, `sampleHostTheme()`, `buildPageContextPacket()` are ready but not wired to harness input.
- **Browser action executor exists but is unintegrated** — `executeBrowserActionPlan()` is post-hackathon infrastructure and must stay quarantined from the live MVP path.
- **NO runtime validation** (Zod/JSON Schema) — `validateUi.ts` is a stub.
- **NO test infrastructure** — Vitest and Playwright not installed.
- Demos are manually composed React scenes, not generated primitive trees driven by a harness.

OpenSpec was initialized for this repo as part of this planning change. This design was revised after auditing the actual codebase state against the original codex plan.

## Goals / Non-Goals

**Goals:**

- Ship an end-to-end functional harness loop: observe page context, classify intent, plan, call read-only tools, stream generated UI, ground claims with evidence, and block/defer mutating actions.
- Keep the visible product as generated overlays on the current page.
- Make all four demo scenes distinct: verification dashboard, PDF explainer, Jarvis-like page copilot surface, and response assistant.
- Let four users work independently through owned lanes chosen for fastest quality and lowest merge contention.
- Use the third scene to prove Clickthrough can become a general copilot for the current web page without relying on SharkAuth automation.
- Use Exa for MVP web search and content extraction while keeping web tools provider-agnostic.
- Add a test strategy that catches harness, schema, scanner, approval, and browser-regression failures before recording.
- Use OpenSpec artifacts as the shared source for what must be true before implementation starts.

**Non-Goals:**

- Production browser extension packaging across stores.
- Perfect universal DOM automation for arbitrary sites.
- Live browser mutation, credential creation, form submission, or SharkAuth API key automation during the hackathon MVP.
- Full long-term memory, user accounts, billing, or SaaS admin surfaces.
- A full MCP app store or broad CopilotKit integration.
- A deterministic-only harness. Deterministic fixtures are acceptable for tests, local fallback, and predictable replay, but not as the primary product core.

## Decisions

### Decision 1: Build the full functional harness core first

The product core is the harness: intent input, page context packet, classification, planning, tool calls, primitive tree generation, approval decisions, action execution, verification, and event streaming. Demo scenes can be controlled for recording, but they must exercise the same harness interfaces.

Alternative considered: keep the existing handcrafted scene components or deterministic-only profiles. That is faster short term, but it fails the core judging question because the product would be a scripted animation rather than an agentic interface runtime.

### Decision 2: Implement the page perception bridge as a harness subsystem

The page perception bridge is part of the harness boundary, not a side demo utility. It should work first in the Vite-controlled pages, then generalize by extracting selected text, visible text, lightweight affordances, accessible names, headings, stable anchors, and host theme without relying on scene-specific selectors.

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

### Decision 5: Mutating browser actions are deferred for the hackathon

The live hackathon demo must not depend on clicking through a real app, creating credentials, submitting forms, or mutating account state. If a request would require mutation, the harness should generate a safe copilot surface: explanation, checklist, prepared draft, source-backed recommendation, or deferred-action state.

Alternative considered: keep the SharkAuth action scene and gate it with approval. That is strong long-term product direction, but it creates fragile demo risk and makes User B's lane too large for the hackathon cut.

### Decision 6: Protocol strategy for winning the hackathon

The handbook rewards working agent-rendered UI, sponsor protocols, and moving past chat. AG-UI should be the primary visible protocol because Clickthrough streams agent state, partial UI trees, tool progress, deferred-action states, and results into runtime overlays. MCP Apps should be framed as the tool/app discovery layer for web search, source fetch, profile lookup, and browser/page context tools. A2UI can be referenced as an influence if it improves schema framing, and CopilotKit should stay optional unless it accelerates hotkey/event plumbing without creating chat.

Alternative considered: lead with CopilotKit or A2UI. CopilotKit risks making the product look like a copilot/chat surface, and A2UI is useful but less central to our streaming overlay proof.

### Decision 7: Four-person split optimizes for integration speed

The fastest high-quality split is:

- User A: TypeScript harness runtime, schema validation, event stream, approval policy, verification.
- User B: page perception, context bridge, anchors, host theme, demo context fixtures.
- User C: overlay renderer, primitive validation, host adaptation, AG-UI client, replay controls.
- User D: scenario flows, prompt/run profiles, evidence/tool adapters, demo script, final integration polish.

This split keeps the harness and scanner separate, keeps renderer ownership clean, and gives one person responsibility for demo coherence.

### Decision 8: Use Exa as the MVP web search provider, behind generic tools

Clickthrough needs reliable web evidence quickly for the verification scene. Exa is the best MVP default because it provides search and page contents/highlights in one agent-friendly API, has a free tier suitable for hackathon usage, and supports specialized `people` and `company` categories for profile/company discovery.

The harness must expose provider-neutral tools:

```txt
web.search(query, options)
web.fetch(url, options)
```

Exa is an implementation detail behind those tools. Use `contents.highlights` for token-efficient evidence, cap result count, and cache demo queries during development. For LinkedIn-style lookup, use Exa's `people` or `company` category and respect its restrictions: people/company categories do not support date filters or `excludeDomains`, and `people.includeDomains` only accepts LinkedIn domains.

Alternative considered: self-host SearXNG for zero API cost. That is more OSS-aligned, but it adds setup and reliability risk. Scrapling is useful for fetch/extraction/crawling, but it is not a search index and should not be forked for MVP.

### Decision 9: Treat declarative UI and styling intent as separate model outputs

The model should produce structured UI intent, not raw JSX, raw HTML, or arbitrary CSS. The primary output remains a validated primitive tree. Alongside that tree, the harness may provide styling intent such as density, emphasis, tone, host-fit strategy, visual hierarchy goal, and preferred visualization pattern.

This improves model output quality because the model chooses the interface concept while the renderer handles exact implementation, accessibility, host-page adaptation, responsive fit, and trust boundaries. Styling skills and prompts are valuable as taste and composition guidance, but they must be compiled into safe primitive props and renderer-owned tokens.

The concrete generated UI pipeline is:

```txt
fast style brief -> surface plan -> data model -> primitive tree -> safety/action bindings
```

The optional fast style brief is produced by a cheap model or deterministic style planner. It converts the user's prompt, intent, page context, and host theme into a compact design direction: interface archetype, anchor strategy, layout bias, visual tone, density, host adaptation, motion hint, priority order, and anti-patterns to avoid.

The principal CT agent uses that brief as guidance, not law. The surface plan explains purpose, anchor, layout pattern, style intent, and interaction constraints. The data model carries source-grounded facts, risks, fields, steps, and results. The primitive tree renders the current view. Safety/action bindings connect UI controls to harness-owned execution.

The design direction is cursor-native: Clickthrough should feel like a natural expansion of the cursor. Generated UI should originate from the user's current point of intent: selected text, focused element, hovered control, caret, cursor position, or visible page region. Small questions should produce small anchored UI; complex tasks may expand into panels or fullscreen workbenches only when the task demands it.

Alternative considered: ask the model to generate full styled React components. That may look impressive in isolated demos, but it creates schema drift, unsafe rendering, fragile responsive behavior, and slower integration with host adaptation.

## Risks / Trade-offs

- **Four lanes diverge on data shapes** -> Mitigation: shared contracts land first and all lanes consume them. **STATUS: Contracts are frozen and comprehensive.**
- **Demo becomes static again** -> Mitigation: every scene must show event-driven skeleton/progress-to-final UI. **STATUS: At risk. Current demos use `setTimeout` toggles, not real event streams.**
- **Full extension work consumes the schedule** -> Mitigation: harness plus extension-like page bridge first, extension packaging only if time remains. **STATUS: Extension is now explicitly stretch.**
- **Model/API instability breaks recording** -> Mitigation: real harness includes deterministic fixtures and replay mode for tests and fallback, while the primary architecture remains functional. **STATUS: No model integration yet. Recommend heuristic/rules-based harness for demo reliability.**
- **Action scene overpromises generic automation** -> Mitigation: replace SharkAuth execution with a Jarvis-like read-only page copilot scene and keep action execution post-hackathon.
- **Host adaptation is shallow** -> Mitigation: sample at least font, radius, surface, text, border, accent, and density from each controlled host scene. **STATUS: `HostTheme` type exists but no sampling logic.**
- **Merge conflicts from broad frontend edits** -> Mitigation: ownership lanes avoid overlapping files; demos consume shared runtime rather than each lane editing every scene. **STATUS: Primitives and renderer are stable. New work should go in `harness/runtime/`, `scanner/`, and `demos/` (refactored).**
- **Harness/browser contract drift** -> Mitigation: keep core contracts in TypeScript, derive any JSON Schema from them, and test example payloads end to end. **STATUS: No validation layer. Zod needed.**
- **Premature transport work slows the core loop** -> Mitigation: implement async iterable/session-port first; add WebSocket/SSE only as a transport adapter after the harness loop works. **STATUS: No transport needed for Vite demo. In-process async iterable is sufficient.**
- **Exa free tier or API key issues break verification** -> Mitigation: cache demo query results, cap searches, and keep a provider interface that can fall back to saved fixtures, SearXNG, Brave, or direct fetch.
- **NEW RISK: Page perception is critical path** -> The context bridge blocks harness classification, planning, anchoring, and all end-to-end demos. Without it, the harness has no page context. **Mitigation: Build minimal page packet first (selected text + URL + title + visible text + host theme + anchor) before richer affordance extraction.**
- **NEW RISK: Zero tests** -> No automated validation means regressions are invisible. **Mitigation: Add Vitest immediately for contract and harness state tests. Playwright can follow.**

## Open Questions

- Which model/API key will power the harness during the hackathon, and what fallback mode is allowed if the network or model fails?
- Should OpenSpec repo-local skills be duplicated under `.agents/skills` as-is or wrapped with project-specific Clickthrough instructions?
