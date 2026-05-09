# Clickthrough Team Kickoff

Use these briefs to split the first implementation pass across four users with agents.

Ground rules:

- Build the functional harness loop first.
- Keep all surfaces driven by typed events and validated primitive trees.
- Do not turn the product into chat.
- Hackathon MVP is read-only: no clicking, submitting, posting, credential creation, permission changes, or other page mutations.
- No factual claim without source grounding, uncertainty, or explicit "not verified" state.
- Web evidence must be grounded with source URLs and may include representative images, favicons, or page image links when available.

Recommended first integration order:

1. Shared contracts land.
2. Harness emits real events.
3. Page perception feeds real context and anchors.
4. Renderer consumes event stream.
5. Jarvis-style scenario flows wire the pieces together.
6. Acceptance checks and recording script lock the demo.

No runtime scenario profiles:

- Do not add hardcoded final UI trees for the four scenes.
- Do not add fake event timelines to make the demo pass.
- Repeatability belongs in tests, fixtures, and Playwright scripts.
- Runtime starts from page context, user prompt, available tools, and primitive manifest.

Web/search contract:

- Use provider-neutral `web.search` and `web.fetch`.
- Exa is the MVP provider, but renderer and planner code should consume normalized `GroundedWebSource` objects.
- Source media is optional: image/favicons enrich evidence UI, but text-only fallback must remain valid.
- Contract fixtures must cover highlights, missing media, representative image, favicon, extracted page images, and fetch failure.

Core references:

- `docs/team-kickoff/DESIGN-CONTRACTS.md`
- `openspec/changes/core-demo-execution-plan/design.md`
- `openspec/changes/core-demo-execution-plan/tasks.md`
- `HARNESS.md`
- `AGENT_LOOP.md`
- `UI_PRIMITIVES.md`
- `DEMO.md`
