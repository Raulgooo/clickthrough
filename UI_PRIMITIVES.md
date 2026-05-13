# Clickthrough UI Primitives

## Purpose

Clickthrough renders interfaces at runtime. The agent should not output arbitrary HTML for every task. It should compose a controlled set of atomic primitives into task-specific overlays, then let the renderer adapt those primitives to the current page, app, or OS surface.

The primitive system must support the four demo intents:

- **Verify**: investigate whether a claim is true.
- **Understand**: explain difficult content visually.
- **Act**: generate a safe action UI for an existing web app flow.
- **Respond**: help the user understand context and draft a reply.

The design goal:

> Same intelligence, different generated UI, visually adapted to the current page.

Interaction feel:

> Clickthrough should feel like a natural expansion of the cursor.

The overlay should appear where user intent is already focused: selected text, cursor position, focused control, hovered element, screenshot crop, app/window region, or the visible region that triggered the request. It should grow from a small invocation surface into the exact interface needed, then collapse back out of the way.

## Core Rendering Model

The agent emits a UI tree:

```ts
type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};
```

The renderer is responsible for:

1. Validating the schema.
2. Mapping primitives to real components.
3. Applying host-page, host-app, or OS-surface visual adaptation.
4. Managing loading, streaming, interaction, and state.
5. Routing approved actions to the browser/action layer.

The agent decides what interface should exist. The renderer decides how to make it safe, native-feeling, and consistent.

The agent may emit declarative styling intent such as density, emphasis, tone, preferred visualization, and host-fit strategy. It must not emit arbitrary CSS or one-off component code. Styling skills and prompts should guide the model toward better composition, while the renderer owns final layout, tokens, accessibility, and safety boundaries.

## Host Page Adaptation

Before rendering, Clickthrough samples the current page and creates a `HostTheme`.

```ts
type HostTheme = {
  mode: "light" | "dark";
  fontFamily: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor: string;
  surfaceColor: string;
  borderColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  borderRadius: number;
  controlRadius: number;
  shadowStyle: "none" | "soft" | "strong";
  density: "compact" | "comfortable" | "spacious";
  buttonStyle: "filled" | "outlined" | "ghost" | "mixed";
  inputStyle: "filled" | "outlined" | "underline";
};
```

Adaptation rules:

- Use the host font unless unreadable.
- Preserve host density where possible.
- Use Clickthrough's structure, but host-like controls.
- Never fully disappear into the page for dangerous actions; approval gates must remain visibly Clickthrough-controlled.
- Always include a small CT mark or affordance so the user knows the overlay is generated.
- Avoid generic glassmorphism, heavy gradients, or one-size-fits-all cards.

## Primitive Layers

Primitives are grouped by responsibility:

1. **Shell primitives**: mount, position, focus, and dismiss overlays.
2. **Layout primitives**: organize generated UI.
3. **Text primitives**: communicate hierarchy and status.
4. **Input primitives**: collect user choices.
5. **Data primitives**: show structured facts and evidence.
6. **Visualization primitives**: explain concepts visually.
7. **Action primitives**: preview, approve, execute, and verify workflows.
8. **Safety primitives**: expose risk, uncertainty, source quality, and consent.
9. **State primitives**: loading, streaming, errors, empty states, success.
10. **Composite primitives**: higher-level patterns made from atomic pieces.

## OS And Pointer Companion Primitives

These primitives support the AI pointer companion path. They are not a mascot layer. They exist to point, explain, preview, and verify at the user's current locus of intent.

### `PointerBuddy`

Compact CT presence near the pointer, selection, focused control, or screen region.

Props:

- `status`: `"idle" | "listening" | "capturing" | "thinking" | "speaking" | "acting" | "blocked"`.
- `anchor`: DOM, screen, cursor, selection, or app-window anchor.
- `hint`: optional one-line proactive suggestion.
- `activation`: `"hotkey" | "push_to_talk" | "pointer_grab" | "selection" | "chip"`.

Rules:

- Follow intent anchors, not every raw cursor movement.
- Decay or hide after dismissal.
- Never hide the exact target being referenced.

### `ScreenTargetHighlight`

Highlight or halo for a DOM element, app control, document region, screenshot crop, or accessibility target.

Props:

