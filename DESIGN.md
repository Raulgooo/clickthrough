# Design

## Summary

Clickthrough's interface is a variable browser overlay system. It must feel precise, adaptive, and quietly powerful. The design should serve runtime-generated UI: claim dashboards, visual explainers, action forms, approval gates, execution logs, and response helpers.

The system should look like expert infrastructure that appears only when needed, then gets out of the way.

## Design Direction

Primary tone:

- tech utility
- modern minimal
- high-signal
- trustworthy
- page-aware

Avoid:

- chatbot sidebars
- neon AI styling
- glassmorphism
- heavy gradients
- decorative blobs
- generic SaaS cards
- landing-page hero aesthetics

## Surface Model

Clickthrough uses variable overlay modes:

- inline prompt
- anchored popover
- side panel
- spotlight overlay
- fullscreen workbench
- native insertion

The overlay mode should match the user's intent, page context, available space, and risk level.

## Host Adaptation

Generated UI should sample and adapt to the current page:

- font family
- text color
- muted text color
- surface color
- border color
- accent color
- border radius
- button style
- input style
- density
- light or dark mode

Approval gates and sensitive states should remain visibly Clickthrough-controlled even when the rest of the UI blends into the host page.

## Color

Use host-adapted color roles first. Clickthrough should not impose a single fixed palette on every site.

Core roles:

- `ct-text`
- `ct-muted`
- `ct-surface`
- `ct-surface-raised`
- `ct-border`
- `ct-accent`
- `ct-success`
- `ct-warning`
- `ct-danger`
- `ct-focus`

Status colors must always be paired with text labels or icons.

## Typography

Use the host page font when it is readable and stable.

Fallback stack:

```css
font-family: ui-sans-serif, "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
```

Text hierarchy should be compact:

- small labels for state and source metadata
- clear section headings
- body text optimized for scanning
- no oversized hero typography inside overlays

## Layout

Generated overlays should be dense but not cramped.

Layout principles:

- put the user's target object first
- stream skeletons before details
- group evidence, controls, and actions by purpose
- keep approval gates visually distinct
- avoid nested cards
- avoid identical repeated card grids
- keep follow-up prompts near the generated UI

## Motion

Motion should show assembly and state change.

Use motion for:

- overlay entrance
- skeleton-to-content transitions
- source rows streaming in
- stepper progress
- diagram step advancement
- approval state changes
- execution log updates

Avoid bounce, elastic motion, and decorative animation.

Respect reduced-motion preferences.

## Components

The primitive system is defined in `UI_PRIMITIVES.md`.

Core visual groups:

- overlay shell
- layout containers
- text and status
- inputs
- evidence cards
- visual diagrams
- action forms
- approval gates
- safety notices
- loading/error/success states

## Scenario Requirements

### Verification Dashboard

Feels forensic, compact, and evidence-first.

Must show:

- claim extraction
- identity matching
- sources
- contradictions
- confidence
- verdict
- uncertainty

### Visual Explainer

Feels like a generated learning layer over the document.

Must show:

- selected text anchor
- sequence or flow diagram
- step controls
- toggles
- short explanation
- text alternative for diagrams

### Action Surface

Feels native to the current product, but safer.

Must show:

- generated form
- risk summary
- approval gate
- execution progress
- verification result

### Response Assistant

Feels private, lightweight, and context-aware.

Must show:

- private mode
- plain explanation
- suggested replies
- tone controls
- approval before sending

## Accessibility

Design for:

- WCAG AA contrast
- keyboard navigation
- visible focus
- reduced motion
- labels for icon buttons
- non-color status indicators
- text equivalents for diagrams

