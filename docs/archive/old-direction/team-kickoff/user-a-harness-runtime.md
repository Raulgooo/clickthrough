# User A Kickoff: Harness Runtime

## Mission

Own the TypeScript Clickthrough harness runtime: state machine, planner boundary, read-only tool policy, UI validation, event stream, and grounded result handling.

## Primary Files

- `frontend/src/harness/runtime/`
- `frontend/src/types/harness.ts`
- `frontend/src/types/ui.ts`

## First Tasks

- Implement a Claude Code-style session interface: streaming input, async iterable output events, interrupt, close, warm startup path.
- Replace placeholder state emissions in `LocalHarnessSession` with real classify/plan/tool/UI phases.
- Make generated UI output follow `DECLARATIVE_UI.md`: surface plan, data model, primitive tree, safety summary, and action bindings.
- Implement provider-neutral `web.search` and `web.fetch` contracts with Exa behind them for MVP.
- Normalize web evidence into source objects with title, URL, highlights, retrieved timestamp, optional image URL, optional favicon URL, and optional media array.
- Add a policy guard that blocks mutating browser/page actions in the hackathon MVP and reports them as deferred guidance.
- Add UI validation against registered primitives.
- Add Vitest tests once test tooling is installed, including web result normalization and missing-image fallback fixtures.

## Done When

- A run emits typed events in order without a server.
- Mutating action requests are not executed in the MVP path.
- Invalid UI is rejected before render.
- The planner emits declarative UI intent before primitive rendering.
- Web tool outputs are provider-neutral and can feed evidence primitives without Exa-specific fields.
- Grounded result handling can return `verified`, `unverified`, `partial`, or `unknown` style outcomes without overstating certainty.
