# Clickthrough Stack Decision

## Hackathon Scope Update

The live hackathon path is a read-only web copilot. It can observe page context, search/fetch sources, explain, verify, summarize, draft, compare, highlight, and prepare next steps. It must not click, submit, post, create credentials, change permissions, or mutate account state.

Browser action execution, SharkAuth automation, and full backend transport remain post-hackathon architecture. User B should focus on page perception, anchors, host theme, and context packets.

## Current Decision

This is the stack direction for the hackathon prototype.

## Frontend

Use:

- **Vite**
- **React**
- **TypeScript**

The product should behave like a browser extension or extension-like injected overlay. The main user-facing surface is not a website. It is an overlay renderer that appears on top of the current page.

## Overlay Renderer

Use a React overlay renderer injected into the active page.

The overlay should be variable. It is not one fixed sidebar or one fixed dashboard. Clickthrough should choose the overlay shape based on intent, page context, available space, and risk level.

Overlay modes:

- **Inline prompt**: tiny invocation bar near the user's focus.
- **Anchored popover**: small generated UI attached to a tweet, paragraph, form, or message.
- **Side panel**: larger generated dashboard when the task needs evidence, diagrams, or long-running state.
- **Spotlight overlay**: dim the page and highlight the relevant DOM region.
- **Fullscreen workbench**: rare mode for complex visual explanation or multi-step workflows.
- **Native insertion**: generated controls placed near matching host UI when it should feel like the page grew the missing form.

Responsibilities:

- mount Clickthrough UI without navigating away
- anchor overlays to selected DOM elements
- preserve page scroll and interaction where possible
- render streamed primitive UI trees
- manage prompt bar, skeletons, panels, diagrams, forms, and approval gates
- visually adapt generated components to the host page

## Component Styling

Styling is not locked yet.

Decision to make after Open Design output:

- Tailwind CSS
- CSS modules
- vanilla CSS with CSS variables
- Panda/vanilla-extract style token system
- hybrid approach

Current bias:

Use CSS variables as the stable host-adaptation layer, regardless of component styling choice.

The renderer should map sampled page styles into variables such as:

- `--ct-font-family`
- `--ct-text`
- `--ct-muted`
- `--ct-surface`
- `--ct-border`
- `--ct-accent`
- `--ct-radius`
- `--ct-density`

## Generative UI Protocol

Use **AG-UI** as the primary runtime event protocol for streaming agent state into the UI.

Use AG-UI for:

- intent received
- page context extracted
- claim or selection detected
- search/tool progress
- skeleton UI sections
- partial UI tree updates
- approval requests
- execution progress
- final verification/result state

## Primitive Schema

Use Clickthrough's own primitive schema from `UI_PRIMITIVES.md`.

The agent emits:

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

The renderer validates and maps those nodes to React components.

This keeps Clickthrough from becoming arbitrary agent-generated HTML.

## Agent And Server

Use a full backend. Clickthrough needs a real agent/runtime layer behind the browser overlay.

The browser overlay is the interaction surface. The backend is the reasoning, tool, memory, and orchestration layer.

Backend responsibilities:

- receive page context, selected text, DOM maps, and user intent
- run LLM/agent orchestration
- stream AG-UI events back to the overlay
- call web search and source-fetch tools
- manage MCP app/tool connections where useful
- decide which UI primitive tree to generate
- validate and sanitize generated UI schema before sending it to the browser
- plan browser actions from DOM capability maps
- require approval before actions
- verify completed actions
- store lightweight session memory and preferences
- keep API keys and sensitive credentials out of the browser content script

Do not overbuild:

- user accounts
- admin dashboard
- database-heavy architecture
- generic workflow platform

The backend should exist, but it should serve the demo directly. Spend complexity on agent orchestration, browser intelligence, and streaming generated UI, not SaaS infrastructure.

Recommended backend shape:

- Node/TypeScript service to match the frontend stack.
- HTTP endpoint for initial intent requests.
- Server-sent events or WebSocket stream for AG-UI events.
- Tool layer for web search, source fetch, DOM action planning, and optional MCP integrations.
- Small persistence layer only if needed for memory or demo state.

## Browser Tools

Browser tools are first-class. They may matter more than MCP for the demo.

The core browser layer needs a deep DOM scanner.

Scanner responsibilities:

- collect visible text and selected text
- identify interactive elements
- identify forms, buttons, links, menus, tabs, tables, and dialogs
- infer labels and accessible names
- detect disabled, hidden, and offscreen states
- build a capability map of what the page can do
- produce stable element references for approved actions
- sample host page visual style
- identify anchor targets for overlays

For UI abstraction scenes, the scanner is the magic. It lets Clickthrough say:

> This page can create API keys, edit scopes, invite users, export reports, or send messages. Which intent do you mean?

## Tools And MCP

Use **MCP Apps** where they help quickly.

Likely MCP/tool categories:

- web search
- source fetch
- public profile lookup
- document/PDF extraction
- SharkAuth action bridge if useful

But for the hackathon demo, browser tools and DOM intelligence are more important than broad MCP coverage.

## CopilotKit

Use **CopilotKit** only if it accelerates:

- hotkey prompt
- agent state wiring
- action callbacks
- human approval flow

Do not let CopilotKit shape the visible product into chat.

## Open Design

Use Open Design next to generate the primitive visual system from `OPEN_DESIGN_PROMPT.md`.

Open Design should produce:

- primitive component visuals
- four composed overlay examples
- interaction states
- design tokens
- host-adaptation guidance

After Open Design, decide the styling implementation approach.

## Build Priority

The stack should optimize for the demo illusion:

1. The user never leaves the page.
2. The overlay appears instantly.
3. Skeleton sections stream in as the agent works.
4. The UI is visibly generated for the specific intent.
5. The generated components borrow the page's style.
6. Actions require approval.
7. Results are verified in the page.
