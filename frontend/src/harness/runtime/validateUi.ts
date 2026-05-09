import type { ClickthroughNode } from "@/types/primitives";

export type UiValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const KNOWN_PRIMITIVES = new Set([
  "OverlayRoot",
  "PromptBar",
  "CTMark",
  "AnchorHighlight",
  "PageDimmer",
  "OverlayPositioner",
  "Panel",
  "Stack",
  "Grid",
  "Section",
  "SplitPane",
  "Rail",
  "Spacer",
  "Divider",
  "StatusPill",
  "Label",
  "Heading",
  "BodyText",
  "Callout",
  "InlineQuote",
  "Button",
  "TextField",
  "TextArea",
  "SegmentedControl",
  "Skeleton",
  "ProgressList",
  "ApprovalGate",
  "ExecutionLog",
  "VerificationResult",
  "RiskSummary",
  "UncertaintyNote",
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