- `targetId`: stable target id when available.
- `bounds`: viewport or screen bounds.
- `targetKind`: `"dom" | "accessibility" | "ocr" | "screenshot" | "selection"`.
- `confidence`: `0-1`.
- `label`: short label.

Rules:

- Prefer DOM or accessibility binding over pixel-only coordinates.
- If the target is off-screen, pair with an approved scroll/focus preview.

### `CaptureIndicator`

Visible state for context capture.

Props:

- `scope`: `"page" | "active_window" | "crop" | "microphone" | "ocr" | "accessibility"`.
- `redaction`: `"not_needed" | "pending" | "applied" | "blocked_sensitive"`.
- `retention`: `"ephemeral" | "session" | "saved_by_user"`.

Use when:

- CT reads page context, microphone input, screenshot crops, OCR, or accessibility metadata.

### `VoiceTranscriptPill`

Short visible transcript of push-to-talk input or spoken output.

Props:

- `direction`: `"user" | "ct"`.
- `text`: transcript text.
- `state`: `"listening" | "transcribing" | "final" | "error"`.

### `WalkthroughStep`

A guided teaching/action step tied to the current app/page.

Props:

- `stepIndex`: number.
- `title`: short instruction.
- `target`: optional target id or bounds.
- `explanation`: short supporting text.
- `action`: optional prepared action.

### `ActionPreview`

Pre-execution preview for browser or OS actions.

Props:

- `actionKind`: `"click" | "type" | "scroll" | "drag" | "hotkey" | "focus_app" | "clipboard" | "submit"`.
- `target`: verified target summary.
- `reason`: why this action is proposed.
- `risk`: `"low" | "medium" | "high" | "handoff"`.
- `expectedResult`: expected postcondition.

Rules:

- Required before mutating browser/OS actions unless the user has already granted a scoped automation tier.

### `VerificationReceipt`

Post-action or post-claim result.

Props:

- `expected`: expected result.
- `observed`: observed result.
- `status`: `"matched" | "mismatch" | "uncertain" | "failed"`.
- `evidence`: optional source or screenshot summaries.

## 1. Shell Primitives

### `OverlayRoot`

Top-level mount for every Clickthrough UI.

Props:

- `id`: stable overlay id.
- `intent`: `"verify" | "understand" | "act" | "respond" | "mixed"`.
- `anchor`: optional DOM target or screen position.
- `mode`: `"inline" | "popover" | "panel" | "spotlight" | "fullscreen"`.
- `dismissible`: whether the user can close it.
- `hostTheme`: sampled host styling.

Use when:

- Every generated UI.

Rules:

- Must trap focus only when interactive.
- Must not block the page unless the task requires attention or approval.
- Must support Escape to close when safe.

### `PromptBar`

Minimal invocation surface for user intent.

Props:

- `value`: current prompt text.
- `placeholder`: short hint.
- `mode`: `"text" | "voice" | "text+voice"`.
- `hotkeyLabel`: optional visible shortcut.
- `status`: `"idle" | "listening" | "thinking" | "rendering"`.

Use when:

- User summons CT.
- Follow-up prompt is needed inside an overlay.

### `AnchorHighlight`

Highlights the source element or selected content that triggered the overlay.

Props:

- `targetSelector`: DOM selector or internal target id.
- `label`: short tag such as `"Claim"` or `"Selected paragraph"`.
- `tone`: `"neutral" | "info" | "warning" | "danger"`.
- `pulse`: whether to animate on first render.

Use when:

- A tweet claim is being checked.
- A PDF paragraph is being explained.
- A form/action target is being abstracted.

### `PageDimmer`

Subtle visual focus layer.

Props:

- `strength`: `0-1`.
- `preserveAnchor`: whether highlighted content remains fully visible.

Use when:

- Claim extraction.
- Approval gates.
- Complex generated panels.

### `CTMark`

Small brand/control mark showing the overlay is generated by Clickthrough.

Props:

- `variant`: `"badge" | "corner" | "wordmark" | "icon"`.
- `status`: `"idle" | "working" | "verified" | "warning"`.

Use when:

- Every overlay, subtly.

## 2. Layout Primitives

### `Panel`

General surface container.

Props:

