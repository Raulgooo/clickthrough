# Implementation & Tech Stack Brief

> **Clickthrough** — a runtime interface layer for the web.
> The browser quietly reshapes itself around what you meant.

---

## Pitch-Ready One-Liner

Clickthrough is a **browser-native intent agent** that reads the page you are on, understands what you want, and **generates the exact overlay UI** — dashboards, diagrams, evidence panels, reply composers — without ever navigating away.

It is not a chatbot. It is not a sidebar. It is the interface itself, rendered at runtime.

---

## Stack at a Glance

| Layer | Technology | Why It Matters |
|-------|-----------|----------------|
| **Build Tool** | [Vite 6](https://vitejs.dev/) | Lightning-fast HMR and a clean multi-entry build for browser extension artifacts. |
| **UI Library** | [React 18](https://react.dev/) | Battle-tested component model for dynamically rendering agent-emitted UI trees. |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) | Strict contracts across primitives, harness events, and tool results — zero ambiguity at runtime. |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) + CSS Variables | Utility-first speed with a host-adaptation layer that lets overlays borrow the page's own look. |
| **DOM Capture** | [html2canvas](https://html2canvas.hertzen.com/) | Viewport snapshotting so the agent can "see" the page context it is assisting. |
| **Class Utilities** | [clsx](https://github.com/lukeed/clsx) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Clean conditional classes without style collisions. |

---

## Core Protocols & Integrations

| Protocol | Role in Clickthrough |
|----------|----------------------|
| **AG-UI** | The primary event protocol. Streams agent state (tool progress, partial UI, skeletons, approvals) into the overlay in real time. |
| **MCP Apps** | Tool and capability discovery layer. Lets Clickthrough find and invoke external tools (web search, profile lookup, source fetch) without hard-coding integrations. |
| **OpenRouter** | LLM provider abstraction. Keeps the harness model-agnostic — swap models without touching the loop. |
| **Exa** | Web search and source retrieval. Powers the "Verify" and "Understand" demos with grounded evidence. |

**Evaluated but not core:** A2UI (schema influence), CopilotKit (hotkey/acceleration only). We kept the primitive schema internal so the product stays a generated overlay, not a chat wrapper.

---

## Architecture in 30 Seconds

```
User selects text / presses hotkey
        │
        ▼
┌──────────────────────────────┐
│  Browser Extension Content   │  ← DOM Scanner + Host Theme Sampler
│  Script (content.tsx)        │     build the PageContextPacket
└──────────────────────────────┘
        │
        ▼
┌──────────────────────────────┐
│  Agent Harness (useHarness)  │  ← 14-state machine: observe → classify
│  - Intent classification       → plan → run tools → generate UI
│  - Budget & memory enforcement → await approval → act → verify
│  - Approval gates & validation
└──────────────────────────────┘
        │  AG-UI Events (SSE / WebSocket)
        ▼
┌──────────────────────────────┐
│  React Overlay Renderer      │  ← PrimitiveRenderer maps
│  - 70+ typed primitives        ClickthroughNode trees to
│  - HostStyleAdapter            real components
│  - Progressive patch-based     with host page styling
│    UI assembly
└──────────────────────────────┘
```

---

## The Primitive System

Clickthrough does **not** render arbitrary HTML from the agent. It renders **controlled primitives** — 70+ typed React components across 13 categories:

- **Shell** — `OverlayRoot`, `PromptBar`, `PageDimmer`, `AnchorHighlight`
- **Layout** — `Panel`, `Stack`, `Grid`, `SplitPane`, `Rail`
- **Text & Status** — `Heading`, `BodyText`, `StatusPill`, `Callout`, `InlineQuote`
- **Inputs** — `Button`, `TextField`, `Toggle`, `SegmentedControl`, `Slider`, `CheckboxRow`
- **Data & Evidence** — `ClaimCard`, `IdentityCard`, `EvidenceSource`, `SourceTrail`, `ConclusionCard`
- **Visualization** — `Timeline`, `SequenceDiagram`, `Stepper`, `ComparisonTable`
- **Action** — `ApprovalGate`, `ExecutionLog`, `ScopeMatrix`, `VerificationResult`
- **Safety** — `RiskSummary`, `UncertaintyNote`, `PrivateModeBadge`, `SensitiveContextGuard`
- **State** — `Skeleton`, `ProgressList`, `EmptyState`, `ErrorState`
- **Trust** — `SecurityBoundary`, `TrustIndicator`, `ScanLine`
- **Frames** — `ImageFrame`, `ChartFrame`, `CodeFrame`
- **Navigation** — `Tabs`, `Accordion`, `Breadcrumb`
- **Agent** — `AgentStateIndicator`, `BudgetBar`, `ToolProgressCard`

The agent emits a typed `ClickthroughNode` tree. The renderer validates it and maps it to real components. This is how we keep the UI **safe, consistent, and native-feeling** no matter what the LLM generates.

---

## What the Demos Prove

| Demo | Intent Category | What It Shows |
|------|----------------|---------------|
| **Verify** (Twitter/X) | `verify` | Real-time claim verification dashboard with identity matching, source search, contradiction detection, and a final verdict card. |
| **Understand** (OAuth PKCE) | `understand` | Visual explainer using sequence diagrams, steppers, and toggles to turn a dense spec into an interactive learning surface. |
| **Assist** (Jarvis-like copilot) | `act` | Page-aware copilot that reads dense content and prepares the next move without taking over the browser. |
| **Respond** (Social reply) | `respond` | Context-aware explanation and reply composer that understands the thread and drafts a response inline. |

---

## Why This Stack Wins for the Hackathon

1. **Vite + React + TypeScript** — The fastest path from idea to working demo without fighting the tooling.
2. **AG-UI over raw WebSocket** — Gives us "agent is building the interface" moments for free: skeletons, progress bars, partial sections, tool status.
3. **Internal Primitive Schema** — Keeps us out of "chatbot in a trench coat" territory. The visible product is generated overlay UI, not a conversation log.
4. **Model-Agnostic Harness** — We can demo on cheap models and ship on strong ones without rewriting the loop.
5. **Host Style Adaptation** — Overlays borrow fonts, colors, radius, and density from the current page so they feel native, but trust boundaries stay visually distinct.
6. **Read-Only MVP** — Safe to demo. No accidental tweets, purchases, or permission changes. The architecture for action execution is already spec'd and ready for post-hackathon unlock.

---

## Repo Map for Judges

```
frontend/src/
  browser/          ← Page perception bridge (DOM scanner, theme sampler, action executor)
  harness/          ← Agent state machine, runtime backend integration, approval flow
  renderer/         ← Overlay mount, primitive renderer, host style adapter, AG-UI stream
  primitives/       ← 70+ React components (the building blocks of generated UI)
  demos/            ← 7 demo scenarios mapping to the hackathon storyboard
  types/            ← Strict TypeScript contracts for primitives, harness events, and UI patches
```

Key docs at repo root:
- `DEMO.md` — the 2-4 minute demo storyboard
- `UI_PRIMITIVES.md` — the design system and schema source of truth
- `AGENT_LOOP.md` — the model-agnostic harness architecture
- `HARNESS.md` — concrete implementation of policies, budgets, approvals, and verification
- `STACK.md` — the original stack decision log

---

## Safety & Trust by Design

- **Approval gates** block destructive, external, permission-changing, or sensitive actions until the user explicitly confirms.
- **Uncertainty notes** expose confidence levels and missing evidence.
- **Risk summaries** surface danger before any action is taken.
- **Hackathon MVP is strictly read-only** — no page mutations, no credential creation, no posting, no buying.

---

## Built For

- **Kill the Dashboard** — Generate the exact visualization, form, or control surface needed in the moment.
- **The Copilot That Ships** — Render UI for users to confirm, tweak, prepare, and continue inline.
- **No Designer, No Problem** — The agent generates user-facing interface at runtime.

---

*Clickthrough is a working generative UI prototype for the Generative UI Global Hackathon. Working code, no slide decks.*
