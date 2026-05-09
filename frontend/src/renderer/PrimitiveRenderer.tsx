import { Fragment } from "react";
import type { ClickthroughNode } from "@/types/primitives";

// ── Primitive Imports ──

// A. Shell (6)
import {
  OverlayRoot,
  PromptBar,
  CTMark,
  AnchorHighlight,
  PageDimmer,
  OverlayPositioner,
} from "@/primitives";

// B. Layout (8)
import {
  Panel,
  Stack,
  Grid,
  Section,
  SplitPane,
  Rail,
  Spacer,
  Divider,
} from "@/primitives";

// C. Text & Status (8)
import {
  StatusPill,
  Label,
  Heading,
  BodyText,
  Callout,
  InlineQuote,
  CodeBlock,
  Metadata,
} from "@/primitives";

// D. Inputs (10)
import {
  Button,
  IconButton,
  TextField,
  TextArea,
  Select,
  Toggle,
  SegmentedControl,
  CheckboxRow,
  RadioRow,
  Slider,
} from "@/primitives";

// E. Evidence (8)
import {
  QuoteCard,
  IdentityCard,
  EvidenceSource,
  AlertList,
  ProgressBar,
  ConclusionCard,
  SourceTrail,
  EvidenceStack,
} from "@/primitives";

// F. Visual (6)
import {
  Timeline,
  SequenceDiagram,
  Stepper,
  ComparisonTable,
  AnnotatedDiagram,
  FlowDiagram,
} from "@/primitives";

// G. Actions (6)
import {
  StepList,
  ScopeMatrix,
  ApprovalGate,
  ExecutionLog,
  CopyField,
  VerificationResult,
} from "@/primitives";

// H. Safety (6)
import {
  RiskSummary,
  UncertaintyNote,
  SourceQualityBadge,
  SensitiveContextGuard,
  PrivateModeBadge,
  AuditTrail,
} from "@/primitives";

// I. State (6)
import {
  Skeleton,
  ProgressList,
  EmptyState,
  ErrorState,
  SuccessState,
  LoadingSpinner,
} from "@/primitives";

// J. Trust & Security (6)
import {
  SecurityBoundary,
  TrustIndicator,
  PermissionBadge,
  DataStream,
  ScanLine,
  FloatingIndicator,
} from "@/primitives";

// K. Agent System (8)
import {
  AgentStateIndicator,
  ToolProgressCard,
  BudgetBar,
  MemoryChip,
  ClarificationPrompt,
  IntentConfirmation,
  FollowUpBar,
  InterruptControl,
} from "@/primitives";

// L. Navigation (6)
import {
  Accordion,
  Tabs,
  Breadcrumb,
  Tooltip,
  Badge,
  Tag,
} from "@/primitives";

// M. Frames (8)
import {
  ImageFrame,
  MediaFrame,
  DiagramFrame,
  ScreenshotFrame,
  CarouselFrame,
  CodeFrame,
  MapFrame,
  ChartFrame,
} from "@/primitives";

// ── Primitive Lookup Map ──

const primitiveMap: Record<string, React.ComponentType<any>> = {
  // A. Shell
  OverlayRoot,
  PromptBar,
  CTMark,
  AnchorHighlight,
  PageDimmer,
  OverlayPositioner,

  // B. Layout
  Panel,
  Stack,
  Grid,
  Section,
  SplitPane,
  Rail,
  Spacer,
  Divider,

  // C. Text & Status
  StatusPill,
  Label,
  Heading,
  BodyText,
  Callout,
  InlineQuote,
  CodeBlock,
  Metadata,

  // D. Inputs
  Button,
  IconButton,
  TextField,
  TextArea,
  Select,
  Toggle,
  SegmentedControl,
  CheckboxRow,
  RadioRow,
  Slider,

  // E. Evidence
  QuoteCard,
  IdentityCard,
  EvidenceSource,
  AlertList,
  ProgressBar,
  ConclusionCard,
  SourceTrail,
  EvidenceStack,

  // F. Visual
  Timeline,
  SequenceDiagram,
  Stepper,
  ComparisonTable,
  AnnotatedDiagram,
  FlowDiagram,

  // G. Actions
  StepList,
  ScopeMatrix,
  ApprovalGate,
  ExecutionLog,
  CopyField,
  VerificationResult,

  // H. Safety
  RiskSummary,
  UncertaintyNote,
  SourceQualityBadge,
  SensitiveContextGuard,
  PrivateModeBadge,
  AuditTrail,

  // I. State
  Skeleton,
  ProgressList,
  EmptyState,
  ErrorState,
  SuccessState,
  LoadingSpinner,

  // J. Trust & Security
  SecurityBoundary,
  TrustIndicator,
  PermissionBadge,
  DataStream,
  ScanLine,
  FloatingIndicator,

  // K. Agent System
  AgentStateIndicator,
  ToolProgressCard,
  BudgetBar,
  MemoryChip,
  ClarificationPrompt,
  IntentConfirmation,
  FollowUpBar,
  InterruptControl,

  // L. Navigation
  Accordion,
  Tabs,
  Breadcrumb,
  Tooltip,
  Badge,
  Tag,

  // M. Frames
  ImageFrame,
  MediaFrame,
  DiagramFrame,
  ScreenshotFrame,
  CarouselFrame,
  CodeFrame,
  MapFrame,
  ChartFrame,
};

// ── Recursive Node Renderer ──

export const renderNode = (node: ClickthroughNode): React.ReactNode => {
  const Component = primitiveMap[node.type];
  if (!Component) {
    console.error(`[PrimitiveRenderer] Unknown primitive type: ${node.type}`);
    return null;
  }

  const children = node.children?.map((child, index) => (
    <Fragment key={`${child.type}-${index}`}>
      {renderNode(child)}
    </Fragment>
  ));

  return (
    <Component {...(node.props || {})}>
      {children}
    </Component>
  );
};

// ── Component Entry Point ──

export type PrimitiveRendererProps = {
  tree: ClickthroughNode;
};

export const PrimitiveRenderer = ({ tree }: PrimitiveRendererProps) => {
  return <>{renderNode(tree)}</>;
};
