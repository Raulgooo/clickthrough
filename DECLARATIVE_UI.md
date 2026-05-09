# Clickthrough Declarative UI

## One Clear Idea

Clickthrough should not ask the model to design screens.

Clickthrough should ask the model to declare what interface the current moment needs, then let the renderer turn that declaration into a native-feeling, safe, beautiful overlay.

```txt
page context + user intent
  -> surface plan
  -> data model
  -> primitive tree
  -> validated renderer
  -> cursor-native overlay
```

## Why This Belongs In The System

Declarative UI gives the model a product grammar. The model can choose the right interface shape without inventing components, CSS, layout hacks, or action wiring.

The useful split is:

- **Model owns**: intent, hierarchy, content, evidence, action choices, uncertainty, and style intent.
- **Renderer owns**: exact components, responsive fit, host adaptation, accessibility, motion, safe actions, and visual polish.

This is how Clickthrough gets model creativity without model chaos.

## Research Signals

- **A2UI** frames agent UI as structured interface payloads that clients can render safely.
- **AG-UI** fits Clickthrough's streaming runtime: state, tool progress, partial UI, approval, and final result flow over events.
- **Vercel AI SDK generative UI** proves that tools can return interface artifacts, but Clickthrough should keep the artifact as primitive data rather than arbitrary React.
- **Structured outputs / JSON Schema** are the reliability mechanism: the model must produce a contract-valid declaration, not prose that a renderer guesses at.

Reference links:

- https://a2ui.org/
- https://docs.ag-ui.com/
- https://sdk.vercel.ai/docs/ai-sdk-rsc/generative-ui-state
- https://platform.openai.com/docs/guides/structured-outputs

## The Contract

The generated UI payload has four layers.

```ts
type GeneratedUI = {
  overlayMode: OverlayMode;
  surface?: DeclarativeSurfacePlan;
  dataModel?: Record<string, unknown>;
  root: ClickthroughNode;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
  hostTheme?: HostTheme;
};
```

### 1. Surface Plan

The surface plan is the model's answer to: "What interface should exist here?"

```ts
type DeclarativeSurfacePlan = {
  intent: "verify" | "understand" | "act" | "respond" | "navigate" | "summarize" | "mixed";
  purpose: string;
  anchor: UIAnchorIntent;
  layout: UILayoutIntent;
  style: UIStyleIntent;
  interaction: UIInteractionIntent;
};
```

This layer keeps product clarity before component detail.

Example:

```json
{
  "intent": "verify",
  "purpose": "Check a selected claim without leaving the tweet",
  "anchor": { "source": "selection", "textQuote": "joining Amazon as a summer intern", "fallbackMode": "anchored_popover" },
  "layout": { "pattern": "evidence_dashboard", "density": "compact", "hierarchy": "sectioned", "maxAttention": "medium" },
  "style": { "hostFit": "blend", "tone": "warning", "emphasis": "balanced", "motion": "progressive", "visualPriority": ["claim", "source", "verdict"] },
  "interaction": { "requiresApproval": false, "canMinimize": true, "canDismiss": true, "followUpMode": "anchored" }
}
```

### 2. Data Model

The data model is the factual substrate: claims, sources, fields, steps, risks, drafts, evidence, and verification results.

Rules:

- Data must be source-grounded when it represents web facts.
- Images from the web stay attached to their source URL.
- Risk and uncertainty are explicit data, not just visual tone.
- Sensitive actions must include approval data before they can execute.

### 3. Primitive Tree

The primitive tree is the renderable interface.

The model composes known primitives:

```json
{
  "type": "OverlayRoot",
  "props": { "intent": "verify", "mode": "popover" },
  "children": [
    { "type": "AnchorHighlight", "props": { "label": "Claim" } },
    { "type": "EvidenceStack", "props": { "groupBy": "stance" } },
    { "type": "ConclusionCard", "props": { "verdict": "unverified" } }
  ]
}
```

It never emits raw HTML, raw CSS, raw script, or unregistered components.

### 4. Renderer Execution

The renderer validates the tree, maps primitives to React components, applies host tokens, positions the overlay, and connects actions back to the harness.

The renderer can reject, repair, or downgrade:

- unknown primitive
- unsafe prop
- missing approval gate
- raw HTML/CSS/script
- impossible anchor
- layout too large for viewport

## Styling Intent

Styling intent is not CSS. It is a short set of design constraints:

