# Clickthrough Team Brief

## What We Are Building

Clickthrough is a browser-native intent agent.

The user stays on the current page, invokes CT, and states intent. Clickthrough observes the page, understands the task, and generates the exact overlay UI needed to verify, explain, navigate, compose, or decide without making the user leave the page.

This is not a chatbot, sidebar, or separate assistant app. The generated interface is the product.

Clickthrough should feel like a natural expansion of the cursor: summoned at the point of intent, anchored to the thing the user is looking at, spatially lightweight until more room is needed, and always easy to dismiss or refine without breaking flow.

Hackathon scope update: the live MVP is read-only. It may search, fetch, explain, summarize, compare, prepare drafts, highlight page regions, and suggest safe next steps. It must not create credentials, submit forms, click through workflows, post content, delete data, buy things, or change account state. Browser action execution and SharkAuth automation remain post-hackathon architecture.

## Hackathon Goal

Win by showing working code that clearly proves:

- the agent renders UI at runtime
- the UI changes shape by intent and page context
- the user never leaves the page
- the product goes beyond chat
- web facts are grounded with sources and uncertainty
- the browser feels like it gained a Jarvis-like intent layer

The demo should land in these tracks:

- Kill the Dashboard
- No Designer, No Problem
- The Copilot That Ships, framed as confirm/tweak/prepare inline rather than autonomous mutation

## Core Capabilities

1. **Verify**
   - User asks if a claim is true.
   - CT highlights the claim and generates an evidence dashboard with sources, contradictions, confidence, verdict, and uncertainty.

2. **Understand**
   - User asks CT to explain dense content visually.
   - CT generates a visual explainer with selected quote, sequence diagram, step controls, toggles, and callouts.

3. **Assist / Navigate**
   - User asks CT to help with the current web page.
   - CT reads page context and generates a Jarvis-like copilot surface: page summary, detected entities, recommended next steps, source-backed side research, and copyable/checkable outputs.

4. **Respond**
   - User asks what a message means and what to say.
   - CT generates a private response helper with explanation, drafts, tone controls, and no auto-send.

## Architecture Direction

We are building a **Claude Code-style harness**, not a normal HTTP app first.

The harness should behave like a long-lived runtime session:

```txt
page context + user intent
  -> harness state machine
  -> typed tool calls
  -> generated primitive UI patches
  -> read-only evidence/extraction/fetch tools
  -> grounded verification and UI state
  -> streamed events back to overlay
```

First implementation should use an in-process TypeScript runtime with async events:

```ts
for await (const event of session.events()) {
  applyHarnessEvent(event);
}
```

No HTTP server is required for the first milestone. WebSocket/SSE can come later only if we need a separate process, extension background worker, or remote service.

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind/CSS variables
- TypeScript harness runtime
- Vitest for harness/unit tests
- Playwright for browser/integration tests
- Exa as MVP web search/content provider behind generic `web.search` and `web.fetch` contracts
- Exa media metadata for representative source images, favicons, and page image links where available
- AG-UI-style event stream for visible runtime generation
- MCP Apps as tool/app discovery framing
- Clickthrough primitive schema from `UI_PRIMITIVES.md`
- Lightweight page perception bridge for URL/title/selection/visible text/anchors/host theme

Optional only if useful:

- A2UI as schema influence
- CopilotKit for hotkey/approval/event wiring, but never as visible chat UI
- WebSocket/SSE transport after the in-process harness works
- SearXNG, Brave Search, or Scrapling later if Exa cost, limits, or coverage become blockers
- Browser action execution and SharkAuth automation after the read-only copilot demo lands

## Product Rules

- Do not build generic chat UI as the main experience.
- Do not hardcode final demo UI trees.
- Do not create runtime scenario profiles.
- Demo repeatability belongs in tests, fixtures, and reset controls, not fake harness output.
- The harness must start from page context, prompt, available tools, and primitive manifest.
- The MVP must stay read-only. Any mutating action plan is deferred or converted into user-facing guidance.
- No factual claim without source grounding, uncertainty, or an explicit "not verified" state.
- Generated UI must use validated primitives, not arbitrary HTML.
- The model should emit declarative UI plus styling intent, not raw styling. Renderer-owned primitives, host tokens, and design skills turn that intent into accurate, useful, beautiful interfaces.
- CT should feel pointer-native: overlays originate from selection, cursor, focused element, or active page region whenever possible.

Declarative UI fit:

```txt
fast style brief -> surface plan -> data model -> primitive tree -> validated renderer
```

`DECLARATIVE_UI.md` is the source of truth for this contract. A fast style planner may create a compact primordial style brief from the user prompt, intent, page context, and host theme. The principal CT agent then uses that brief to declare interface purpose, anchor, layout, style intent, interaction constraints, data, and primitives. The renderer owns real components, responsive behavior, host adaptation, and safety.

## Team Split

### User A: Harness Runtime

Owns the TypeScript harness.

Work:

- session interface with streaming input and async event output
- state machine
- intent classification
- planner boundary
- Exa-backed `web.search` / `web.fetch` tool interfaces, kept provider-neutral
- tool policy
- approval enforcement
- UI validation
- verification result handling
- Vitest tests for harness logic

