# Clickthrough Comprehensive Analysis

**Date:** 2026-05-10
**Scope:** Full codebase audit across harness, UI primitives, demo fidelity, and product potential
**Method:** Four parallel deep-dive subagent investigations

---

## Executive Summary

Clickthrough is a **strongly conceived, moderately executed** project with genuine architectural insight: constrain the agent through a typed primitive schema rather than letting it emit arbitrary HTML. The vision -- "the browser becomes intent-native" -- is clear and differentiated.

However, the gap between the documentation and the code is significant. The harness is a linear script masquerading as a state machine. The UI primitive system is spec-heavy and implementation-light, with 92 primitives that guarantee LLM hallucination. The four demo scenarios are beautiful hand-coded theater, not generated UI. The product has high ceiling potential (vision 8/10) but low current floor (execution 5/10).

**Overall Potential Score: 5.55 / 10**

| Dimension | Score | Weight | Weighted |
|---|---|---|---|
| Vision Originality | 8/10 | 15% | 1.20 |
| Technical Feasibility | 5/10 | 25% | 1.25 |
| Everyday Utility | 5/10 | 25% | 1.25 |
| Demo Impressiveness | 7/10 | 20% | 1.40 |
| Execution Risk (inverse) | 3/10 | 15% | 0.45 |
| **Total** | | | **5.55** |

---

## 1. Harness Analysis

### 1.1 What the Harness Actually Does

The harness is a **frontend-only, single-shot pipeline** disguised as a state machine. Its execution flow in `frontend/src/harness/runtime/session.ts` is entirely linear:

1. Receive intent via `LocalHarnessSession.streamInput()`
2. Build page context from `pageBridge.ts` (URL, title, visible text, screenshot, page type guess)
3. Classify intent by calling an LLM (OpenRouter/Gemini 2.0 Flash) with a heavy system prompt; fallback to regex heuristics
4. Emit a skeleton UI based on the intent family (hardcoded per-family shapes)
5. Run tools -- but only `web.search` (via Exa) if `classification.needsWebSearch` is true, then optionally `web.fetch` on the single top result
6. Generate UI by calling the LLM a second time to produce a JSON primitive tree
7. Validate/repair/fallback through a 3-tier cascade
8. Emit final UI patch and close the session

The state machine exists on paper (`AGENT_LOOP.md`, `types/harness.ts`) but the runtime only emits state events as sequential milestones. There is no state-driven transition logic, no branching, and no replanning.

### 1.2 Rigidity Problems

| Problem | Severity | Evidence |
|---|---|---|
| **The "Loop" Is a Straight Line** | 9/10 | `session.ts:103-322` -- single `async runLoop()` with no iteration. The `while (!run.done)` pseudocode from `HARNESS.md:824` is fiction. |
| **No Real Planner** | 9/10 | `AgentPlan` type exists but is **never instantiated**. Planning state emits a pre-baked skeleton and immediately moves on. |
| **Tool Registry Is a Skeleton** | 8/10 | Only 2 tools exist (`web.search`, `web.fetch`). No DOM tools, no memory tools, no MCP tools. `session.ts:158,222` hardcodes tool names. |
| **Budget Enforcement Is Cosmetic** | 7/10 | `maxModelTurns` is ignored. Model is called exactly twice. Cost tracking does not exist. Only check is `Date.now() > budget.deadline`. |
| **Hardcoded Overlay Modes** | 7/10 | `session.ts:505-521` maps intent family to overlay mode with a `switch`. No content-shape analysis. |
| **Deterministic Fallbacks Are Templates** | 7/10 | `openrouter.ts:952-1089` builds the same UI structure every time for a given intent. |
| **Action Execution Is Orphaned** | 8/10 | `actionExecutor.ts` defines `executeBrowserActionPlan()` but **nothing calls it**. |
| **Sessions Die After One Run** | 8/10 | `session.ts:77` calls `this.close()` after `runLoop` finishes. No follow-ups, no memory. |

### 1.3 Intelligence Gaps

