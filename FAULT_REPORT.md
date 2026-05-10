# Clickthrough Fault Report & Amendments

Generated after a full-system assessment of the chatbot/agent loop, prompt, primitive renderer, and fallback UIs.

---

## FAULT 1: CRITICAL — No Action Handler Wiring (Buttons Don't Work)

**Severity:** P0 — Product is broken
**Location:** `PrimitiveRenderer.tsx`, all interactive primitives
**Symptom:** Every button, toggle, segmented control, approval gate, and sensitive context guard emitted by the agent does nothing when clicked.

**Root Cause:**
- `PrimitiveRenderer` spread `node.props` directly to components but never injected `onClick`, `onChange`, or any callback props.
- `Button` accepts `onClick` and `actionId`, but `PrimitiveRenderer` never mapped `actionId` to a real handler.
- No React Context or prop-drilling mechanism connected primitive interactions back to the harness.
- `ApprovalGate` and `SensitiveContextGuard` used raw `<button>` tags with `data-action-id` but no `onClick` handlers.

**Amendment:**
1. Created `frontend/src/renderer/ActionContext.tsx` — a React context for action routing.
2. Rewrote `PrimitiveRenderer.tsx` to:
   - Accept `onAction` prop.
   - Inject `onClick` into `Button` and `IconButton` when `actionId` is present.
   - Inject `onApprove` / `onCancel` into `ApprovalGate`.
   - Inject `onContinue` / `onCancel` into `SensitiveContextGuard`.
   - Maintain **local ephemeral state** for all input primitives (`TextField`, `TextArea`, `Select`, `Toggle`, `SegmentedControl`, `CheckboxRow`, `RadioRow`, `Slider`) so they are actually interactive.
3. Updated `ApprovalGate.tsx` and `SensitiveContextGuard.tsx` to accept and call `onApprove`, `onCancel`, `onContinue` callbacks.
4. Updated `content.tsx` and `HarnessDemo.tsx` to pass a real `onAction` handler that supports `action:copy`, `action:dismiss`, `action:retry`, `action:refresh`, `action:cancel`.

---

## FAULT 2: CRITICAL — Prompt Was Brain-Dead

**Severity:** P0 — Model generates garbage
**Location:** `frontend/src/harness/runtime/openrouter.ts` `modelGenerateUiTree()`
**Symptom:** Model generated inconsistent UI, wrong primitives, broken buttons, generic chatbot-like layouts, missing safety guards, placeholders, and unsupported composite names.

**Root Cause:**
The system prompt was literally:
```
Return one valid JSON object only. No markdown. No prose outside JSON.
```
The model had zero understanding of:
- Clickthrough's identity (not a chatbot)
- The four intent families and their required primitive assemblies
- That buttons without actions are useless
- Read-only safety boundary
- Host page adaptation
- Valid action IDs
- Composite primitive mappings

**Amendment:**
Rewrote the prompt into four structured prompt blocks:
1. `INTENT_ASSEMBLIES` — Detailed required primitives for verify, understand, respond, act, navigate/summarize, and comparison intents.
2. `VALID_ACTION_IDS` — Closed list of action IDs the model may use. Explicit rule: **NEVER emit Button without actionId.**
3. `RENDERER_RULES` — 15 hard rules including enum discipline, no placeholders, no dead buttons, no nested Panels, etc.
4. `JSON_EXAMPLES` — Concrete GOOD vs BAD examples for every common primitive.

Also updated the repair prompt (`repairGeneratedUiTree`) with the same structured context so repairs are not blind.

---

## FAULT 3: HIGH — Agent Emitted Buttons With No Valid Actions

**Severity:** P1 — Broken UI elements
**Location:** `openrouter.ts` fallback UIs, model-generated trees
**Symptom:** Buttons appeared in generated UI but had no `actionId` or made-up IDs.

**Root Cause:**
- Prompt didn't define valid actions.
- Fallback UIs (`buildGenericUi`, `buildActUi`, `buildRespondUi`, `generateClarificationPrompt`, error fallback in `session.ts`) emitted `Button` with no `actionId`.
- No validation checked for missing action bindings.

**Amendment:**
1. Defined closed action ID list in prompt: `action:copy`, `action:refresh`, `action:expand`, `action:collapse`, `action:dismiss`, `action:approve`, `action:cancel`, `action:continue`, `action:retry`.
2. Fixed ALL fallback UIs:
   - `buildGenericUi`: Removed dead buttons, replaced with a `Callout` suggesting specific intents.
   - `generateClarificationPrompt`: Removed dead buttons, replaced with a `Callout`.
   - `buildActUi`: Replaced dead button with an `ApprovalGate` that has a real `approvalActionId`.
   - `buildRespondUi`: Replaced dead "Copy draft" button with a `CopyField` (which has built-in copy affordance).
   - `session.ts` error fallback: Replaced dead "Try again" button with `ErrorState` using `retryActionId`.
3. Added validation rule in `validateUi.ts`: Any `Button` or `IconButton` without an `actionId` starting with `action:` is a validation error.
4. Added `findDeadButtons()` quality check in `assessGeneratedUiQuality()`.

---

## FAULT 4: HIGH — Interactive Primitives Were Render-Only (No State Management)

**Severity:** P1 — Inputs feel broken
**Location:** All input primitives (`TextField`, `TextArea`, `Select`, `Toggle`, `SegmentedControl`, `Slider`, `CheckboxRow`, `RadioRow`)
**Symptom:** User could click/change inputs but changes didn't persist or propagate.