- `title`: optional.
- `subtitle`: optional.
- `size`: `"xs" | "sm" | "md" | "lg" | "xl"`.
- `tone`: `"neutral" | "info" | "success" | "warning" | "danger"`.
- `chrome`: `"minimal" | "standard" | "dense"`.

Use when:

- Any bounded generated surface.

Rules:

- Do not nest panels inside panels unless creating a modal-like approval gate.

### `Section`

Logical group inside a panel.

Props:

- `title`: optional.
- `description`: optional.
- `collapsible`: boolean.
- `defaultOpen`: boolean.

Use when:

- Grouping evidence, form fields, steps, or explanation blocks.

### `Stack`

Vertical or horizontal rhythm primitive.

Props:

- `direction`: `"vertical" | "horizontal"`.
- `gap`: `"xs" | "sm" | "md" | "lg"`.
- `align`: `"start" | "center" | "end" | "stretch"`.
- `wrap`: boolean.

### `Grid`

Responsive grid for comparable items.

Props:

- `columns`: number or responsive map.
- `gap`: `"xs" | "sm" | "md" | "lg"`.
- `minColumnWidth`: optional number.

Use when:

- Source cards.
- Reply options.
- Metric comparisons.

### `SplitPane`

Two-region layout.

Props:

- `ratio`: `"1:1" | "2:1" | "1:2"`.
- `collapseBelow`: optional width.

Use when:

- Diagram plus explanation.
- Form plus risk summary.
- Verdict plus source trail.

### `Rail`

Compact side navigation or status rail.

Props:

- `items`: rail items.
- `activeId`: selected item.
- `orientation`: `"left" | "right" | "top"`.

Use when:

- Multi-section investigation.
- Step-by-step lesson.

## 3. Text And Status Primitives

### `Heading`

Props:

- `level`: `1 | 2 | 3 | 4`.
- `children`: text.

### `BodyText`

Props:

- `children`: text.
- `tone`: `"normal" | "muted" | "strong"`.
- `maxLines`: optional number.

### `StatusPill`

Short state label.

Props:

- `label`: text.
- `tone`: `"neutral" | "info" | "success" | "warning" | "danger"`.
- `icon`: optional.

Use when:

- "Searching"
- "Unverified"
- "Needs approval"
- "Created"

### `Callout`

Important note.

Props:

- `title`: optional.
- `body`: text.
- `tone`: `"info" | "success" | "warning" | "danger"`.
- `action`: optional button.

Use when:

- Risk warning.
- Medical/social disclaimer.
- Source uncertainty.

### `InlineQuote`

Quoted source text with attribution.

Props:

- `quote`: text.
- `source`: optional.
- `highlight`: optional substring.

Use when:

- Claim extraction.
- PDF paragraph selection.
- Evidence snippets.

## 4. Input Primitives

### `Button`

Props:

- `label`: text.
- `variant`: `"primary" | "secondary" | "ghost" | "danger"`.
- `icon`: optional.
- `actionId`: action to fire.
- `disabled`: boolean.

### `IconButton`

Props:

- `icon`: required.
- `label`: accessible label.
- `actionId`: action to fire.

Use when:

- Close, copy, retry, expand, collapse.

### `TextField`

Props:

- `label`: text.
- `value`: string.
- `placeholder`: optional.
- `required`: boolean.
- `validation`: optional.

### `TextArea`

Props:

- `label`: text.
- `value`: string.
- `rows`: number.
- `maxLength`: optional.

Use when:

- Reply drafts.
- Email/message body.
- Prompt refinement.

### `Select`

Props:

- `label`: text.
- `value`: selected value.
- `options`: array of label/value pairs.

### `Toggle`

Props:

- `label`: text.
- `checked`: boolean.
- `description`: optional.

Use when:

- With PKCE / without PKCE.
- Include source type.
- Full permissions enabled.

### `SegmentedControl`

Props:

- `value`: selected value.
- `options`: array of label/value pairs.

Use when:

- Evidence views.
- Tone modes.
- Explanation levels.

### `Slider`

Props:

- `label`: text.
- `value`: number.
- `min`: number.
- `max`: number.
- `step`: number.

Use when:

- Tone strength.
- Explanation depth.
- Confidence threshold.

### `CheckboxList`

Props:

- `label`: optional.
- `items`: checklist items.