| Problem | Severity | Evidence |
|---|---|---|
| **Zero Memory System** | 9/10 | `session.ts:68`: `memory: { recentTurns: [], siteHints: [], userPreferences: [] }` -- hardcoded empty. |
| **No Learning From Corrections** | 8/10 | `UserSteeringEvent` includes `redirect` and `answer_question`, but `session.ts:45-60` only handles `interrupt` and `approval.resolved`. |
| **No Multi-Step Planning** | 9/10 | If `web.search` returns nothing, harness does not replan. Passes empty sources to UI generator. |
| **Shallow Reasoning** | 7/10 | Intent classification uses massive prompt or keyword matching (`heuristicClassify` at `openrouter.ts:309-327`). No embedding-based similarity. |
| **Poor Error Recovery** | 7/10 | If UI generation throws -> static error panel. If validation fails -> deterministic fallback. If fallback fails -> emit anyway. |
| **No Verification Step** | 7/10 | `verification` is a core state in specs but `session.ts` jumps from `generating_ui` directly to `completed`. |

### 1.4 Protocol Gaps

- **AG-UI Integration:** Almost entirely aspirational. `mockEvents.ts` admits it simulates AG-UI-style events. The harness emits custom `HarnessEvent` types consumed in-memory by React hooks. No wire protocol, no JSON stream parsing.
- **MCP Loading:** Nonexistent. `HARNESS.md:619-647` documents MCP deferred loading in detail. Zero MCP code in frontend.
- **Backend Harness:** Fiction. `HARNESS.md:777-793` lists backend modules. No `backend/` directory exists.

---

## 2. UI Primitive System Analysis

### 2.1 System Summary

The system defines **92 primitives** across **13 categories**. The renderer (`PrimitiveRenderer.tsx:153-271`) maintains a hand-written `primitiveMap` that maps string `type` names to imported React components. It recursively renders the tree and wires local state for a hardcoded set of input primitives.

### 2.2 Rigidity Problems

| Problem | Severity | Evidence |
|---|---|---|
| **No Escape Hatch for Styling** | 7/10 | Agent schema allows `Record<string, unknown>` props, but primitives only accept strict prop sets. Renderer ignores unknown props. |
| **Hardcoded Internal Layouts** | 8/10 | `SplitPane` forces exactly 2 children. `SequenceDiagram` hardcodes `actors[0]` and `actors[1]` -- cannot handle 3+ actors. |
| **Missing Composite Primitives** | 9/10 | `UI_PRIMITIVES.md:905-966` defines `VerificationDashboard`, `VisualExplainer`, `ActionSurface`, `ResponseAssistant`. **They do not exist in code.** The LLM prompt explicitly forbids them. |
| **Children Support Is Inconsistent** | 7/10 | `Tabs` only renders headers, no content panels. `Accordion` items take `content: string`, not `ClickthroughNode[]`. |
| **No Rich Text or Markdown** | 7/10 | No `Markdown`, `Link`, `List` primitives. `BodyText` only takes plain `string`. |
| **ChartFrame Is Fake** | 6/10 | Accepts `type: "bar" | "line" | "pie" | "area"` but ignores the prop, always renders CSS bar charts. |
| **Host Theme Is a No-Op** | 8/10 | `OverlayRoot` stringifies `hostTheme` to a `data-host-theme` attribute and never uses it for styling. |

### 2.3 Generation Constraints

| Problem | Severity | Evidence |
|---|---|---|
| **92 Primitives = Hallucination Guaranteed** | 9/10 | Massive schema surface. LLM context consumed just describing primitives. |
| **Spec-to-Code Name Drift** | 9/10 | Spec defines `ClaimCard`, `CheckboxList`, `PlainExplanation`. Code has `QuoteCard`, `CheckboxRow`, no `PlainExplanation`. |
| **Zero Runtime Prop Validation** | 8/10 | `PrimitiveRenderer.tsx:300-309` only checks `type` exists. No prop validation. |
| **No Schema Introspection for Agent** | 7/10 | `PrimitiveManifestSummary` exists in `types/ui.ts:126-132` but no code builds or serves it. |
| **Inconsistent Action Wiring** | 6/10 | Only `Button`, `IconButton`, `ApprovalGate`, `SensitiveContextGuard` get `onAction` wiring. `Tabs`, `Accordion`, `ClarificationPrompt` have no action emission. |

### 2.4 Visual/UX Quality

