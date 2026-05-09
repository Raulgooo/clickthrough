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
