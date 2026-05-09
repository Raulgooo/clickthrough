## ADDED Requirements

### Requirement: Verify scenario flow
The system SHALL demonstrate claim verification over a Twitter/X-like page with an evidence-first generated interface.

#### Scenario: Claim dashboard assembles
- **WHEN** the user asks whether the Raul Amazon internship claim is true
- **THEN** Clickthrough MUST highlight the claim and stream a verification UI containing claim, identity, evidence, contradiction, confidence, source trail, verdict, and uncertainty sections

#### Scenario: Verification exposes uncertainty
- **WHEN** public evidence is incomplete or identity cannot be conclusively verified
- **THEN** the verdict MUST show uncertainty and missing evidence rather than absolute certainty

### Requirement: Understand scenario flow
The system SHALL demonstrate visual explanation over an OAuth PKCE PDF-like page.

#### Scenario: PKCE visual explainer appears
- **WHEN** the user asks Clickthrough to explain the selected PKCE paragraph visually
- **THEN** Clickthrough MUST render a visual explainer with selected quote, sequence diagram, stepper, with/without PKCE control, and concise callouts

#### Scenario: PKCE toggle changes explanation
- **WHEN** the user switches between with-PKCE and without-PKCE states
- **THEN** the diagram or comparison state MUST update to show why intercepted authorization codes are dangerous without the verifier and safer with PKCE

### Requirement: Assist / Navigate scenario flow
The system SHALL demonstrate a Jarvis-like page copilot flow over a dense current page without mutating the page.

#### Scenario: Page copilot appears
- **WHEN** the user asks Clickthrough to help handle the current page
- **THEN** Clickthrough MUST render a contextual copilot surface with page read, relevant entities, likely next moves, source-backed side research when useful, and prepared copyable output

#### Scenario: Mutating action is deferred
- **WHEN** the user's request would require clicking, submitting, posting, creating credentials, or changing account state
- **THEN** Clickthrough MUST show safe guidance or a deferred-action state rather than executing the mutation in the hackathon MVP

### Requirement: Respond scenario flow
The system SHALL demonstrate a private response assistant over a chat-like page.

#### Scenario: Sensitive context guarded
- **WHEN** the user asks what a period-related message means and what to say
- **THEN** Clickthrough MUST show private/sensitive context treatment and avoid medical certainty

#### Scenario: Reply assistance remains private
- **WHEN** reply drafts are generated
- **THEN** the overlay MUST provide editable drafts and tone controls without sending or posting unless the user explicitly approves that action

### Requirement: Demo coherence
The system SHALL make runtime UI generation obvious across all four scenes.

#### Scenario: Scenes look distinct
- **WHEN** the four scenes are shown in sequence
- **THEN** each generated overlay MUST use a different composition that matches the intent and host context rather than reusing one generic panel

#### Scenario: Product is not a chatbot
- **WHEN** judges watch the demo
- **THEN** the primary visible experience MUST be generated dashboards, diagrams, page copilots, decision surfaces, and assistants instead of a chat transcript or sidebar

### Requirement: Protocol credibility
The system SHALL make the chosen hackathon protocols legible without letting protocol branding dominate the product.

#### Scenario: AG-UI shown through behavior
- **WHEN** a scene is running
- **THEN** progressive state, tool progress, partial UI patches, deferred-action states, and final results MUST be visible as an AG-UI-style event stream driving the overlay

#### Scenario: MCP framed as tool discovery
- **WHEN** the demo explains external capabilities
- **THEN** MCP Apps MUST be framed as a way for Clickthrough to discover or call tools such as search, profile lookup, source fetch, or browser/page context tools