| Problem | Severity | Evidence |
|---|---|---|
| **Hardcoded Light-Mode Colors** | 7/10 | `Button.tsx:25` uses `bg-[#000000]`. `TextField.tsx:28` uses `bg-white`. Zero dark mode support despite Tailwind config. |
| **Host Font Adaptation Is Fake** | 7/10 | `Heading.tsx:16` forces `font-['Geist']`. `Button.tsx:24` forces `font-['JetBrains_Mono']`. No component reads `HostTheme.fontFamily`. |
| **Inconsistent Visual Language** | 6/10 | Mix of Tailwind semantic tokens and raw hex values. `ExecutionLog` uses ASCII icons while others use `material-symbols-outlined`. |
| **Broken Responsive Logic** | 5/10 | `SplitPane.tsx:20` emits `max-[${collapseBelow}px]:grid-cols-1` -- Tailwind does not support dynamic arbitrary values at build time. |
| **Material Symbols Single Point of Failure** | 5/10 | Every icon uses `material-symbols-outlined`. No fallback if font fails or agent hallucinates icon name. |

---

## 3. Demo & UI Generation Analysis

### 3.1 Demo Reality Check

| Demo | Status | Evidence |
|---|---|---|
| **Verify** | **Fake** | `VerifyDemo.tsx:119-184` -- hardcoded `IdentityCard`, `EvidenceSource`, `ConclusionCard`. No live search. |
| **Understand** | **Fake** | `UnderstandDemo.tsx:68-121` -- hardcoded `SequenceDiagram`, `Stepper`, `ComparisonTable`. No LLM. |
| **Assist/Act** | **Fake** | `ActDemo.tsx:19-59` -- hardcoded `LOG_MESSAGES` array with `setTimeout` iteration. |
| **Respond** | **Fake** | `RespondDemo.tsx:17-50` -- pre-written `REPLIES` array, random picker for "regenerate." |
| **HarnessDemo** | **Real** | Uses `useHarnessSession` -> `LocalHarnessSession` -> OpenRouter + Exa. But output is generic and unpredictable. |

### 3.2 Mock vs Real

- **80% of visible demo UI is hardcoded.** The real LLM path exists but is visually inferior.
- **Mock events drive demos:** `mockEvents.ts:17-434` is entirely `setTimeout`-based fake event streams.
- **No progressive generation in real path:** `session.ts` emits skeleton then full tree, but hardcoded demos fake this with CSS swaps.

### 3.3 Demo Quality Assessment

**Strong:**
- High concept: "The browser reshapes itself around intent" is genuinely strong.
- Polished primitives in hardcoded demos look good.
- Safety UX (`UncertaintyNote`, `RiskSummary`, `ApprovalGate`) shows maturity.

**Weak:**
- Theater, not magic. A judge asking "Can I type my own tweet?" gets "no."
- No browser extension -- "Twitter" and "PDF" are `<div>` components inside the React app.
- 10--30 second latency for real LLM path (classify + search + generate + validate).
- Social scene (`RespondDemo`) includes risky content that could alienate judges.

---

## 4. Product & Documentation Analysis

### 4.1 Vision Clarity

The vision is **exceptionally clear and obsessively repeated**. Every doc opens with: "runtime interface layer for the web," "not a chatbot, sidebar, or separate assistant app," and "the browser becomes intent-native." The positioning line is memorable: **"Chatbots explain the maze. Clickthrough generates the door."**

The primitive-schema approach (agent emits structured `ClickthroughNode` trees) is a genuine architectural differentiator.

### 4.2 Documentation Coherence

**Contradictions Found:**

| Contradiction | Location |
|---|---|
| **"Act" vs "Assist/Navigate" confusion** | `HARNESS.md`/`ARCHITECTURE.md` still document SharkAuth automation. `BRIEF.md`/`DEMO.md` switched to Jarvis-like read-only copilot. |
| **Backend architecture contradiction** | `STACK.md:109-145` demands full backend with SSE. `BRIEF.md:74` says no backend needed. Code has no backend. |
| **Primitive name drift** | `UI_PRIMITIVES.md` defines composites (`VerificationDashboard`). Code forbids them in LLM prompt. `mapUnsupportedPrimitive` remaps aliases. |
| **Action execution scope** | `AGENTS.md` defers action execution. `HARNESS.md` contains 60+ lines of detailed execution specs. |

