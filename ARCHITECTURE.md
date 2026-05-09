# Clickthrough Architecture

## System Map

```txt
┌─────────────────────────────────────────────────────────────────────────────┐
│                                Browser Page                                  │
│                                                                             │
│   Any current site: Twitter/X, PDF reader, SharkAuth, chat, docs, CRM        │
│                                                                             │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                    Clickthrough Content Layer                        │   │
│   │                                                                     │   │
│   │  ┌──────────────┐   ┌──────────────┐   ┌────────────────────────┐  │   │
│   │  │ Hotkey /     │   │ Overlay      │   │ Page Bridge            │  │   │
│   │  │ Prompt Bar   │──▶│ Mount        │◀─▶│ backend + content      │  │   │
│   │  └──────────────┘   └──────────────┘   └────────────────────────┘  │   │
│   │                              │                                      │   │
│   │                              ▼                                      │   │
│   │  ┌──────────────────────────────────────────────────────────────┐  │   │
│   │  │ Variable Overlay Renderer                                    │  │   │
│   │  │                                                              │  │   │
│   │  │ inline prompt | anchored popover | side panel | spotlight    │  │   │
│   │  │ fullscreen workbench | native insertion                       │  │   │
│   │  └──────────────────────────────────────────────────────────────┘  │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ intent + page context
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Page Perception Layer                              │
│                                                                             │
│   ┌─────────────────────────────┐      ┌────────────────────────────────┐   │
│   │ DOM Scanner                 │      │ Vision Scanner                 │   │
│   │                             │      │                                │   │
│   │ visible text                │      │ viewport screenshot            │   │
│   │ selected text               │      │ visual hierarchy               │   │
│   │ forms/buttons/links         │      │ user focus estimate            │   │
│   │ labels/accessibility names  │      │ layout regions                 │   │
│   │ stable element IDs          │      │ charts/images/canvas/PDF view  │   │
│   │ bounding boxes              │      │ host visual style cues         │   │
│   │ host CSS sampling           │      │ visual fit verification        │   │
│   └──────────────┬──────────────┘      └───────────────┬────────────────┘   │
│                  │                                      │                    │
│                  └──────────────┬───────────────────────┘                    │
│                                 ▼                                            │
│                      ┌─────────────────────┐                                │
│                      │ PageContextPacket   │                                │
│                      │                     │                                │
│                      │ DOM truth +         │                                │
│                      │ vision context      │                                │
│                      └─────────────────────┘                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ structured context
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend Harness                                 │
│                                                                             │
│   ┌─────────────┐   ┌──────────────┐   ┌────────────────┐                  │
│   │ Memory      │──▶│ Intent       │──▶│ Planner        │                  │
│   │ session/site│   │ Classifier   │   │ UI + tools +   │                  │
│   │ user prefs  │   │ risk + mode  │   │ action plan    │                  │
│   └─────────────┘   └──────────────┘   └───────┬────────┘                  │
│                                                 │                           │
│                                                 ▼                           │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │ Agent Loop                                                           │   │
│   │                                                                     │   │
│   │ observe → recall → classify → plan → generate UI → tools → approve  │   │
│   │ → act → verify → remember                                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                 │                           │
│        ┌──────────────────┬─────────────────────┼──────────────────┐       │
│        ▼                  ▼                     ▼                  ▼       │
│ ┌──────────────┐  ┌──────────────┐      ┌──────────────┐  ┌──────────────┐ │
│ │ Tool         │  │ UI Schema    │      │ Approval     │  │ Verification │ │
│ │ Registry     │  │ Validator    │      │ Gatekeeper   │  │ Engine       │ │
│ └──────┬───────┘  └──────┬───────┘      └──────┬───────┘  └──────┬───────┘ │
│        │                 │                     │                 │         │
│        ▼                 ▼                     ▼                 ▼         │
│ web.search        ClickthroughNode       user approval       DOM/web/API    │
│ web.fetch         primitive tree         risk summary        result checks  │
│ pdf.extract       action bindings        edit/cancel         evidence       │
│ mcp.callTool      safety checks          approval result     final state    │
│ memory.write                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ AG-UI style event stream
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Generated UI Runtime                               │
│                                                                             │
│   ┌──────────────────────┐     ┌────────────────────────────────────────┐   │
│   │ HarnessEvent Stream  │────▶│ Primitive Renderer                     │   │
│   │                      │     │                                        │   │
│   │ state.changed        │     │ OverlayRoot, Panel, PromptBar          │   │
│   │ ui.patch             │     │ EvidenceSource, SequenceDiagram        │   │
│   │ tool.started         │     │ GeneratedForm, ApprovalGate            │   │
│   │ tool.finished        │     │ ExecutionLog, VerificationResult       │   │
│   │ approval.requested   │     │ Skeleton, ProgressList, ErrorState     │   │
│   │ result               │     └────────────────────────────────────────┘   │
│   └──────────────────────┘                         │                       │
│                                                    ▼                       │
│                                   ┌─────────────────────────────────────┐   │
│                                   │ Host Style Adapter                  │   │
│                                   │                                     │   │
│                                   │ CSS variables from current page     │   │
│                                   │ font, color, radius, density        │   │
│                                   │ controls, borders, shadows          │   │
│                                   └─────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Principle

DOM is the source of truth for action.

Vision is the source of truth for visual understanding.

The harness merges both before asking the model to plan or generate UI.

## Major Pieces

## 1. Browser Extension / Content Layer

Owns everything that happens inside the active page.

Responsibilities:

- listen for hotkey or prompt invocation
- collect selected text and focused element
- mount and unmount the Clickthrough overlay
- preserve page scroll and interaction
- receive streamed UI patches
- render generated primitives
- execute approved browser actions
- report action results back to the backend

Files likely live under:

```txt
extension/src/content/
extension/src/overlay/
```

## 2. DOM Scanner

Produces a compact structural map of the page.

Use for:

- exact text extraction
- forms, buttons, links, inputs, tables, menus, dialogs
- accessible names and labels
- stable element references
- action targeting
- verification after actions

Do not send raw DOM to the model. Send summarized, ranked, relevant elements.

## 3. Vision Scanner

Produces visual understanding from a screenshot or viewport capture.

Use for:

- layout understanding
- visual hierarchy
- user focus estimation
- PDF/canvas/image/chart interpretation
- modal/toast/overlay detection
- host visual style cues
- checking whether generated UI fits the page

Do not use vision as the primary source for clicking when DOM is available.

## 4. Backend Harness

The backend is the agent brain and safety layer.

Responsibilities:

- classify user intent
- decide overlay mode
- run tool calls
- manage memory
- validate generated UI schema
- require approval before impact
- stream events back to the overlay
- verify completion

It should be model-agnostic. Better models improve quality, but the harness enforces structure.

## 5. Tool Registry

Typed tools available to the harness.

Core tools:

```txt
dom.scan
dom.highlight
dom.click
dom.fill
dom.select
dom.waitFor
screenshot.capture
vision.inspect
web.search
web.fetch
pdf.extract
mcp.listTools
mcp.callTool
memory.read
memory.write
ui.validate
```

Read-only tools can run in parallel.

Mutating tools must run sequentially and usually require approval.

## 6. Primitive Renderer

Renders validated `ClickthroughNode` trees.

The model emits structured primitives, not arbitrary HTML.

Example:

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

The renderer maps primitives to React components.

## 7. Host Style Adapter

Samples current page styles and maps them into Clickthrough variables.

Examples:

```txt
--ct-font-family
--ct-text
--ct-muted
--ct-surface
--ct-border
--ct-accent
--ct-radius
--ct-density
```

Generated UI should feel native to the host page, but approval gates and sensitive actions must remain visibly Clickthrough-controlled.

## 8. Approval And Action Execution

Any action with real impact requires approval.

Examples:

- create API key
- send message
- change settings
- submit form
- delete data
- change permissions

Execution uses browser action plans:

```txt
click element
fill field
select option
wait for condition
verify result
```

No success claim without verification.

## 9. Memory

Start small.

Memory tiers:

- active run state
- last 20 session turns
- site-specific workflow notes
- user preferences

Memory should help the next action, not become a second product.

## Demo Data Flow

## Verify

```txt
User: "Hey CT, is this true?"
  ↓
