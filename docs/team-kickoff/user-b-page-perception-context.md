# User B Kickoff: Page Perception And Context Bridge

## Mission

Own the browser context layer that makes Clickthrough feel like a Jarvis-like copilot for the current page.

For the hackathon, User B is not building SharkAuth automation or mutating browser actions. The lane is now read-only page perception: capture the page context, selected/focused region, lightweight affordances, host style, and anchor metadata that the harness and renderer need to generate useful overlays.

## Primary Files

- `frontend/src/browser/`
- future extension/content bridge files if needed

## First Tasks

- Implement or harden `buildPageContextPacket()` for URL, title, selected text, focused element, visible text summary, viewport, and timestamp.
- Extract nearby page regions and lightweight affordances: links, buttons, inputs, headings, tables, dialogs, and key labels for context only.
- Produce stable anchor references for highlighting and overlay placement, prioritizing selection, focused element, hovered element, cursor/caret point, page region, then viewport fallback.
- Sample host theme: font, colors, radius, density, control style, borders, and dark/light mode.
- Create demo context fixtures for verify, understand, Jarvis assist/navigate, and respond scenes.
- Keep any existing browser action executor code quarantined as post-hackathon infrastructure. Do not wire click/fill/submit into the live MVP path.

## Done When

- The harness receives useful `PageContextPacket` values from controlled demo pages and ordinary pages.
- The renderer can anchor overlays to selected text or nearby page regions.
- Host adaptation has real sampled values instead of generic defaults.
- User D has fixtures for all four scenes without fake final UI trees.
- No mutating page action is exposed in the hackathon demo path.