### 4.3 Everyday Tool Potential

**Strongest Use Cases:**
1. **Verify (Twitter/X fact-checking):** Clear upgrade over opening a new tab to search.
2. **Assist/Navigate (Jarvis page copilot):** Most defensible daily-use case for dense dashboards and complex docs.
3. **Understand (visual explainer):** Strong for developers and students, but narrower.

**Fatal Flaws Preventing Adoption:**

| Flaw | Impact |
|---|---|
| **Browser extension distribution is a graveyard** | No store strategy, high friction, terrible retention. |
| **MVP is read-only** | Most valuable use case (automation) is deferred. Competes with Cmd+F and chatbots. |
| **Latency will kill daily use** | 10--30 seconds for simple tasks. Users won't wait. |
| **LLM-generated UI is inherently unreliable** | Fallback produces boring generic output. Consistency > occasional brilliance for daily use. |
| **Privacy is unaddressed** | Every page sends screenshots and DOM to OpenRouter/Gemini and Exa. No data policy. |
| **Host adaptation is a shallow stub** | `hostTheme.ts` samples only body styles. Promise of "visually adapting" is unfulfilled. |

### 4.4 Hackathon Fit

- **Kill the Dashboard:** Strong fit.
- **No Designer, No Problem:** Strong fit.
- **The Copilot That Ships:** Moderate. MVP is read-only, so it cannot actually "ship" actions.

The narrative is strong enough to win **if the code works during the demo**. The progressive skeleton-loading effect is exactly what judges want.

---

## 5. Root Cause Analysis

### 5.1 Why the Harness Feels "Dumb"

The harness is not a loop. It is a **linear function** (`classify -> search -> generate -> done`) that happens to emit state strings along the way. It cannot:
- Replan when tools fail
- Remember previous turns
- Learn from user corrections
- Iterate on partial results

**Root cause:** The architecture docs describe a Ferrari, but the implementation is a bicycle with a nice paint job.

### 5.2 Why the Primitives Feel "Rigid"

The system tries to be a **complete component library** (92 primitives) when it should be a **generative grammar** (12 composites + 20 atoms). The LLM cannot reliably compose from 92 names, so it hallucinates, and the renderer rejects or silently corrupts the output.

**Root cause:** Spec-first design. The team wrote a design document for a full design system, then partially implemented it, creating a mismatch between what the agent thinks exists and what the renderer can render.

### 5.3 Why the Demos Are "Theater"

The beautiful demos are **hand-coded React components** with `setTimeout` state flips. The real harness produces **generic, unpredictable UI trees**. The team optimized for visual polish in the mocks rather than making the real path produce beautiful output.

**Root cause:** Two parallel UI systems -- static mocks for demos, generic LLM output for "real" mode -- that were never reconciled.

---

## 6. Recommended Fix: Composites + Atoms Decision Graph

### 6.1 The Core Idea

Instead of dumping 92 primitives into the LLM prompt, give the agent a **decision graph** that progressively narrows the primitive palette based on **intent + content shape**.

### 6.2 Three-Layer Architecture

**Layer 1: Content-Shape Decision Tree**
```
1. What is the user trying to do?
   |- verify a claim -> load VERIFY suite
   |- explain a concept -> load EXPLAIN suite
   |- prepare an action -> load ACT suite
   |- draft a response -> load RESPOND suite

2. What does the content look like?
   |- single claim + sources -> suggest EvidencePanel
   |- step-by-step process -> suggest ExplainerSteps
   |- diagram + explanation -> suggest ExplainerSplit
   |- form + risk -> suggest ActionForm
   |- draft + tone controls -> suggest ResponseComposer
   |- none of the above -> free-form atoms

3. How many items?
   |- 1 item -> Stack vertical
   |- 2-5 comparable items -> Grid
   |- 6+ items -> Grid + Section groups
   |- mixed diagram + text -> SplitPane
```

**Layer 2: Composites (High-Level LEGO Sets)**
Define ~12 composites that the agent CAN emit. Each composite is a pre-built assembly of atomic primitives. The renderer decomposes them at runtime.

