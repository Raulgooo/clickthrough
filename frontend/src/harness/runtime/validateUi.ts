import type { ClickthroughNode } from "@/types/primitives";

export type UiValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const KNOWN_PRIMITIVES = new Set([
  // A. Shell
  "OverlayRoot",
  "PromptBar",
  "CTMark",
  "AnchorHighlight",
  "PageDimmer",
  "OverlayPositioner",

  // B. Layout
  "Panel",
  "Stack",
  "Grid",
  "Section",
  "SplitPane",
  "Rail",
  "Spacer",
  "Divider",

  // C. Text & Status
  "StatusPill",
  "Label",
  "Heading",
  "BodyText",
  "Callout",
  "InlineQuote",
  "CodeBlock",
  "Metadata",

  // D. Inputs
  "Button",
  "IconButton",
  "TextField",
  "TextArea",
  "Select",
  "Toggle",
  "SegmentedControl",
  "CheckboxRow",
  "RadioRow",
  "Slider",

  // E. Evidence
  "QuoteCard",
  "IdentityCard",
  "EvidenceSource",
  "AlertList",
  "ProgressBar",
  "ConclusionCard",
  "SourceTrail",
  "EvidenceStack",

  // F. Visual
  "Timeline",
  "SequenceDiagram",
  "Stepper",
  "ComparisonTable",
  "AnnotatedDiagram",
  "FlowDiagram",

  // G. Actions
  "StepList",
  "ScopeMatrix",
  "ApprovalGate",
  "ExecutionLog",
  "CopyField",
  "VerificationResult",

  // H. Safety
  "RiskSummary",
  "UncertaintyNote",
  "SourceQualityBadge",
  "SensitiveContextGuard",
  "PrivateModeBadge",
  "AuditTrail",

  // I. State
  "Skeleton",
  "ProgressList",
  "EmptyState",
  "ErrorState",
  "SuccessState",
  "LoadingSpinner",

  // J. Trust & Security
  "SecurityBoundary",
  "TrustIndicator",
  "PermissionBadge",
  "DataStream",
  "ScanLine",
  "FloatingIndicator",

  // K. Agent System
  "AgentStateIndicator",
  "ToolProgressCard",
  "BudgetBar",
  "MemoryChip",
  "ClarificationPrompt",
  "IntentConfirmation",
  "FollowUpBar",
  "InterruptControl",

  // L. Navigation
  "Accordion",
  "Tabs",
  "Breadcrumb",
  "Tooltip",
  "Badge",
  "Tag",

  // M. Frames
  "ImageFrame",
  "MediaFrame",
  "DiagramFrame",
  "ScreenshotFrame",
  "CarouselFrame",
  "CodeFrame",
  "MapFrame",
  "ChartFrame",
]);

export function validateGeneratedUi(root: ClickthroughNode): UiValidationResult {
  const errors: string[] = [];
  visit(root, errors);
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function visit(node: ClickthroughNode, errors: string[]): void {
  if (!KNOWN_PRIMITIVES.has(node.type)) {
    errors.push(`Unknown primitive: ${node.type}`);
  }

  for (const child of node.children ?? []) {
    visit(child, errors);
  }
}
