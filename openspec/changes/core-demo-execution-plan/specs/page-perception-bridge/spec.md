## ADDED Requirements

### Requirement: Page context packet creation
The system SHALL create compact page context packets from the active page or controlled demo host scene.

#### Scenario: User invokes Clickthrough on selected text
- **WHEN** the user invokes Clickthrough with selected page text
- **THEN** the page bridge MUST include the selected text, page URL, page title, nearby visible text, and anchor reference in the context packet

#### Scenario: No raw DOM dump sent
- **WHEN** page context is prepared for the harness
- **THEN** the page bridge MUST send summarized relevant elements rather than raw full HTML

### Requirement: Capability map extraction
The system SHALL extract visible interactive page affordances into a capability map.

#### Scenario: Dashboard actions detected
- **WHEN** the active scene contains buttons, forms, tables, menus, or links
- **THEN** the page bridge MUST report capability entries with stable element ids, labels, kinds, bounding boxes where available, and confidence

#### Scenario: Action target unavailable
- **WHEN** a requested action cannot be mapped to a stable element id
- **THEN** the page bridge MUST report the missing target so the harness can clarify or fall back safely

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

#### Scenario: Page changes after action
- **WHEN** an approved action changes visible page state
- **THEN** the bridge MUST support re-scanning so verification can inspect the updated page

### Requirement: SharkAuth real target support
The system SHALL support SharkAuth as a real action target through the same generic scanner and action contracts used for other pages.

#### Scenario: SharkAuth API key affordances detected
- **WHEN** the active page is SharkAuth and the user asks to create a full-permissions API key
- **THEN** the scanner MUST discover relevant navigation, form, scope, approval, and submit affordances without hard-coding the entire workflow into the UI scene

#### Scenario: SharkAuth action executes after approval
- **WHEN** the user approves a SharkAuth API key action plan
- **THEN** the action executor MUST use stable element references or a typed SharkAuth tool to execute the workflow and return evidence for verification
