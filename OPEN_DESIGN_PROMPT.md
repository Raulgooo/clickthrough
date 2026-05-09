# Open Design Prompt For Clickthrough UI Primitives

Use this prompt in Open Design to generate the visual primitive library for Clickthrough.

```text
Design a comprehensive generative UI primitive system for a product called Clickthrough.

Clickthrough is a browser agent that lives on top of the current webpage. The user presses a hotkey or speaks a short request, and Clickthrough generates the exact overlay interface needed for that page and intent. It is not a chatbot, sidebar, or separate app. It is a runtime interface layer for the web.

The product thesis:

Any page, any intent, the exact UI you need.

The visual system must support four demo scenarios:

1. Twitter/X verification
The user sees a tweet from raulgcc1 claiming: "I'm excited to announce that I'm joining Amazon as a summer intern!" They ask: "Hey CT, is this true?" Clickthrough highlights the claim and generates a live evidence dashboard over the tweet with skeleton loading, identity matching, source cards, contradictions, confidence, and a verdict.

2. PDF learning
The user reads a dense OAuth 2.0 Authorization Code with PKCE paragraph and asks: "CT, explain this visually." Clickthrough generates a visual teaching overlay with a sequence diagram, stepper, with/without PKCE toggle, and callouts explaining why intercepted authorization codes are useless without the verifier.

3. SharkAuth action
The user is inside an auth dashboard and asks: "CT, I need to create a new full-permissions API key." Clickthrough generates a native-feeling action form with key name, environment, expiration, scope matrix, risk summary, approval gate, execution log, and verified result.

4. Social context
The user sees a message saying: "Sorry, I'm on my period and feel awful today," and asks: "CT, what does that mean and what do I say?" Clickthrough generates a private explanation and response assistant with a simple cycle timeline, what-not-to-say guidance, reply drafts, and tone controls.

Design the primitive library, not a single static page. The system should include atomic components and several composed examples.

Important design requirements:

- The same primitives must visually adapt to different host pages.
- Components should feel native to the current page while still clearly belonging to Clickthrough.
- Avoid generic chatbot UI, sidebars, landing-page aesthetics, glassmorphism, heavy gradients, and identical card grids.
- Make skeleton loading and progressive UI assembly visually obvious.
- Use compact, high-signal product UI.
- Include states for loading, streaming, success, error, warning, unverified, approval required, executing, and completed.
- Include accessibility-minded focus states and clear status communication.
- The generated UI should look like the browser briefly created the missing interface the user needed.

Create visual designs for these primitive categories:

Overlay shell:
- OverlayRoot
- PromptBar
- AnchorHighlight
- CTMark
- PageDimmer

Layout:
- Panel
- Section
- Stack
- Grid
- SplitPane
- Rail

Text and status:
- Heading
- BodyText
- StatusPill
- Callout
- InlineQuote

Inputs:
- Button
- IconButton
- TextField
- TextArea
- Select
- Toggle
- SegmentedControl
- Slider
- CheckboxList

Evidence:
- ClaimCard
- IdentityCard
- EvidenceSource
- SourceStack
- ContradictionList
- ConfidenceMeter
- VerdictCard
- SourceTrail

Visual explanation:
- Timeline
- SequenceDiagram
- FlowDiagram
- ComparisonTable
- AnnotatedDiagram
- Stepper

Action:
- ActionPlan
- GeneratedForm
- ScopeMatrix
- ApprovalGate
- ExecutionLog
- VerificationResult
- CopyField

Safety:
- RiskSummary
- UncertaintyNote
- SourceQualityBadge
- SensitiveContextGuard
- PrivateModeBadge

State:
- Skeleton
- ProgressList
- EmptyState
- ErrorState
- SuccessState

Then create four composed overlay mockups:

- VerificationDashboard over a Twitter/X-like page.
- VisualExplainer over a PDF reader.
- ActionSurface inside a SharkAuth-like dashboard.
- ResponseAssistant over a chat-like page.

End with a small design token set that can be adapted per host page:

- typography
- spacing
- radius
- border
- shadow
- color roles
- density
- motion timing
```

