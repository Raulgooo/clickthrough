## ADDED Requirements

### Requirement: Validated primitive tree rendering
The system SHALL render Clickthrough UI only from known primitive node types and validated props.

#### Scenario: Unknown primitive rejected
- **WHEN** a UI patch contains a primitive type that is not registered
- **THEN** the renderer MUST refuse to render that node and expose a recoverable UI validation error

#### Scenario: Known primitive rendered
- **WHEN** a UI patch contains a valid `ClickthroughNode` tree using registered primitives
- **THEN** the renderer MUST display the corresponding React components without arbitrary HTML execution

### Requirement: Variable overlay modes
The system SHALL support inline prompt, anchored popover, side panel, spotlight, fullscreen workbench, and native insertion overlay modes.

#### Scenario: Intent selects overlay mode
- **WHEN** the harness emits a generated UI payload with an overlay mode
- **THEN** the overlay renderer MUST position and size the UI according to that mode

#### Scenario: Risky action receives distinct treatment
- **WHEN** the generated UI contains a sensitive or high-risk action
- **THEN** the overlay MUST keep the approval gate visibly Clickthrough-controlled even if other surfaces adapt to the host

### Requirement: Progressive UI assembly
The system SHALL show visible progressive generation for runs that take longer than 300ms.

#### Scenario: Long-running verification
- **WHEN** a verification run starts and sources are still loading
- **THEN** the overlay MUST show skeletons, progress state, or partial sections before the final verdict

#### Scenario: UI patch stream updates content
- **WHEN** the harness emits successive `ui.patch` events
- **THEN** the overlay MUST update the existing UI tree without replacing the whole application shell

### Requirement: Host style adaptation
The system SHALL apply host-derived style variables to generated overlays while preserving Clickthrough trust affordances.

#### Scenario: Host theme is provided
- **WHEN** a page context packet includes a host theme summary
- **THEN** the renderer MUST map it into Clickthrough CSS variables for font, text, surface, border, accent, radius, and density

#### Scenario: CT mark remains visible
- **WHEN** any generated overlay is shown
- **THEN** the UI MUST include a Clickthrough mark or control affordance identifying the generated surface

### Requirement: Declarative styling intent
The system SHALL accept model-provided styling intent only as validated primitive props or renderer-owned style tokens.

#### Scenario: Fast style brief guides principal generation
- **WHEN** the harness has a user prompt, intent classification, page context, and host theme
- **THEN** it MAY run a fast style planner to produce a compact style brief before principal UI generation
- **AND** the principal agent MUST treat the brief as guidance that can be overridden by evidence, safety, approval, viewport, or renderer constraints

#### Scenario: Surface plan precedes primitive rendering
- **WHEN** the harness emits generated UI
- **THEN** the payload SHOULD include a declarative surface plan describing purpose, anchor, layout, style intent, and interaction constraints
- **AND** the renderer MUST treat the primitive tree as the implementation of that plan rather than an arbitrary component dump

#### Scenario: Styling intent guides renderer
- **WHEN** the harness emits generated UI with density, tone, emphasis, host-fit, or visualization preference
- **THEN** the renderer MUST translate that intent through Clickthrough primitives and host style variables rather than raw CSS

#### Scenario: Arbitrary styling rejected
- **WHEN** a generated UI payload attempts to include arbitrary CSS, script, or unregistered component code
- **THEN** validation MUST reject that payload before render

### Requirement: Cursor-native overlay behavior
The system SHALL make generated UI feel like a natural expansion of the user's current pointer, selection, or focus.

#### Scenario: Anchored point of intent
- **WHEN** the page context includes selected text, a focused element, hovered element, cursor position, or anchor element
- **THEN** the initial overlay MUST prefer anchoring to that point of intent before falling back to a generic panel position

#### Scenario: Progressive expansion
- **WHEN** a task grows from a small prompt into a larger generated interface
- **THEN** the overlay SHOULD visually expand from the invocation point into the selected overlay mode without disorienting the user or losing page position