Use when:

- Permission scopes.
- Sources to include.
- Verification checklist.

## 5. Data And Evidence Primitives

### `ClaimCard`

Represents the user-visible claim being investigated.

Props:

- `claim`: text.
- `speaker`: optional.
- `sourceUrl`: optional.
- `sourceLabel`: optional.
- `extractedFrom`: optional selected text.

Use in:

- Twitter/X verification scene.

### `IdentityCard`

Shows the entity Clickthrough believes the claim refers to.

Props:

- `name`: text.
- `aliases`: string array.
- `avatarUrl`: optional.
- `profiles`: profile links.
- `matchConfidence`: number `0-1`.

Use when:

- Resolving a person, company, or project.

### `EvidenceSource`

One source used in an investigation.

Props:

- `title`: text.
- `url`: string.
- `publisher`: optional.
- `date`: optional.
- `snippet`: optional.
- `stance`: `"supports" | "contradicts" | "neutral" | "background"`.
- `quality`: `"high" | "medium" | "low" | "unknown"`.
- `freshness`: `"current" | "stale" | "unknown"`.

Use when:

- Web-search-backed verification.

### `SourceStack`

List of evidence sources grouped by stance or quality.

Props:

- `sources`: `EvidenceSource[]`.
- `groupBy`: `"stance" | "quality" | "freshness" | "none"`.
- `defaultExpanded`: boolean.

### `ContradictionList`

Shows mismatches or missing signals.

Props:

- `items`: array of contradiction statements.
- `severity`: `"low" | "medium" | "high"`.

Use when:

- Public sources fail to support a claim.

### `ConfidenceMeter`

Visual confidence indicator.

Props:

- `value`: number `0-1`.
- `label`: text.
- `basis`: short explanation.
- `tone`: `"neutral" | "success" | "warning" | "danger"`.

Rules:

- Must not imply certainty when evidence is weak.
- Pair with a short explanation.

### `VerdictCard`

Final or interim answer.

Props:

- `verdict`: `"true" | "false" | "mixed" | "unverified" | "outdated" | "unknown"`.
- `headline`: text.
- `summary`: text.
- `confidence`: number `0-1`.
- `lastChecked`: timestamp.

Use when:

- Verification output.

### `SourceTrail`

Shows how Clickthrough got from claim to verdict.

Props:

- `steps`: array of source/search steps.
- `currentStep`: optional.

Use when:

- Making investigations feel transparent.

## 6. Visualization Primitives

### `Timeline`

Linear or cyclical timeline.

Props:

- `items`: dated or ordered events.
- `mode`: `"linear" | "cycle"`.
- `activeId`: optional.

Use when:

- Menstrual cycle explanation.
- Claim timeline.
- OAuth step sequence.

### `SequenceDiagram`

Actor-lane diagram for flows.

Props:

- `actors`: actor list.
- `messages`: ordered arrows.
- `activeStep`: optional.
- `highlightRisk`: optional step id.

Use when:

- OAuth PKCE explanation.
- Browser workflow preview.

### `FlowDiagram`

Node/edge diagram.

Props:

- `nodes`: graph nodes.
- `edges`: graph edges.
- `layout`: `"horizontal" | "vertical" | "radial"`.

Use when:

- Capability maps.
- Abstracting app actions.

### `ComparisonTable`

Compares options or states.

Props:

- `columns`: columns.
- `rows`: rows.
- `highlightColumn`: optional.

Use when:

- With PKCE vs without PKCE.
- Source agreement comparison.

### `AnnotatedDiagram`

Static or generated diagram with callouts.

Props:

- `title`: optional.
- `imageOrSvg`: optional.
- `callouts`: positioned annotations.

Use when:

- PDF teaching.
- Page capability explanation.

### `Stepper`

Interactive step sequence.

Props:

- `steps`: array of title/body/state.
- `activeStep`: number.
- `orientation`: `"horizontal" | "vertical"`.

Use when:

- OAuth explanation.
- Action execution preview.
- Workflow progress.

## 7. Action Primitives

### `ActionPlan`

Summarizes what CT intends to do.

Props:

- `goal`: text.
- `steps`: planned steps.
- `riskLevel`: `"low" | "medium" | "high"`.
- `requiresApproval`: boolean.

