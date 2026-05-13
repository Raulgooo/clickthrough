---
id: SEED-001
status: dormant
planted: 2026-05-13
planted_during: unknown
trigger_when: when relevant
scope: unknown
---

# SEED-001: Move Clickthrough toward a dynamic mouse buddy instead of a single frame thing

## Why This Matters

Clickthrough's north star is a runtime interface layer that reshapes around user intent. A fixed single-frame overlay weakens that illusion because it feels like another app sitting on top of the page. A dynamic mouse buddy should make CT feel closer to the cursor: aware of hover, selection, page affordances, and available space, then expanding into the smallest useful generated interface.

## When to Surface

**Trigger:** when relevant

This seed should surface when planning overlay behavior, invocation UX, page anchoring, host adaptation, or demo polish for the browser-native copilot experience.

## Scope Estimate

**Unknown** - likely medium if it includes runtime behavior, positioning policy, animation states, and updated demo flows.

## Breadcrumbs

- `../UI_PRIMITIVES.md`: defines the core interaction principle: "Clickthrough should feel like a natural expansion of the cursor." It also says overlays should appear at selected text, cursor position, focused controls, hovered elements, or the visible region that triggered the request.
- `../STACK.md`: says the overlay should be variable, not one fixed sidebar or dashboard, and should choose shape based on intent, page context, available space, and risk.
- `../AGENT_LOOP.md`: defines overlay mode selection and recommends the smallest overlay that solves the task.
- `../HARNESS.md`: describes streaming overlay state, selected/anchored targets, and overlay mode policies.
- `src/renderer/OverlayPositioner.tsx`: current renderer-side positioning logic for inline prompts and anchored popovers.
- `src/extension/content.tsx`: current extension overlay state, anchor detection, highlight rendering, and prompt invocation.
- `src/harness/runtime/contracts.ts`: includes `cursorPosition` and `anchorElementId` in page context.
- `src/harness/runtime/openrouter.ts`: includes cursor position in model context and asks the UI architect to compose dynamically.
- `src/harness/runtime/session.ts`: currently infers and emits overlay modes for generated UI trees.
- `src/types/primitives.ts` and `src/types/ui.ts`: define anchor, cursor, and overlay mode concepts.

## Notes

Captured via one-shot seed capture.

Potential direction:

- Treat the cursor/selection/focused element as the primary CT home base.
- Start with a small buddy surface near the cursor, then morph into inline prompt, anchored popover, spotlight, or panel only when the intent requires it.
- Make movement and expansion context-sensitive: follow hover lightly, snap to meaningful anchors, avoid blocking content, and preserve page scroll.
- Keep trust boundaries visible with the CT mark and safety badges even when adapting to host page style.
