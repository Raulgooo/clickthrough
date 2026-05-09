## ADDED Requirements

### Requirement: Page context packet creation
The system SHALL create compact page context packets from the active page or controlled demo host scene.

#### Scenario: User invokes Clickthrough on selected text
- **WHEN** the user invokes Clickthrough with selected page text
- **THEN** the page bridge MUST include the selected text, page URL, page title, nearby visible text, and anchor reference in the context packet

#### Scenario: No raw DOM dump sent
- **WHEN** page context is prepared for the harness
- **THEN** the page bridge MUST send summarized relevant elements rather than raw full HTML

### Requirement: Lightweight affordance extraction
The system SHALL extract visible page affordances into a read-only context map for planning, anchoring, and explanation.

#### Scenario: Dashboard actions detected
- **WHEN** the active scene contains buttons, forms, tables, menus, or links
- **THEN** the page bridge MUST report context entries with stable ids, labels, kinds, bounding boxes where available, and confidence

#### Scenario: Action target requested
- **WHEN** a requested action would require mutating the page
- **THEN** the page bridge MUST provide context only and the harness MUST defer execution in the hackathon MVP

#### Scenario: Generic page scanned
- **WHEN** the page bridge scans a page that is not one of the four controlled demo scenes
- **THEN** it MUST still return visible text, likely interactive elements, forms, links, buttons, and host theme using generic DOM and accessibility heuristics

### Requirement: Host theme sampling
The system SHALL sample host visual style from the current page or demo scene.

#### Scenario: Host styles sampled
- **WHEN** the page bridge builds context
- **THEN** it MUST include mode, font family, text color, muted text color, surface color, border color, accent color, radius, control style, and density where available

#### Scenario: Sampling fails
- **WHEN** host style sampling fails or returns unreadable values
- **THEN** the page bridge MUST provide a safe Clickthrough fallback theme

### Requirement: Anchoring support
The system SHALL preserve references to selected or target page regions for highlighting and overlay placement.

#### Scenario: Claim is selected
- **WHEN** the verify scene targets a tweet claim
- **THEN** the bridge MUST expose an anchor reference that the overlay can use for `AnchorHighlight` and placement

#### Scenario: Page changes after user navigation
- **WHEN** the visible page state changes because the user navigates or interacts manually
- **THEN** the bridge MUST support re-scanning so the harness can update context

### Requirement: Hackathon read-only boundary
The system SHALL keep page perception separate from page mutation during the hackathon MVP.

#### Scenario: Mutating browser tools are present in code
- **WHEN** browser action executor code exists in the repository
- **THEN** it MUST remain quarantined from the live MVP path unless the plan is explicitly revised

#### Scenario: General page copilot context
- **WHEN** the user invokes Clickthrough on an arbitrary dense page
- **THEN** the bridge MUST return enough read-only context for Clickthrough to summarize the page, identify likely next moves, anchor the overlay, and prepare user-facing output
