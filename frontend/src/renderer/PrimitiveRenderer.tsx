import { Fragment, useState } from "react";
import type { ClickthroughNode } from "@/types/primitives";
import { ActionContext } from "./ActionContext";

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

// ── Interactive primitive types that need local state ──

const INPUT_PRIMITIVES = new Set([
  "TextField",
  "TextArea",
  "Select",
  "Toggle",
  "SegmentedControl",
  "CheckboxRow",
  "RadioRow",
  "Slider",
]);

const BUTTON_PRIMITIVES = new Set(["Button", "IconButton"]);

// ── Recursive Node Renderer ──

function renderNode(
  node: ClickthroughNode | string | null | undefined,
  path: string,
  onAction: ((actionId: string, payload?: Record<string, unknown>) => void) | undefined,
  localState: Record<string, unknown>,
  setLocalState: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
): React.ReactNode {
  if (node === null || node === undefined) return null;
  if (typeof node === "string") return node;

  const Component = primitiveMap[node.type];
  if (!Component) {
    console.error(`[PrimitiveRenderer] Unknown primitive type: ${node.type}`);
    return (
      <ErrorState
        title="Generated primitive could not render"
        body={`Unsupported primitive: ${node.type || "missing type"}`}
      />
    );
  }

  const props = { ...(node.props || {}) } as Record<string, unknown>;

  // ── Wire actions for button primitives ──
  if (BUTTON_PRIMITIVES.has(node.type) && onAction) {
    const actionId = props.actionId as string | undefined;
    if (actionId) {
      props.onClick = () => onAction(actionId, props);
    }
  }

  // ── Wire actions for ApprovalGate ──
  if (node.type === "ApprovalGate" && onAction) {
    const approvalActionId = props.approvalActionId as string | undefined;
    if (approvalActionId) {
      props.onApprove = () => onAction(approvalActionId, props);
    }
    props.onCancel = () => onAction("action:cancel", { source: "ApprovalGate", ...props });
  }

  // ── Wire actions for SensitiveContextGuard ──
  if (node.type === "SensitiveContextGuard" && onAction) {
    const continueActionId = props.continueActionId as string | undefined;
    if (continueActionId) {
      props.onContinue = () => onAction(continueActionId, props);
    }
    props.onCancel = () => onAction("action:cancel", { source: "SensitiveContextGuard", ...props });
  }

  // ── Wire local state for input primitives ──
  if (INPUT_PRIMITIVES.has(node.type)) {
    const stateKey = path;
    const currentValue = localState[stateKey];

    if (node.type === "Toggle") {
      props.checked = currentValue !== undefined ? currentValue : props.checked;
      props.onChange = (checked: boolean) => {
        setLocalState((prev) => ({ ...prev, [stateKey]: checked }));
      };
    } else if (node.type === "SegmentedControl" || node.type === "Select") {
      props.value = currentValue !== undefined ? currentValue : props.value;
      props.onChange = (value: string) => {
        setLocalState((prev) => ({ ...prev, [stateKey]: value }));
      };
    } else if (node.type === "Slider") {
      props.value = currentValue !== undefined ? currentValue : props.value;
      props.onChange = (value: number) => {
        setLocalState((prev) => ({ ...prev, [stateKey]: value }));
      };
    } else if (node.type === "TextField" || node.type === "TextArea") {
      props.value = currentValue !== undefined ? currentValue : props.value;
      props.onChange = (value: string) => {
        setLocalState((prev) => ({ ...prev, [stateKey]: value }));
      };
    } else if (node.type === "CheckboxRow") {
      // For CheckboxRow, we track a Record<string, boolean>
      const checkedMap = (currentValue as Record<string, boolean> | undefined) || {};
      const items = (props.items as Array<{ id: string; checked?: boolean }> | undefined) || [];
      props.items = items.map((item) => ({
        ...item,
        checked: checkedMap[item.id] !== undefined ? checkedMap[item.id] : item.checked,
      }));
      props.onChange = (id: string, checked: boolean) => {
        setLocalState((prev) => ({
          ...prev,
          [stateKey]: { ...((prev[stateKey] as Record<string, boolean>) || {}), [id]: checked },
        }));
      };
    } else if (node.type === "RadioRow") {
      props.value = currentValue !== undefined ? currentValue : props.value;
      props.onChange = (value: string) => {
        setLocalState((prev) => ({ ...prev, [stateKey]: value }));
      };
    }
  }

  const children = node.children?.map((child, index) => (
    <Fragment key={`${typeof child === "string" ? "text" : child.type}-${index}`}>
      {renderNode(child, `${path}/${index}`, onAction, localState, setLocalState)}
    </Fragment>
  ));

  return (
    <Component {...props}>
      {children}
    </Component>
  );
}

// ── Component Entry Point ──

export type PrimitiveRendererProps = {
  tree: ClickthroughNode;
  onAction?: (actionId: string, payload?: Record<string, unknown>) => void;
};

export const PrimitiveRenderer = ({ tree, onAction }: PrimitiveRendererProps) => {
  const [localState, setLocalState] = useState<Record<string, unknown>>({});

  return (
    <ActionContext.Provider value={onAction}>
      <>{renderNode(tree, "root", onAction, localState, setLocalState)}</>
    </ActionContext.Provider>
  );
};