Primary files:

- `frontend/src/harness/runtime/`
- `frontend/src/types/harness.ts`
- `frontend/src/types/ui.ts`

### User B: Page Perception And Context Bridge

Owns the browser context layer that makes CT feel like a copilot for the current page.

Work:

- selected text and visible text extraction
- URL, title, viewport, focused element, nearby text, and page-region anchors
- lightweight affordance summaries for context only
- host theme sampling
- anchor highlights and overlay placement metadata
- demo page context fixtures for verify, understand, assist, and respond scenes
- explicit deferral notes for action execution and SharkAuth automation

Primary files:

- `frontend/src/browser/`
- future extension/content bridge if needed

### User C: Overlay Stream Renderer

Owns the event consumer and generated UI rendering.

Work:

- consume harness events
- apply UI patches
- render `ClickthroughNode` trees through `PrimitiveRenderer`
- surface validation errors safely
- host style adaptation
- skeleton/progress-to-final transitions
- trust-boundary presentation for generated/grounded content
- Playwright checks for overlay behavior

Primary files:

- `frontend/src/renderer/`
- `frontend/src/renderer/stream/`
- `frontend/src/primitives/`
- `frontend/src/harness/useHarness.ts`

### User D: Integration, Acceptance, And Demo

Owns coherence and winning presentation.

Work:

- define acceptance checks for all four scenes
- create test/page fixtures only when needed
- verify each scene uses real harness output
- coordinate integration across Users A, B, and C
- add reset/replay controls that do not fake harness logic
- write final 2-4 minute script
- keep AG-UI streaming and MCP tool discovery visible in narration

Primary files:

- `frontend/src/demos/`
- `docs/team-kickoff/`
- `DEMO.md`
- test fixtures if needed

## Immediate Objectives

1. Make shared contracts compile.
2. Make the harness emit real typed events.
3. Make the page perception bridge produce useful context.
4. Add Exa-backed `web.search` and `web.fetch` tools behind generic interfaces.
5. Make the renderer consume events and apply primitive patches.
6. Wire one vertical slice end to end.
7. Expand to all four demo intents.
8. Add the Jarvis-like assist/navigate scene in place of SharkAuth execution.
9. Run build and browser checks.
10. Record a 2-4 minute demo with working code only.

## Web Search MVP

Use Exa for the MVP/hackathon search path. It is easy to integrate, built for agent workflows, and its free tier should be enough if we cap calls and cache demo queries.

Tool boundary:

```txt
web.search(query, options) -> ranked source results
web.fetch(url, options) -> clean text/highlights/metadata
```

Normalized source contract:

```txt
GroundedWebSource {
  title, url, publisher?, author?, publishedDate?, retrievedAt,
  snippet?, highlights[], quality?, freshness?,
  imageUrl?, faviconUrl?, media[],
  provider, providerResultId?
}
```

Provider plan:

- Default MVP provider: Exa Search API.
- Search evidence mode: use `contents.highlights` for token-efficient snippets.
- Visual evidence mode: normalize Exa `image`, `favicon`, and `contents.extras.imageLinks` into `imageUrl`, `faviconUrl`, and `media[]` for GenUI primitives.
- Known URL mode: use Exa Contents API or direct browser/readability fallback.
- People/company lookup: use Exa `people` and `company` categories where useful.
- LinkedIn/profile lookup: Exa has people/company search categories aimed at LinkedIn/profile discovery, but with restrictions. `people.includeDomains` only accepts LinkedIn domains, and `people`/`company` categories do not support date filters or `excludeDomains`.
- Cost control: small result counts, local cache for development/demo queries, and no repeated fresh calls during recording.
- Later fallbacks: SearXNG for OSS metasearch, Brave Search for reliable paid/free-credit fallback, Scrapling for hard page extraction/crawling.

Do not bake Exa into product architecture. Exa is one provider behind Clickthrough's generic web tools.

Renderer plan:

- Evidence sources may render a thumbnail, favicon, or text-only fallback.
- Rich visual layouts should use `ImageFrame`, `MediaFrame`, `CarouselFrame`, or `EvidenceSource` props from the normalized source contract.
- Images are source evidence, not decorative assets. Every web image must remain tied to a visible source URL or publisher.

Testing plan:

- Vitest owns harness, provider normalization, schema validation, read-only tool policy, and web evidence contract fixtures.
- Playwright owns visible overlay behavior, event streaming, host anchoring, responsive fit, and source image/fallback rendering.

## Key References

- `DEMO.md`: storyboard source of truth
- `UI_PRIMITIVES.md`: generated UI schema and primitive rules
- `DECLARATIVE_UI.md`: surface plan, style intent, and cursor-native UI contract
- `AGENT_LOOP.md`: agent loop architecture
- `HARNESS.md`: harness policies and tool execution model
- `STACK.md`: stack decisions
- `openspec/changes/core-demo-execution-plan/`: execution plan and specs
- `docs/team-kickoff/`: individual role briefs
