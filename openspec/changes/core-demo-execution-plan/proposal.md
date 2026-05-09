## Why

Clickthrough has a strong product direction, primitive library, and storyboard, but the executable core is still a frontend-only prototype with mocked agent state. We need a shared execution contract before four users with agents start building in parallel, so the team ships the browser-native generative UI loop instead of fragmenting into disconnected demos.

## What Changes

- Define the minimum end-to-end functional harness for the hackathon: observe page context, classify intent, plan tools/UI/actions, stream generated UI, gate risky action, execute approved DOM/API work, and verify result.
- Convert the existing docs and frontend baseline into OpenSpec-backed capability contracts.
- Split the work into four parallel ownership lanes that can be executed by four users with agents without overlapping file ownership, optimized for fastest quality rather than a one-to-one mapping to capability names.
- Preserve the current product constraints: no chatbot as the main surface, no arbitrary generated HTML, visible progressive generation, host-adapted overlays, approval before sensitive action, and verification after action.
- Scope the build to a credible hackathon prototype rather than a full production extension platform.

## Capabilities

### New Capabilities

- `runtime-overlay-renderer`: Validated Clickthrough primitive trees render as variable, host-adapted overlays with progressive state.
- `page-perception-bridge`: Browser/page context is collected into compact packets with visible text, selection, capabilities, anchors, and host theme.
- `agent-harness-stream`: A model-agnostic harness classifies intent, plans tools/UI/actions, emits AG-UI-style events, validates UI, enforces approval, and verifies outcomes.
- `demo-scenario-flows`: The four storyboard scenes prove verify, understand, act, and respond intents with distinct generated interfaces.
- `quality-verification-strategy`: Unit, contract, integration, and browser tests prove the harness loop works before the final demo.

### Modified Capabilities

- None. No OpenSpec specs existed before this change.

## Impact

- Frontend: `frontend/src/renderer`, `frontend/src/primitives`, `frontend/src/harness`, `frontend/src/demos`, shared TypeScript types, styling tokens.
- New likely modules: TypeScript harness runtime/service, browser/page bridge or extension-like content layer, generic DOM scanner, browser action executor, tool registry, scenario flows, validation layer, shared contracts, and test fixtures.
- Demo operations: four-person task ownership, integration checkpoints, build verification, and final recording readiness.
- Dependencies may expand to include a TypeScript backend/runtime layer, schema validation such as Zod or JSON Schema, Vitest, Playwright, browser automation/extension tooling, AG-UI-compatible event transport, and optionally MCP/CopilotKit only where they accelerate the demo without changing the visible product into chat.