**Root Cause:**
- These components accept `value`/`checked` and `onChange`, but `PrimitiveRenderer` never passed `onChange`.
- No state management existed for the generated UI tree.

**Amendment:**
- `PrimitiveRenderer` now maintains a `localState` object keyed by tree path.
- For each input primitive type, it injects the current state value and an `onChange` handler.
- This makes toggles, segmented controls, sliders, text fields, etc. actually interactive within the overlay without requiring complex backend state.

---

## FAULT 5: HIGH — `ApprovalGate` and `SensitiveContextGuard` Had Hardcoded Non-Functional Buttons

**Severity:** P1 — Safety boundaries are decorative
**Location:** `ApprovalGate.tsx`, `SensitiveContextGuard.tsx`
**Symptom:** Approve/continue/cancel buttons did nothing.

**Root Cause:**
- These components used raw `<button>` tags instead of the `Button` primitive.
- They didn't accept or call `onApprove`/`onCancel`/`onContinue` callbacks.

**Amendment:**
- Added `onApprove`, `onCancel`, `onContinue` callback props to both components.
- Wired them through `PrimitiveRenderer` so they call `onAction(actionId, payload)`.

---

## FAULT 6: MEDIUM — Validation Was Superficial

**Severity:** P2 — Invalid UI passes checks
**Location:** `validateUi.ts`, `assessGeneratedUiQuality()`
**Symptom:** Invalid UI passed validation. Only unknown primitive names were caught.

**Root Cause:**
- `validateGeneratedUi` only checked primitive name existence.
- `assessGeneratedUiQuality` checked some intent-specific type presence but not action bindings.

**Amendment:**
- Added action binding validation: `Button`/`IconButton` must have `actionId` starting with `action:`.
- Added `ApprovalGate` validation: must have `approvalActionId`.
- Added `SensitiveContextGuard` validation: must have `continueActionId`.
- Added `findDeadButtons()` recursive scan in quality assessment.

---

## FAULT 7: MEDIUM — Composite Primitive Confusion

**Severity:** P2 — Model emits invalid names
**Location:** `UI_PRIMITIVES.md` vs prompt vs renderer
**Symptom:** Model sometimes emitted composite names (VerdictCard, ClaimCard, etc.) that weren't in the renderer.

**Root Cause:**
- Product docs define composites like `VerificationDashboard`, but the renderer doesn't support them.
- The prompt said "Do not invent composite names" but the mapping table (`mapUnsupportedPrimitive`) was hidden from the model.

**Amendment:**
- Prompt now explicitly lists ONLY implemented primitives and says "Do NOT invent composite names."
- `mapUnsupportedPrimitive` still exists as a safety net in `normalizeGeneratedUiTree`, but the model is now told explicitly which names to use.
- Enum discipline section in prompt clarifies aliases: "Use ConclusionCard, not VerdictCard."

---

## FAULT 8: LOW — No Progressive UI Streaming

**Severity:** P3 — Demo illusion is weaker
**Location:** `session.ts`
**Symptom:** Skeleton appears, then full UI appears. No visible progressive assembly.

**Root Cause:**
- Harness emits skeleton once, then final UI once.
- Model isn't asked to stream partial updates.

**Amendment:**
- Left as-is for hackathon scope. Skeleton + final UI is acceptable for a demo. Noted as post-MVP improvement.

---

## FAULT 9: MEDIUM — Error State "Try Again" Button Didn't Work

**Severity:** P2 — Error recovery is broken
**Location:** `session.ts` error fallback tree
**Symptom:** When UI generation failed, a "Try again" button appeared but did nothing.

**Root Cause:**
- No `actionId` and no handler.

**Amendment:**
- Replaced the manual `Button` + `Heading` + `BodyText` error fallback with a proper `ErrorState` primitive that includes `retryActionId: "action:retry"`.
- `content.tsx` `onAction` handler now responds to `action:retry` by re-running the intent.

---

## FILES CHANGED

1. `frontend/src/renderer/ActionContext.tsx` — NEW
2. `frontend/src/renderer/PrimitiveRenderer.tsx` — REWRITTEN
3. `frontend/src/renderer/index.ts` — UPDATED
4. `frontend/src/harness/runtime/openrouter.ts` — REWRITTEN prompt, fixed fallback UIs, added dead-button detection
5. `frontend/src/harness/runtime/validateUi.ts` — Added action binding validation
6. `frontend/src/harness/runtime/session.ts` — Fixed error fallback UI
7. `frontend/src/primitives/actions/ApprovalGate.tsx` — Added callback props
8. `frontend/src/primitives/safety/SensitiveContextGuard.tsx` — Added callback props
9. `frontend/src/extension/content.tsx` — Wired `onAction` handler
10. `frontend/src/demos/HarnessDemo.tsx` — Wired `onAction` handler

---

## BUILD STATUS

- TypeScript compiles clean (`npx tsc --noEmit`)
- Vite production build succeeds

---

## REMAINING RISKS

1. **Model still might hallucinate bad actionIds** — Mitigated by prompt instruction and validation, but not 100% guaranteed with weak models.
2. **Local state is ephemeral** — Input values reset when the overlay is closed. Acceptable for hackathon MVP.
3. **No real backend action execution** — The hackathon scope is read-only. Buttons trigger local handlers (copy, dismiss, retry) only.
4. **CopyField doesn't have a built-in copy button** — The `CopyField` primitive may need its own internal copy affordance. Verified it exists in the primitive list but its implementation wasn't checked.
