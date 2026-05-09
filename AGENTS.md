# Clickthrough Agent Notes

## Product North Star

Clickthrough is a runtime interface layer for the web.

It observes the current browser context, understands the user's intent, and generates the exact overlay UI needed to verify, understand, navigate, compose, or respond without making the user leave the page.

Do not treat Clickthrough as a chatbot, sidebar, or separate assistant app. The product is the generated interface itself.

## Hackathon Frame

The Generative UI Global Hackathon theme is:

> Agentic Interfaces: build UIs that agents render at runtime.

The handbook emphasizes:

- working generative UI prototype by 6 PM
- pushing past the chat bubble
- no "chatbot in a trench coat"
- show working code, no slide decks
- 2-3 minute demo
- protocols to list: A2UI, AG-UI, CopilotKit, MCP Apps, or other

Our project should clearly land in these tracks:

- **Kill the Dashboard**: generate the exact visualization, form, or control surface needed in the moment.
- **The Copilot That Ships**: render UI for users to confirm, tweak, prepare, and continue inline.
- **No Designer, No Problem**: the agent generates user-facing interface at runtime.

## Demo Direction

Use `DEMO.md` as the storyboard source of truth.

The demo proves four intent categories:

- **Verify**: Twitter/X claim verification dashboard.
- **Understand**: OAuth PKCE PDF visual explainer.
- **Assist**: Jarvis-like page copilot surface that understands the current page and prepares the next move without taking over the browser.
- **Respond**: social-context explanation and reply assistant.

## UI Primitive Source Of Truth

Use `UI_PRIMITIVES.md` as the design and schema source of truth for generated UI.

The agent should compose controlled primitives instead of emitting arbitrary UI.

Core principle:

> The agent decides what interface should exist. The renderer decides how to make it safe, native-feeling, and consistent.

## Agent Loop Source Of Truth

Use `AGENT_LOOP.md` as the architecture source for Clickthrough's model-agnostic agent harness.

Use `HARNESS.md` as the concrete implementation source for harness policies, read-only tool execution, approval boundaries, compaction, hooks, budget limits, MCP loading, and verification.

Clickthrough should be its own browser-native intent agent. It can delegate to specialist tools or agents, but the user talks to CT and CT owns the loop.

The harness should make weaker models useful and stronger models excellent through:

- explicit state machine
- typed context packets
- bounded memory
- typed tool contracts
- validated UI schema
- approval boundaries
- deterministic execution
- verification of grounded claims, source evidence, and generated UI state

## GenUI Stack

Use `STACK.md` as the source of truth for stack decisions.

Current preferred hackathon stack:

- Vite + React + TypeScript.
- React overlay renderer injected into the active page.
- AG-UI for runtime event streaming.
- Clickthrough primitive schema from `UI_PRIMITIVES.md`.
- Lightweight page perception bridge as a first-class subsystem.
- MCP Apps where useful, but browser tools are likely more important for the demo.
- CopilotKit only if it accelerates hotkey, state, callbacks, or approval flow without turning the product into chat.
- TypeScript harness for agent orchestration, web search, tool calls, schema validation, UI planning, verification, and bounded memory. Full backend transport is post-MVP.
- Variable overlay modes: inline prompt, anchored popover, side panel, spotlight, fullscreen workbench, and native insertion.
- SharkAuth/browser action execution is deferred until after the hackathon.

### Runtime UI Protocol

Use **AG-UI** as the primary event protocol for streaming agent state into the UI.

Why:

- good fit for progressive generated UI
- supports visible "agent is building the interface" moments
- maps well to skeletons, progress, partial UI trees, tool progress, clarification requests, and final UI state

### Agent-To-UI Schema

Use a Clickthrough-owned primitive schema based on `UI_PRIMITIVES.md`.

The agent should emit structured UI nodes:

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

The renderer validates these nodes and maps them to real components.

### App And Tool Discovery

Use **MCP Apps** where useful for tool/app discovery and external capabilities.

For the demo, MCP can be framed as the way Clickthrough discovers or invokes tools such as:

- web search
- profile lookup
- source fetch
- browser/page tools
- browser/page context tools

### Frontend Integration

Use **CopilotKit** if it accelerates the browser-side agent UI loop, especially:

- hotkey prompt
- agent state wiring
- follow-up callbacks
- human approval flow

Do not let CopilotKit force the product into a chat interface. The visible product must remain generated overlay UI.

### A2UI

Evaluate **A2UI** as a possible schema/protocol influence for agent-rendered interface payloads.

If it gives us useful conventions quickly, map Clickthrough primitives onto it. If it slows the demo down, keep the primitive schema internal and list AG-UI/MCP/CopilotKit as the core protocols.

## Browser Layer

Clickthrough should behave like a browser extension or extension-like injected overlay.

Required capabilities:

- hotkey or voice-style invocation
- read selected text and visible page context
- inspect lightweight page affordances for context and anchoring
- anchor overlays to page elements
- preserve page position
- render generated UI without navigating away
- prepare safe next steps, drafts, explanations, or evidence without mutating the page during the hackathon MVP

Deferred post-hackathon capabilities:

- execute approved actions against the current page
- verify mutating browser action results

## Host Style Adaptation

Generated overlays should borrow from the current page:

- font
- color roles
- radius
- density
- buttons
- inputs
- borders
- shadows

But Clickthrough-controlled trust boundaries must remain visibly distinct from host styling.

## Safety Rules

- Hackathon MVP is read-only: do not execute page mutations, credential creation, posting, deleting, buying, or permission changes.
- Post-MVP action execution must never run page actions without approval.
- Always show risk for destructive, permission-changing, external, or sensitive recommendations.
- Always expose uncertainty for verification.
- Avoid claiming medical, legal, or financial certainty.
- Do not render arbitrary unvalidated HTML from the agent.
- Do not hide source quality or missing evidence.

## Working Agreement For Agents

- Keep the demo storyboard coherent before optimizing internals.
- Do not build generic chat UI as the main experience.
- Do not make all overlays look the same.
- Prefer visible progressive generation: skeleton, progress, partial sections, final UI.
- Favor a few jaw-dropping polished flows over broad but shallow coverage.
- If implementation tradeoffs are needed, preserve the illusion that the browser is reshaping itself around user intent.
