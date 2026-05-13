## MODIFIED Requirements

### Requirement: Variable overlay modes
The system SHALL support inline prompt, anchored popover, side panel, spotlight, fullscreen workbench, native insertion, pointer chip, screen annotation, and action preview overlay modes.

#### Scenario: Intent selects overlay mode
- **WHEN** the harness emits a generated UI payload with an overlay mode and surface anchor
- **THEN** the overlay renderer MUST position and size the UI according to both the mode and the anchor geometry
- **AND** it MUST avoid defaulting to a fixed top-right frame unless no usable anchor or viewport-safe placement exists

#### Scenario: Small task stays local
- **WHEN** the user asks a local question about selected text, hovered content, focused input, or a nearby page affordance
- **THEN** the overlay SHOULD render as a pointer chip, inline prompt, anchored popover, screen annotation, or spotlight before escalating to a side panel

#### Scenario: Evidence-heavy task expands
- **WHEN** the generated UI contains multi-source evidence, long-running tool progress, or a complex visual explanation
- **THEN** the overlay MAY expand from the invocation anchor into a side panel or fullscreen workbench while preserving the origin highlight

### Requirement: Cursor-native overlay behavior
The system SHALL make generated UI feel like a natural expansion of the user's current pointer, selection, hover target, or focus.

#### Scenario: Buddy appears at point of intent
- **WHEN** the user selects text, focuses a control, hovers a meaningful affordance, or invokes Clickthrough near the cursor
- **THEN** the initial CT buddy or prompt MUST appear near that point of intent with viewport-safe placement

#### Scenario: Progressive expansion
- **WHEN** a task grows from buddy to prompt to generated interface
- **THEN** the UI SHOULD visually expand from the invocation point into the selected overlay mode without losing page position

#### Scenario: Buddy remains non-obstructive
- **WHEN** the user is browsing without engaging Clickthrough
- **THEN** the buddy MUST stay compact, avoid blocking page text/controls, and keep page interaction available

#### Scenario: Show the target instead of describing it
- **WHEN** the answer refers to a visible DOM element, screenshot region, menu item, app control, or document region
- **THEN** the renderer SHOULD highlight, halo, annotate, or scroll to the target instead of only describing its location in text
- **AND** the visual pointer MUST remain bound to the target geometry when the page reflows or the viewport scrolls

#### Scenario: Voice or pointer invocation stays lightweight
- **WHEN** the user holds the configured hotkey, presses push-to-talk, grabs the pointer buddy, or invokes Clickthrough near the cursor
- **THEN** the renderer MUST show a compact listening/thinking state at the point of intent
- **AND** it MUST avoid opening a chat window, dashboard, or fixed assistant panel unless the accepted task requires more space

### Requirement: OS companion surface behavior
The system SHALL render screen-level companion surfaces over app windows without pretending the app is part of the web page.

#### Scenario: Screen annotation over desktop app
- **WHEN** the harness emits a screen annotation with app/window metadata, screenshot region bounds, and confidence
- **THEN** the renderer MUST display a Clickthrough-marked annotation layer near the referenced screen region
- **AND** it MUST avoid occluding the exact control or text being explained when a nearby placement is available

#### Scenario: Action preview before computer use
- **WHEN** the harness proposes a computer-use action such as click, type, scroll, drag, hotkey, app focus, or clipboard write
- **THEN** the renderer MUST show an action preview with target, reason, risk, and expected result
- **AND** execution MUST require approval unless the action is in a previously approved low-risk tier

### Requirement: Proactive insight surfaces
The system SHALL support low-noise proactive insight chips that can promote into normal generated UI runs.

#### Scenario: Quiet insight shown
- **WHEN** page perception identifies a high-confidence opportunity such as a questionable claim, dense paragraph, reply context, or risky control
- **THEN** the renderer MAY show a compact anchored insight chip with a suggested action
- **AND** it MUST avoid opening a large panel without user interaction

#### Scenario: Insight promoted
- **WHEN** the user clicks or invokes a proactive insight
- **THEN** the renderer MUST submit the suggested prompt and anchor context to the harness as a normal run

#### Scenario: Proactive signal throttled
- **WHEN** the user dismisses, ignores, or moves away from a proactive insight
- **THEN** the renderer MUST decay or suppress similar hints for the current page/app session
- **AND** it MUST NOT repeatedly chase the cursor with the same suggestion