Use when:

- Any action inside a website.

### `GeneratedForm`

Form generated from intent and page capabilities.

Props:

- `title`: text.
- `fields`: schema-backed fields.
- `submitActionId`: action id.
- `secondaryActions`: optional.

Use when:

- Preparing a draft or checklist for the user.
- Post-MVP approved workflows.

### `ScopeMatrix`

Permission selector.

Props:

- `scopes`: permission rows.
- `selectedScopes`: selected ids.
- `mode`: `"read-only" | "editable"`.
- `riskLabels`: optional.

Use when:

- Explaining permission scopes.
- Previewing approval-gated choices.

### `ApprovalGate`

Explicit consent boundary before CT acts.

Props:

- `title`: text.
- `summary`: text.
- `risks`: risk list.
- `approveLabel`: text.
- `cancelLabel`: text.
- `approvalActionId`: action id.

Rules:

- Required before destructive, external, permission-changing, or irreversible actions.
- Must be visually distinct from host UI.

### `ExecutionLog`

Shows actions being performed.

Props:

- `entries`: array of status entries.
- `currentEntry`: optional.
- `mode`: `"compact" | "verbose"`.

Use when:

- Showing approval-gated browser automation progress.
- Showing read-only tool progress when a step-by-step log is clearer than a progress list.

### `VerificationResult`

Confirms whether the action worked.

Props:

- `status`: `"success" | "failed" | "partial" | "unknown"`.
- `summary`: text.
- `evidence`: optional.
- `nextActions`: optional.

Use when:

- After a read-only verification/check finishes.
- Post-MVP after an approved action is verified.

### `CopyField`

Sensitive or useful generated value with copy affordance.

Props:

- `label`: text.
- `value`: string.
- `masked`: boolean.
- `revealRequiresClick`: boolean.

Use when:

- Draft replies.
- Environment variables or generated commands.
- Any useful generated value the user may copy manually.

## 8. Safety And Trust Primitives

### `RiskSummary`

Props:

- `riskLevel`: `"low" | "medium" | "high"`.
- `items`: risk items.
- `recommendation`: optional.

Use when:

- Risky recommendations.
- Reply drafting.
- Ambiguous claims.

### `UncertaintyNote`

Props:

- `reason`: text.
- `missingEvidence`: optional list.
- `whatWouldChangeVerdict`: optional text.

Use when:

- Search results are inconclusive.

### `SourceQualityBadge`

Props:

- `quality`: `"high" | "medium" | "low" | "unknown"`.
- `reason`: text.

### `SensitiveContextGuard`

Props:

- `category`: `"health" | "finance" | "legal" | "security" | "personal"`.
- `message`: text.
- `continueActionId`: optional.

Use when:

- Social/health explanations.
- Credential, account, payment, legal, or private contexts.
- Risky workflows.

### `PrivateModeBadge`

Shows the overlay is local/private and not posted into the underlying app.

Props:

- `label`: text.

Use when:

- Chat/social response assistant.

## 9. State Primitives

### `Skeleton`

Props:

- `shape`: `"line" | "block" | "card" | "diagram" | "form"`.
- `count`: number.

Use when:

- Streaming dashboard creation.

### `ProgressList`

Props:

- `items`: array of progress states.

Use when:

- "Extracting claim"
- "Searching web"
- "Checking LinkedIn"
- "Building verdict"

### `EmptyState`

Props:

- `title`: text.
- `body`: text.
- `action`: optional.

### `ErrorState`

Props:

- `title`: text.
- `body`: text.
- `retryActionId`: optional.
- `details`: optional.

### `SuccessState`

Props:

- `title`: text.
- `body`: text.
- `nextActions`: optional.

## 10. Composite Primitives

Composite primitives are templates assembled from atomic primitives. They are allowed, but they must still decompose into atomic nodes.

### `VerificationDashboard`

Use for:

- "Is this true?"

Contains:

- `ClaimCard`
- `IdentityCard`
- `ProgressList`
- `SourceStack`
- `ContradictionList`
- `ConfidenceMeter`
- `VerdictCard`
- `SourceTrail`

### `VisualExplainer`

Use for:

- "Explain this visually."

Contains:

