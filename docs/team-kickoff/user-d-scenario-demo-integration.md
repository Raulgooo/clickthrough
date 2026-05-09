# User D Kickoff: Integration, Acceptance, And Winning Demo

## Mission

Own demo coherence, integration pressure, acceptance checks, and recording readiness. Do not create scripted scenario logic. The scenes should exercise the real harness path while remaining reliable enough to record.

## Primary Files

- `frontend/src/demos/`
- `frontend/src/test-fixtures/` if needed
- `docs/team-kickoff/`
- `DEMO.md`
- final recording script or notes

## First Tasks

- Define acceptance checks for each scene: required page context, expected intent, required UI primitives, required safety gates, and verification evidence.
- Create page fixtures only where they help test repeatability; fixtures must not contain final UI trees or fake event timelines.
- Make the verify flow evidence-first with uncertainty by checking what the harness actually renders, including web source images/favicons when available and text-only fallback when absent.
- Make the PKCE flow visibly interactive and diagram-first by checking selected text extraction and generated visual primitives.
- Make the SharkAuth flow use real scanner context, approval, execution, and verification by coordinating with User B.
- Make the response flow private, respectful, and non-sending by default by checking sensitive-context and approval behavior.
- Own the integration checklist across Users A, B, and C.
- Keep AG-UI streaming and MCP tool discovery visible in narration without making the product sound like a protocol demo.

## Done When

- All four scenes feel generated and distinct.
- The demo does not look like chat, a static dashboard, or a slide deck.
- The recording script fits 2-4 minutes.
- Each scene has a reset/replay path for recording.
- Acceptance checks catch regressions before recording, including web evidence contract drift between harness and renderer.