DOM scan identifies tweet text
Vision confirms visible claim and context
Backend classifies verify intent
Web tools search sources
UI stream renders skeleton evidence dashboard
Sources patch into UI
Verdict renders with uncertainty
```

## Understand

```txt
User: "CT, explain this visually."
  ↓
DOM/PDF extraction gets selected text
Vision confirms visible paragraph and document layout
Backend classifies understand intent
UI stream renders visual explainer
Sequence diagram and stepper patch in
User toggles with/without PKCE
```

## Act

```txt
User: "Create a full-permissions API key."
  ↓
DOM scanner builds capability map
Vision reads dashboard layout and likely insertion point
Backend classifies high-risk action intent
UI stream renders generated form + risk summary
Approval gate pauses execution
User approves
Browser action plan executes
Verification confirms key exists
```

## Respond

```txt
User: "What does that mean and what do I say?"
  ↓
DOM scan captures selected message only
Vision confirms chat context
Backend classifies respond intent
UI stream renders private response helper
Drafts and tone controls appear
Sending requires explicit approval
```

## Implementation Priority

```txt
1. Shared TypeScript contracts
2. Extension overlay mount
3. DOM scanner
4. Backend harness event stream
5. Primitive renderer integration
6. Vision screenshot + inspect tool
7. Scenario-specific demo tools
8. Approval/action/verification loop
```

## Ownership Split

```txt
Agent / teammate A: primitive renderer and UI states
Agent / teammate B: extension shell and overlay mount
Agent / teammate C: DOM scanner + host style adapter
Agent / teammate D: backend harness + tools + event stream
```

## Non-Goals For First Demo

```txt
user accounts
full memory product
generic automation platform
full MCP app store
multi-browser support
perfect universal page automation
```

The demo should prove the loop, not the entire future product.