- `InlineQuote`
- `SequenceDiagram` or `Timeline`
- `Stepper`
- `SegmentedControl`
- `Callout`
- optional `ComparisonTable`

### `ActionSurface`

Use for:

- "Do X here."

Contains:

- `ActionPlan`
- `GeneratedForm`
- `RiskSummary`
- `ApprovalGate`
- `ExecutionLog`
- `VerificationResult`

### `ResponseAssistant`

Use for:

- "What does this mean and what do I say?"

Contains:

- `PrivateModeBadge`
- `PlainExplanation`
- `Timeline` or `AnnotatedDiagram`
- `ReplyDraft`
- `ToneSlider`
- `SensitiveContextGuard`

## Demo-Specific Primitive Assemblies

### Twitter/X Claim Verification

```json
{
  "type": "OverlayRoot",
  "props": { "intent": "verify", "mode": "popover" },
  "children": [
    { "type": "AnchorHighlight", "props": { "label": "Claim" } },
    {
      "type": "VerificationDashboard",
      "children": [
        { "type": "ClaimCard" },
        { "type": "IdentityCard" },
        { "type": "ProgressList" },
        { "type": "SourceStack" },
        { "type": "ContradictionList" },
        { "type": "VerdictCard" }
      ]
    }
  ]
}
```

### OAuth PDF Explainer

```json
{
  "type": "OverlayRoot",
  "props": { "intent": "understand", "mode": "panel" },
  "children": [
    { "type": "AnchorHighlight", "props": { "label": "Selected paragraph" } },
    {
      "type": "VisualExplainer",
      "children": [
        { "type": "InlineQuote" },
        { "type": "SequenceDiagram" },
        { "type": "Stepper" },
        { "type": "SegmentedControl", "props": { "options": ["With PKCE", "Without PKCE"] } },
        { "type": "Callout", "props": { "tone": "info" } }
      ]
    }
  ]
}
```

### Current Page Copilot

```json
{
  "type": "OverlayRoot",
  "props": { "intent": "navigate", "mode": "anchored_popover" },
  "children": [
    {
      "type": "ActionSurface",
      "children": [
        { "type": "ActionPlan" },
        { "type": "RiskSummary" },
        { "type": "ProgressList" },
        { "type": "VerificationResult" }
      ]
    }
  ]
}
```

### Social Context Reply

```json
{
  "type": "OverlayRoot",
  "props": { "intent": "respond", "mode": "popover" },
  "children": [
    { "type": "PrivateModeBadge" },
    {
      "type": "ResponseAssistant",
      "children": [
        { "type": "BodyText" },
        { "type": "Timeline" },
        { "type": "Callout", "props": { "tone": "warning" } },
        { "type": "TextArea" },
        { "type": "SegmentedControl" }
      ]
    }
  ]
}
```

## Accessibility Requirements

- Every interactive primitive must have a keyboard path.
- Every icon-only control must have an accessible label.
- Color cannot be the only signal for stance, risk, or status.
- Focus order must follow visual order.
- Generated diagrams need text equivalents.
- Approval gates must be reachable and understandable by keyboard and screen reader.
- Motion must respect reduced-motion settings.

## Interaction Requirements

- Stream skeletons before final content when work takes more than 300ms.
- Preserve the user's current page position.
- Do not hijack scroll unless the overlay is fullscreen.
- In OS companion mode, do not occlude the active control the user is trying to operate.
- Screen annotation overlays must show target confidence and keep a visible CT trust marker.
- Keep follow-up prompts close to the generated UI.
- Use approval before action.
- Show execution progress and verification after action.
- Let the user dismiss or minimize non-critical overlays.

## What The Agent Must Not Emit

- Raw arbitrary scripts.
- Unvalidated HTML.
- Irreversible action without `ApprovalGate`.
- Medical, legal, or financial certainty without a guard.
- A generic chat transcript as the primary UI.
- Identical dashboard layout for every intent.
- Hidden source uncertainty.

## Open Design Prompt

The canonical Open Design prompt now lives in `OPEN_DESIGN_PROMPT.md`.

Keep that prompt aligned with this primitive catalog. It must include browser-first overlays, OS companion extension points, pointer buddy behavior, screen target highlights, capture indicators, voice transcript states, walkthrough steps, action previews, and verification receipts.
