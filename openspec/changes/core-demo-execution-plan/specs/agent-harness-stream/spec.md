## ADDED Requirements

### Requirement: Explicit run state machine
The system SHALL execute Clickthrough runs through explicit harness states and stream state transitions to the overlay.

#### Scenario: Run starts
- **WHEN** a user intent is submitted
- **THEN** the harness MUST emit state transitions for receiving intent, observing page, classifying intent, planning, generating UI, and completed or failed

#### Scenario: Mutating run is deferred
- **WHEN** an intent is classified as a mutating action in the hackathon MVP
- **THEN** the harness MUST block execution and generate safe guidance, a checklist, or a deferred-action state

### Requirement: Functional planning and tool loop
The system SHALL run a functional harness loop that can plan, call tools, incorporate tool results, update UI, and replan when needed.

#### Scenario: Planner requests read-only tools
- **WHEN** a run requires page context, source search, PDF extraction, or memory lookup
- **THEN** the harness MUST call typed tools and incorporate structured tool results into the next UI or plan step

#### Scenario: Tool failure is recoverable
- **WHEN** a tool returns a failed, timeout, or denied result
- **THEN** the harness MUST emit visible UI state and either recover safely or end with a typed failure reason

### Requirement: Intent classification
The system SHALL classify user requests into verify, understand, act, respond, navigate, summarize, or unknown intent families.

#### Scenario: Verify claim
- **WHEN** the prompt asks whether a visible claim is true
- **THEN** the harness MUST classify the intent as `verify`, target the claim, and mark uncertainty disclosure as required

#### Scenario: Create credential request
- **WHEN** the prompt asks to create a credential, API key, permission change, post, purchase, or account mutation
- **THEN** the harness MUST classify the intent as a deferred action for the hackathon MVP and avoid running DOM actions

### Requirement: Claude Code-style session event stream
The system SHALL expose a long-lived session interface with streaming input and typed async output events for state, UI patches, tool progress, approval, interruption, and results.

#### Scenario: Tool starts and finishes
- **WHEN** the harness runs a search, extraction, scan, or action tool
- **THEN** it MUST emit `tool.started` and `tool.finished` events with structured summaries

#### Scenario: Generated UI changes
- **WHEN** the harness creates or updates a primitive tree
- **THEN** it MUST emit a `ui.patch` event that the renderer can apply

#### Scenario: Stream consumed without HTTP server
- **WHEN** the frontend starts a harness run in the first implementation milestone
- **THEN** the frontend MUST consume harness events through an async iterable, callback stream, or extension message port without requiring an HTTP server

#### Scenario: Transport adapter added later
- **WHEN** the harness is moved behind a subprocess, extension background worker, or remote service
- **THEN** the system MUST preserve the same event schema and expose it through stdio/NDJSON, extension ports, SSE, or WebSocket as an adapter layer

### Requirement: Mutating action boundary
The system SHALL enforce a read-only boundary for the hackathon MVP.

#### Scenario: High-risk browser action requested
- **WHEN** an action plan would create credentials, change permissions, submit external content, or mutate account state
- **THEN** execution MUST be blocked and represented as deferred guidance

#### Scenario: Post-MVP approval path preserved
- **WHEN** action execution is reintroduced after the hackathon
- **THEN** approval MUST be enforced outside model output before any mutation runs

### Requirement: Grounded result handling
The system SHALL verify grounded information before claiming factual completion.

#### Scenario: Web claim checked
- **WHEN** the harness checks a claim using page context and web tools
- **THEN** it MUST show source evidence, uncertainty, and missing evidence before emitting a verdict

#### Scenario: Verification unknown
- **WHEN** verification cannot confirm the expected result
- **THEN** the harness MUST emit an unknown or partial result rather than claiming success

### Requirement: Deterministic fixtures as test fallback only
The system SHALL support deterministic run fixtures for tests, local replay, and fallback without replacing the functional harness path.

#### Scenario: Fixture replay selected
- **WHEN** a developer runs a fixture replay mode
- **THEN** the harness MUST emit valid events matching the same contracts used by the live harness

#### Scenario: Live harness selected
- **WHEN** the normal demo run starts
- **THEN** the system MUST use the functional harness path with scanner/tool inputs rather than pre-rendered final scene state
