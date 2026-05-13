# Open Design Prompt For Clickthrough UI Primitives

Use this prompt in Open Design to generate the visual primitive library for Clickthrough.

```text
Design a comprehensive generative UI primitive system for a product called Clickthrough.

Clickthrough is a browser-first AI pointer companion that lives on top of the current webpage and can evolve into an OS-level companion. The user presses a hotkey, holds push-to-talk, selects something, grabs the pointer buddy, or accepts a proactive chip, and Clickthrough generates the exact overlay interface needed for that page/app and intent. It is not a chatbot, sidebar, mascot, or separate assistant app. It is a runtime interface layer for the computer.

The product thesis:

Any page or app, any intent, the exact UI you need at the point of intent.

The visual system must support four demo scenarios:

1. Twitter/X verification
The user sees a tweet from raulgcc1 claiming: "I'm excited to announce that I'm joining Amazon as a summer intern!" They ask: "Hey CT, is this true?" Clickthrough highlights the claim and generates a live evidence dashboard over the tweet with skeleton loading, identity matching, source cards, contradictions, confidence, and a verdict.

2. PDF learning
The user reads a dense OAuth 2.0 Authorization Code with PKCE paragraph and asks: "CT, explain this visually." Clickthrough generates a visual teaching overlay with a sequence diagram, stepper, with/without PKCE toggle, and callouts explaining why intercepted authorization codes are useless without the verifier.

3. Current page copilot
The user is on a dense web page and asks: "CT, help me handle this page." Clickthrough generates a Jarvis-like copilot surface with page summary, detected affordances, likely next moves, risks, source-backed side research, copyable outputs, and approval-gated action options when useful.

4. Social context
The user sees a message saying: "Sorry, I'm on my period and feel awful today," and asks: "CT, what does that mean and what do I say?" Clickthrough generates a private explanation and response assistant with a simple cycle timeline, what-not-to-say guidance, reply drafts, and tone controls.

Design the primitive library, not a single static page. The system should include atomic components and several composed examples.

Important design requirements:

- The same primitives must visually adapt to different host pages.
- The same primitives must later adapt to desktop app windows and screenshot regions.
- Components should feel native to the current page while still clearly belonging to Clickthrough.
- Avoid generic chatbot UI, sidebars, landing-page aesthetics, glassmorphism, heavy gradients, and identical card grids.
- Avoid cute always-on mascot behavior; the pointer companion follows intent anchors, not every cursor movement.
- Make skeleton loading and progressive UI assembly visually obvious.
- Use compact, high-signal product UI.
- Include states for loading, streaming, success, error, warning, unverified, deferred action, and completed.
- Include states for listening, capturing, redacting, thinking, pointing, action preview, approved action, blocked sensitive context, interrupted, and verified receipt.
- Include accessibility-minded focus states and clear status communication.
- The generated UI should look like the browser briefly created the missing interface the user needed.

Create visual designs for these primitive categories:

Overlay shell:
- OverlayRoot
- PromptBar
- AnchorHighlight
- CTMark
- PageDimmer
- PointerBuddy
- CaptureIndicator
- VoiceTranscriptPill
- ScreenTargetHighlight

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

Prepared action / guidance:
- ActionPlan
- GeneratedForm
- ScopeMatrix
- ApprovalGate
- ExecutionLog
- VerificationResult
- CopyField
- WalkthroughStep
- ActionPreview
- VerificationReceipt

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
- CurrentPageCopilot inside a dense web page.
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