- `hostFit`: inherit, blend, contrast, or CT-controlled
- `tone`: neutral, info, success, warning, danger
- `emphasis`: quiet, balanced, strong
- `motion`: none, subtle, progressive, urgent
- `visualPriority`: what the eye should find first

This lets design skills and prompts improve model taste while keeping implementation centralized.

Bad:

```json
{ "style": "background: linear-gradient(...); position: fixed; ..." }
```

Good:

```json
{
  "style": {
    "hostFit": "blend",
    "tone": "warning",
    "emphasis": "balanced",
    "motion": "progressive",
    "visualPriority": ["risk", "action"]
  }
}
```

## Cursor-Native Behavior

Clickthrough should feel like the browser briefly grows the missing interface from the user's cursor.

Order of anchoring:

1. selected text
2. focused control
3. hovered element
4. cursor/caret point
5. visible page region
6. viewport fallback

Small intent should stay small:

- "What is this?" -> anchored explanation bubble
- "Is this true?" -> anchored evidence popover
- "Do this workflow" -> panel or workbench after approval context
- "Explain this PDF section" -> side panel or spotlight

The expansion rule:

> Start where intent happened. Grow only as much as the task requires.

## Model Prompt Shape

The UI generation prompt should request three artifacts in one structured output:

```txt
1. surface: explain the interface shape and placement
2. dataModel: grounded facts, risks, actions, and state
3. root: Clickthrough primitive tree
```

The prompt should forbid:

- raw HTML
- raw CSS
- arbitrary React
- hidden action bindings
- unsupported primitive names
- certainty without evidence
- sensitive actions without approval

## Two-Step Generation

For higher quality, Clickthrough may use a fast style-planning step before the principal UI generation step.

```txt
user prompt + page context + host theme
  -> fast style planner
  -> primordial style brief
  -> principal CT agent
  -> surface plan + data model + primitive tree
```

The style planner does not generate UI. It generates a compact brief that tells the principal agent what kind of interface would fit the moment.

```ts
type PrimordialStyleBrief = {
  intent: string;
  interfaceArchetype: string;
  anchorStrategy: string;
  layoutBias: string;
  visualTone: string;
  density: "compact" | "comfortable" | "spacious";
  hostAdaptation: "inherit" | "blend" | "contrast" | "ct_controlled";
  motionHint: "none" | "subtle" | "progressive" | "urgent";
  priorityOrder: string[];
  avoid: string[];
};
```

Example:

```json
{
  "intent": "verify",
  "interfaceArchetype": "anchored evidence dashboard",
  "anchorStrategy": "start from the selected claim, preserve the tweet in view",
  "layoutBias": "compact sectioned popover with source trail and verdict visible without scrolling",
  "visualTone": "skeptical but calm",
  "density": "compact",
  "hostAdaptation": "blend",
  "motionHint": "progressive",
  "priorityOrder": ["claim", "search progress", "source quality", "contradiction", "verdict"],
  "avoid": ["chat transcript", "generic card grid", "decorative imagery", "certainty without evidence"]
}
```

The principal agent uses this brief as design direction, not as law. Safety, evidence, approval, and renderer validation always override style guidance.

### Why Two Steps

The fast planner gives the main agent a clean design frame before it starts composing primitives. This usually improves layout coherence, visual taste, and cursor-native placement because the main agent is not discovering product direction while also reasoning about tools, facts, and actions.

Rules:

- The brief must be short enough to fit in the main agent prompt without crowding evidence.
- The brief must not contain raw CSS, raw HTML, or component code.
- The brief should name what to avoid as clearly as what to create.
- The main agent may ignore the brief if page facts, safety, or viewport constraints conflict.
- Cache briefs per intent/page archetype during demos when possible.

## First Implementation Slice

1. Make `surface` required after current static demos are migrated.
2. Validate `surface`, `dataModel`, and primitive tree together.
3. Teach the planner to select one of five layout patterns:
   - anchored card
   - evidence dashboard
   - visual explainer
   - action surface
   - response assistant
4. Make the renderer use `surface.anchor` before overlay fallback positioning.
5. Add fixtures for one good and one rejected declaration per demo scene.

## Product Test

A generated UI is good when a teammate can answer this in five seconds:

> What did Clickthrough notice, what did it make, what can I safely do next?

If the answer is unclear, the declaration is too vague.
