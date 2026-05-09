# User C Kickoff: Overlay Stream Renderer

## Mission

Own the frontend event consumer and generated UI renderer. The overlay should consume harness events, apply UI patches, adapt to host style, and show progressive generation.

## Primary Files

- `frontend/src/renderer/`
- `frontend/src/renderer/stream/`
- `frontend/src/harness/useHarness.ts`
- `frontend/src/primitives/`

## First Tasks

- Replace local mock state assumptions with harness event stream consumption.
- Expand `applyHarnessEvent()` beyond root replacement to nested patches.
- Make `PrimitiveRenderer` validation errors visible and recoverable.
- Consume `surface.anchor` and `surface.style` from generated UI declarations.
- Apply host theme variables consistently.
- Ensure skeleton/progress-to-final transitions render for all scenes.
- Render web evidence with thumbnails, favicons, or text-only fallback from normalized source props.

## Done When

- Frontend can render a full overlay from a streamed `ClickthroughNode` tree.
- Overlays prefer selection/focus/cursor anchoring before falling back to generic placement.
- Approval request events surface a clear gate.
- Evidence UI can embed source images without relying on Exa response shapes.
- CT mark and sensitive-action styling remain distinct from host adaptation.
- Desktop and narrow viewport layouts do not overlap.
