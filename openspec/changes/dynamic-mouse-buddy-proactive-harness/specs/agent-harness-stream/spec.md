## MODIFIED Requirements

### Requirement: Functional planning and tool loop
The system SHALL run a functional harness loop that can plan, call tools, incorporate tool results, update UI, and replan when needed.

#### Scenario: Iterative agent loop
- **WHEN** a run starts from a user prompt or promoted proactive insight
- **THEN** the harness MUST use the ported MI loop to iterate through planner/model steps, typed tool calls, tool results, UI/state events, and completion until the run is done or budget is exhausted

#### Scenario: MI tool decision routed through policy
- **WHEN** the model requests tools
- **THEN** the harness MUST route MI tool requests through the Clickthrough policy broker and execution chambers
- **AND** it MUST execute only registered Clickthrough tools and feed structured results back into the next MI step
- **AND** the browser and OS runtimes MUST NOT expose unrestricted shell, raw coordinate control, DOM mutation, credential, purchase, posting, or permission-changing tools

#### Scenario: Current frontend harness retired
- **WHEN** implementation reaches harness orchestration
- **THEN** the existing one-shot frontend harness MUST NOT remain the primary runtime
- **AND** useful page perception, context packet, primitive rendering, overlay positioning, and validation code MAY be converted into tools/adapters for the ported MI runtime

#### Scenario: Goal/check validation
- **WHEN** the harness generates a primitive tree
- **THEN** it MUST run validation and MAY run deterministic viewport-fit checks before emitting final UI
- **AND** failed checks MUST trigger repair or deterministic fallback rather than unsafe render

#### Scenario: Computer-use action loop
- **WHEN** a run needs to operate the computer through screenshot/CUA tools
- **THEN** the harness MUST plan against typed targets, permission tiers, action previews, and expected postconditions
- **AND** each mutating action MUST produce a verification step or receipt before the harness claims completion

#### Scenario: Raw CLI remains sandboxed
- **WHEN** a background agent or specialist requests terminal access
- **THEN** the harness MUST route it through a restricted command policy with allowlisted commands, working-directory bounds, budgets, and user approval for escalation
- **AND** raw shell access MUST never be exposed to browser content, arbitrary prompts, or untrusted page text

### Requirement: Obscura browser-worker chamber
The system SHALL use an isolated browser-worker chamber for agent browsing and replay work instead of replacing the user's active browser context.

#### Scenario: Agent needs rendered browsing
- **WHEN** MI needs to fetch, render, inspect, screenshot, or replay-check a page away from the user's live tab
- **THEN** the harness SHOULD route the request to a `browserWorker.*` tool backed by Obscura/CDP or a compatible adapter
- **AND** the worker MUST run with explicit domain, navigation, wall-clock, data, and storage budgets

#### Scenario: Active browser context remains authoritative
- **WHEN** the task depends on what the user currently sees, selected, hovered, focused, or authenticated into
- **THEN** the harness MUST prefer the active page/screen context provider over Obscura
- **AND** it MUST NOT import cookies, logged-in state, or active-page data into the worker without explicit scoped approval

#### Scenario: Worker replay before action proposal
- **WHEN** the harness wants confidence that a selector, navigation, or non-sensitive browser action will work
- **THEN** it MAY use the browser-worker chamber for a read-only replay check
- **AND** replay success MUST NOT substitute for user approval on the active page

### Requirement: Claude Code-style session event stream
The system SHALL expose a long-lived session interface with streaming input and typed async output events for state, UI patches, tool progress, approval, interruption, and results.

#### Scenario: Proactive insight event emitted
- **WHEN** the local insight scorer finds a high-confidence proactive suggestion
- **THEN** the harness or page bridge MAY emit an insight event that the renderer can display as a quiet buddy chip

#### Scenario: Insight promoted into run
- **WHEN** the user accepts a proactive insight
- **THEN** the session MUST treat it as normal user input with explicit prompt, anchor, and page context

#### Scenario: Activation boundary opens context
- **WHEN** the user activates Clickthrough with hotkey, push-to-talk, selected text, pointer grab, click, or accepted proactive chip
- **THEN** the session MAY request richer page/screen context for that run
- **AND** passive observation MUST remain local and bounded until one of those activation boundaries occurs

#### Scenario: Visible capture state
- **WHEN** the harness captures microphone input, page context, screenshots, crops, OCR, or accessibility metadata
- **THEN** the session MUST emit a visible capture/status event for the renderer
- **AND** the event MUST identify the scope of capture at a user-understandable level

### Requirement: Skill and delegation support
The system SHALL allow specialist prompting and optional bounded delegation without losing Clickthrough's browser safety contracts.

#### Scenario: Skill-style prompt module selected
- **WHEN** the classified intent is verify, understand, respond, summarize, or navigate
- **THEN** the harness MAY load a specialist prompt/module for that intent while preserving the same event and UI schemas

#### Scenario: Delegation is bounded
- **WHEN** the harness delegates specialist analysis
- **THEN** the delegated task MUST receive a bounded prompt, read-only tools, explicit budget, and structured return contract
- **AND** the parent harness MUST remain responsible for final UI validation and safety policy

#### Scenario: Background agent session
- **WHEN** the user explicitly starts a longer-running agent task
- **THEN** the harness MUST create a background session with objective, budget, tool tier, progress events, cancel control, and final review surface
- **AND** background work MUST remain separate from immediate pointer guidance so users can distinguish "explain this now" from "agent, go do work"

### Requirement: Permission-tiered OS companion policy
The system SHALL enforce explicit permission tiers for OS companion behavior.

#### Scenario: Tier determines available tools
- **WHEN** a run starts
- **THEN** the harness MUST assign a permission tier from local observation through approved execution
- **AND** tools outside the assigned tier MUST be unavailable to the planner

#### Scenario: Panic stop interrupts execution
- **WHEN** the user presses the stop control, cancels a background session, or invokes the configured panic hotkey
- **THEN** the harness MUST stop pending actions, close active approval prompts, and emit an interrupted result
- **AND** no queued computer-use action MAY continue after the stop event