| Composite | Maps To (atomic assembly) |
|---|---|
| `EvidencePanel` | `Panel > Stack > InlineQuote + Grid > EvidenceSource[] + ConclusionCard + ProgressBar` |
| `ExplainerSplit` | `Panel > SplitPane > SequenceDiagram/Timeline + Stack > Stepper + Callout` |
| `ExplainerSteps` | `Panel > Stack > Stepper + Stack > Callout[] + SegmentedControl` |
| `ActionForm` | `Panel > Stack > StepList + ScopeMatrix + RiskSummary + ApprovalGate` |
| `ResponseComposer` | `Panel > Stack > PrivateModeBadge + BodyText + Timeline + TextArea + SegmentedControl + Button` |
| `SourceGrid` | `Panel > Grid > EvidenceSource[]` |
| `VerdictBanner` | `Stack > ConclusionCard + ProgressBar + UncertaintyNote` |
| `RiskPanel` | `Panel > Stack > RiskSummary + AuditTrail` |
| `ProgressOverlay` | `Panel > Stack > Skeleton + ProgressList` |
| `ErrorOverlay` | `Panel > ErrorState + Button(action:retry)` |
| `EmptyOverlay` | `Panel > EmptyState + Button(action:dismiss)` |
| `ConfirmationDialog` | `Panel > IntentConfirmation + Stack > Button + Button` |

**Layer 3: Reduced Atomic Palette**
For custom layouts, the agent only sees ~20 atomic primitives:

```
Layout: Panel, Stack, Grid, Section, SplitPane
Text: Heading, BodyText, StatusPill, Callout, InlineQuote
Evidence: QuoteCard, IdentityCard, EvidenceSource, ConclusionCard
Visual: Timeline, SequenceDiagram, Stepper, ComparisonTable
Inputs: Button, TextArea, SegmentedControl, Toggle
Safety: RiskSummary, UncertaintyNote, SensitiveContextGuard
State: Skeleton, ErrorState, SuccessState
```

### 6.3 Why This Works

| Problem | How This Fixes It |
|---|---|
| 92 names = hallucination | Agent sees ~12 composites + ~20 atoms = ~32 names max |
| Composites in spec but not code | Composites become real, renderable primitives |
| No prop validation | Each composite has a typed prop interface |
| Identical UI per intent | Agent mixes composites + atoms freely per content shape |
| No progressive disclosure | Harness loads suites dynamically |

---

## 7. Action Plan (If Continuing)

### Immediate (Priority 1)
1. **Implement 4 core composites** matching your demo storyboard: `VerificationDashboard`, `VisualExplainer`, `ActionSurface`, `ResponseAssistant`
2. **Add composite decomposition to renderer** (`PrimitiveRenderer.tsx`)
3. **Rewrite LLM prompt** to composites + reduced atom palette
4. **Add composite prop validation** to `validateUi.ts`

### Short-term (Priority 2)
5. **Wire real harness into demo pages** -- stop maintaining two parallel UIs
6. **Add runtime prop validation** (Zod) for all primitives
7. **Implement host theme adaptation** or remove the claim
8. **Fix spec-to-code name drift** -- align `UI_PRIMITIVES.md` with actual code

### Medium-term (Priority 3)
9. **Make the harness actually loop** -- `while` loop with replanning, memory, follow-ups
10. **Add one more tool** -- implement `dom.scan` as a real harness tool
11. **Add real memory** -- even `localStorage` session history
12. **Solve latency** -- cache demo fixtures, pre-fetch common queries

### Kill / Defer
- Backend harness docs (no backend exists)
- MCP integration docs (zero code)
- SharkAuth action execution (read-only MVP)
- 92-primitive surface (replace with composites + atoms)

---

## 8. Final Verdict

**Should you keep investing?** Yes, but with brutal scope discipline.

The project has the **bones of something genuinely useful**. The architecture is thoughtful, the code is real (1,100+ lines of serious prompt engineering in `openrouter.ts`), and the narrative is strong. But the harness needs to become a real loop, the primitives need to shrink and validate, and the demos need to stop being theater.

If you make the three core changes (real loop, composite primitives, wire harness to demos), the score jumps from **5.5 -> 7.5** and this becomes a serious contender.
