# Clickthrough

**The screen should grow the interface you need at the point you need it.**

Clickthrough is a runtime interface layer for the computer. It observes the current app or page, tracks the user's point of intent, and renders the exact UI needed to verify, understand, navigate, compose, decide, or act without dragging context into a chat window.

It is not a chatbot, sidebar, dashboard, or separate assistant app. The product is the generated interface itself.

## Current Direction

Clickthrough ships as a lightweight cross-platform desktop companion, not as a browser extension.

Locked shipping shape:

```txt
Wails / Go desktop shell
  -> tray, global hotkey, overlay windows, screen/OS adapters
  -> policy broker, cancellation, deadlines, budgets, panic stop
  -> TypeScript MI runtime
  -> React generated overlay UI
  -> Obscura browser-worker chamber
  -> optional browser connector later
```

Browser integration is a context provider, not the product container.

Clickthrough is being rebuilt by porting `mi` fully into the Clickthrough runtime, then constraining its powerful execution layer behind browser/OS policy gates.

`mi` proves the right harness shape:

```txt
model turn -> tool calls -> execute tools -> feed results back -> repeat
```

Clickthrough keeps MI's full autonomous loop as the runtime spine, then patches execution so raw power is routed through scoped browser/OS-safe capabilities:

```txt
screen signals + user intent
  -> bounded agent loop
  -> typed browser/OS/web capabilities
  -> surface plan
  -> validated primitive tree
  -> dynamic interface at the user's point of intent
```

The visible product target is the **AI pointer companion**:

- starts near cursor, selection, hover target, or focused element
- shows quiet proactive insight chips when the page suggests useful help
- expands into inline prompt, anchored popover, spotlight, side panel, or workbench only when needed
- preserves the current app/page and user flow
- keeps Clickthrough trust markers visible

The pointer should follow intent anchors, not raw pixels. It may trail the cursor lightly, but it should snap to meaningful screen entities and stay out of the way.

## Product References

Google DeepMind's AI Pointer articulates the right interaction principles: maintain flow, use pointing as context, make "this" and "that" meaningful, and turn pixels into actionable entities.

Clicky validates the near-term product shape: an AI buddy next to the cursor on Mac, voice-first questions, screen awareness, walkthrough guidance, and background agents.

A separate Chrome product also called Clicky gives browser-specific constraints worth borrowing without conflating the two products: push-to-talk, point at the actual element, combine screenshot with DOM structure, use session-only memory, and avoid background scraping.

## Operating Boundaries

Clickthrough is proactive and action-capable, but permissioned.

Default capabilities:

- observe page context
- observe active app/window context
- capture local screenshots or cropped regions
- scan visible DOM and page affordances
- track cursor, hover, focus, selection, and viewport
- search and fetch web sources
- explain, verify, summarize, compare, draft, and prepare next steps
- highlight page regions
- render validated Clickthrough primitives

Allowed after explicit approval and target verification:

- clicking, filling, and submitting on verified DOM targets
- clicking, typing, scrolling, dragging, and hotkeys on verified OS targets
- posting or sending prepared user-approved content
- credential and API-key workflows
- permission changes
- purchases or destructive actions with elevated confirmation

Blocked from raw model access:

- arbitrary shell access
- arbitrary JavaScript eval
- arbitrary generated HTML/CSS
- unscoped network tools
- unverified DOM mutation
- silent account mutation
- raw coordinate control without target verification

The model requests actions. The harness scopes, approves, executes, and verifies them.

## Core Architecture

The harness should be a real MI port, not a light imitation and not a refactor of the current frontend harness.

Port from MI:

- simple iterative model/tool loop
- tool schemas visible to the model
- tool results fed back into the next turn
- skill-style prompt modules
- bounded delegation for specialist tasks
- goal/check loops for validation
- streaming model/tool orchestration
- tool loading and dispatch shape
- session loop ergonomics

Salvage from the current frontend harness:

- DOM/page perception tools that are already useful
- typed page/context packets
- primitive UI contracts
- overlay renderer ideas
- host theme adaptation
- fit/validation ideas

Discard from the current frontend harness:

- one-shot classify/generate flow
- fixed panel mental model
- hardcoded intent-to-mode switch
- any architecture that makes CT a frontend-only assistant loop

Patch after porting MI:

- tools return structured data, not raw strings
- every state change streams as a typed event
- UI is validated against Clickthrough primitives
- browser tools are capability-scoped and approval-gated
- safety policy lives outside model output
- generated surfaces originate from cursor/selection/hover/focus/screen region
- screenshots are mediated by a capture broker, redactor, sensitivity classifier, and policy gate
- raw CLI, browser automation, and OS actions are routed through permissioned execution chambers

## Obscura Execution Strategy

Obscura is the execution-containment reference for browser automation. It is a lightweight Rust headless browser with V8 JavaScript execution, Chrome DevTools Protocol support, Playwright/Puppeteer compatibility, worker-based scraping, input dispatch, cookies/network handling, and optional stealth/tracker blocking.

For Clickthrough, Obscura should inspire isolated browser workers:

- run web investigation and page automation away from the user's active browser
- expose CDP/Playwright-compatible browser tools to MI through a policy broker
- use worker-level budgets for navigation time, domains, actions, and data extraction
- separate read-only investigation from approved mutating actions
- keep stealth/scraping power out of default user-page automation unless explicitly allowed

## Active Sources Of Truth

- [`AGENTS.md`](./AGENTS.md): agent working rules and product north star.
- [`BRIEF.md`](./BRIEF.md): current team brief and scope.
- [`openspec/changes/dynamic-mouse-buddy-proactive-harness`](./openspec/changes/dynamic-mouse-buddy-proactive-harness): active OpenSpec change.
- [`HARNESS.md`](./HARNESS.md): full MI-port harness with patched browser/OS execution policy.
- [`STACK.md`](./STACK.md): current implementation stack.
- [`UI_PRIMITIVES.md`](./UI_PRIMITIVES.md): primitive schema and renderer contract.
- [`DEMO.md`](./DEMO.md): demo storyboard.

Old audit reports and stale planning docs live in [`docs/archive/old-direction`](./docs/archive/old-direction).

## One-Sentence Pitch

Clickthrough is a proactive browser agent that turns cursor intent into safe, generated interface.
