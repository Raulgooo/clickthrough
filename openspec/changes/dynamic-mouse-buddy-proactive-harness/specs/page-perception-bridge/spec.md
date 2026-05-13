## MODIFIED Requirements

### Requirement: Page context packet creation
The system SHALL create compact page context packets from the active page or controlled demo host scene.

#### Scenario: User invokes Clickthrough at cursor
- **WHEN** the user invokes Clickthrough without a selection or focused control
- **THEN** the page bridge MUST include cursor position, viewport dimensions, nearby visible text, and nearby affordances where available

#### Scenario: User invokes Clickthrough on selected text
- **WHEN** the user invokes Clickthrough with selected page text
- **THEN** the page bridge MUST include the selected text, page URL, page title, nearby visible text, anchor reference, and selection bounds where available

### Requirement: Screen and app context packet creation
The system SHALL support an OS companion context packet that describes the active app/window, pointer intent, and approved screenshot regions without granting raw computer control.

#### Scenario: User invokes Clickthrough over a desktop app
- **WHEN** the user invokes Clickthrough outside a browser page
- **THEN** the OS bridge MUST include active app name, window title when available, display bounds, pointer position, focused accessibility element when available, and a redacted screenshot crop or screen summary
- **AND** it MUST mark whether the context came from browser DOM, accessibility metadata, OCR, screenshot vision, or a combination

#### Scenario: Screenshot crop requested
- **WHEN** the harness needs visual context for a screen region
- **THEN** the screen broker MUST prefer the smallest relevant crop over full-display capture
- **AND** it MUST run local redaction and sensitivity classification before sending pixels to a model or external service

#### Scenario: Screenshot is not action authority
- **WHEN** a model identifies a target only from pixels
- **THEN** the bridge MUST resolve the target through DOM, accessibility, OCR, or user confirmation before any mutating action can be proposed
- **AND** unresolved pixel-only targets MUST remain explanation-only

### Requirement: Lightweight affordance extraction
The system SHALL extract visible page affordances into a read-only context map for planning, anchoring, and explanation.

#### Scenario: Hover target detected
- **WHEN** the user dwells over a visible interactive or semantically meaningful element
- **THEN** the page bridge MUST expose the hovered element id, bounds, label/text summary, dwell time, and confidence

#### Scenario: Focus target detected
- **WHEN** the active page has a focused input, button, link, menu, tab, or contenteditable region
- **THEN** the page bridge MUST expose that focused element as a primary anchor candidate

#### Scenario: Element pointing prefers structure
- **WHEN** the answer refers to a web element visible in the active tab
- **THEN** the bridge SHOULD provide selector, accessible name, role, bounds, visibility, and scrollability metadata
- **AND** the renderer SHOULD bind pointer halos to that structure instead of raw pixel coordinates where possible

#### Scenario: Offscreen target found
- **WHEN** the bridge or harness identifies a relevant target outside the viewport
- **THEN** it MAY propose a scroll-to-target preview
- **AND** it MUST NOT scroll the page or app without user approval unless the current permission tier allows read-only navigation

### Requirement: Proactive context scoring
The system SHALL score page context for low-noise proactive insight opportunities.

#### Scenario: Claim-like content visible
- **WHEN** visible or selected text contains a claim likely to benefit from verification
- **THEN** the page bridge or local insight scorer SHOULD produce a verify insight candidate with an anchor and confidence score

#### Scenario: Dense explanation target visible
- **WHEN** selected or hovered text is dense instructional, technical, legal, or conceptual prose
- **THEN** the bridge or local insight scorer SHOULD produce an understand insight candidate with an anchor and confidence score

#### Scenario: Sensitive context detected
- **WHEN** the page appears to contain private messages, credentials, payment, health, legal, or account settings context
- **THEN** proactive insights MUST default to quiet/local suggestions and avoid model calls until the user explicitly engages

#### Scenario: Pointer intent raises priority
- **WHEN** the user dwells, wiggles, selects, circles, or repeatedly returns to a region
- **THEN** the bridge MAY raise the priority of insight candidates anchored to that region
- **AND** the candidate MUST still satisfy confidence, sensitivity, and cooldown policies before showing a proactive hint

#### Scenario: Session-only memory
- **WHEN** the user asks follow-up questions on the same page, app, tab, or task
- **THEN** the bridge MAY attach bounded session memory for continuity
- **AND** that memory MUST be scoped to the active session unless the user explicitly saves it
