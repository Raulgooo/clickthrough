## ADDED Requirements

### Requirement: Harness unit tests
The system SHALL include unit tests for harness state transitions, intent classification, approval policy, UI validation, and verification decisions.

#### Scenario: Approval policy tested
- **WHEN** tests evaluate a high-risk action such as API key creation
- **THEN** the policy MUST require approval before execution

#### Scenario: Unknown primitive tested
- **WHEN** tests validate a generated UI tree with an unknown primitive
- **THEN** validation MUST reject it with a structured error

### Requirement: Contract tests
The system SHALL include contract tests for event payloads, generated UI payloads, page context packets, and action plans.

#### Scenario: Harness event consumed by TypeScript renderer
- **WHEN** the TypeScript harness emits a sample event fixture
- **THEN** the frontend contract test MUST confirm the payload shape can be consumed by the renderer without casing or field drift

#### Scenario: Scanner packet consumed by harness
- **WHEN** the scanner returns a page context fixture
- **THEN** the harness contract test MUST confirm classification and planning can consume it

#### Scenario: Web evidence consumed by generated UI
- **WHEN** a `web.search` or `web.fetch` fixture includes highlights, favicon URL, representative image URL, and page image links
- **THEN** contract tests MUST confirm the normalized web result can be transformed into evidence primitives without Exa-specific fields leaking into renderer logic

### Requirement: Browser integration tests
The system SHALL include browser-level tests for the four core scenes and SharkAuth action flow where feasible.

#### Scenario: Verification scene streams UI
- **WHEN** the verification test invokes Clickthrough on the tweet claim
- **THEN** the browser test MUST observe skeleton/progress UI followed by evidence and verdict UI

#### Scenario: Verification scene renders visual source grounding
- **WHEN** the verification test receives web evidence with image metadata
- **THEN** the browser test MUST observe at least one source image or favicon embedded in the generated evidence UI
- **AND** the test MUST pass when image metadata is absent by falling back to text-only source evidence

#### Scenario: SharkAuth approval blocks execution
- **WHEN** the SharkAuth action test reaches the approval gate
- **THEN** no browser action or API key creation MUST occur until the test approves the request

### Requirement: Recommended test tooling
The system SHALL use Vitest for the TypeScript harness/runtime and Playwright for browser integration.

#### Scenario: Harness tests run
- **WHEN** Vitest is run for the harness runtime
- **THEN** unit and contract tests MUST pass without requiring a live browser unless marked as integration

#### Scenario: Browser tests run
- **WHEN** Playwright tests are run against the local frontend and harness runtime
- **THEN** the tests MUST verify visible overlay behavior, event streaming, approval gating, and final verification states
