/**
 * Clickthrough UI Primitives
 *
 * Strict TypeScript definitions for every atomic primitive the agent may emit.
 * The renderer maps these props to real React components.
 */

// ── Base Node ──

export type ClickthroughNode = {
  type: string;
  props?: Record<string, unknown>;
  children?: ClickthroughNode[];
};

// ── Host Theme ──

export type HostTheme = {
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

// ═══════════════════════════════════════════════════════════════
// A. Shell (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type OverlayRootProps = {
  id: string;
  intent: "verify" | "understand" | "act" | "respond" | "mixed";
  anchor?: string;
  mode: "inline" | "popover" | "panel" | "spotlight" | "fullscreen";
  dismissible?: boolean;
  hostTheme?: HostTheme;
};

export type PromptBarProps = {
  value?: string;
  placeholder?: string;
  mode?: "text" | "voice" | "text+voice";
  hotkeyLabel?: string;
  status?: "idle" | "listening" | "thinking" | "rendering";
};

export type CTMarkProps = {
  variant?: "badge" | "corner" | "wordmark" | "icon";
  status?: "idle" | "working" | "verified" | "warning";
};

export type AnchorHighlightProps = {
  targetSelector?: string;
  label?: string;
  tone?: "neutral" | "info" | "warning" | "danger";
  pulse?: boolean;
};

export type PageDimmerProps = {
  strength?: number;
  preserveAnchor?: boolean;
};

export type OverlayPositionerProps = {
  position?:
    | "center"
    | "anchor"
    | "cursor"
    | "top"
    | "bottom"
    | "left"
    | "right";
  offset?: { x?: number; y?: number };
  zIndex?: number;
};

// ═══════════════════════════════════════════════════════════════
// B. Layout (8 primitives)
// ═══════════════════════════════════════════════════════════════

export type PanelProps = {
  title?: string;
  subtitle?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  chrome?: "minimal" | "standard" | "dense";
};

export type StackProps = {
  direction?: "vertical" | "horizontal";
  gap?: "xs" | "sm" | "md" | "lg";
  align?: "start" | "center" | "end" | "stretch";
  wrap?: boolean;
};

export type GridProps = {
  columns?: number | Record<string, number>;
  gap?: "xs" | "sm" | "md" | "lg";
  minColumnWidth?: number;
};

export type SectionProps = {
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
};

export type SplitPaneProps = {
  ratio?: "1:1" | "2:1" | "1:2";
  collapseBelow?: number;
};

export type RailProps = {
  items?: RailItem[];
  activeId?: string;
  orientation?: "left" | "right" | "top";
};

export type RailItem = {
  id: string;
  label: string;
  icon?: string;
};

export type SpacerProps = {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
};

export type DividerProps = {
  orientation?: "horizontal" | "vertical";
  tone?: "neutral" | "muted" | "strong";
};

// ═══════════════════════════════════════════════════════════════
// C. Text (8 primitives)
// ═══════════════════════════════════════════════════════════════

export type StatusPillProps = {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  icon?: string;
};

export type LabelProps = {
  children: string;
  htmlFor?: string;
  tone?: "normal" | "muted" | "strong";
  size?: "xs" | "sm" | "md";
};

export type HeadingProps = {
  level?: 1 | 2 | 3 | 4;
  children: string;
};

export type BodyTextProps = {
  children: string;
  tone?: "normal" | "muted" | "strong";
  maxLines?: number;
};

export type CalloutProps = {
  title?: string;
  body: string;
  tone?: "info" | "success" | "warning" | "danger";
  action?: Record<string, unknown>;
};

export type InlineQuoteProps = {
  quote: string;
  source?: string;
  highlight?: string;
};

export type CodeBlockProps = {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  copyable?: boolean;
};

export type MetadataProps = {
  items: Array<{ label: string; value: string }>;
  layout?: "inline" | "stack";
};

// ═══════════════════════════════════════════════════════════════
// D. Inputs (10 primitives)
// ═══════════════════════════════════════════════════════════════

export type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  actionId?: string;
  disabled?: boolean;
};

export type IconButtonProps = {
  icon: string;
  label: string;
  actionId?: string;
  disabled?: boolean;
};

export type TextFieldProps = {
  label?: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  validation?: string;
};

export type TextAreaProps = {
  label?: string;
  value?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
};

export type SelectProps = {
  label?: string;
  value?: string;
  options?: Array<{ label: string; value: string }>;
};

export type ToggleProps = {
  label: string;
  checked?: boolean;
  description?: string;
};

export type SegmentedControlProps = {
  value?: string;
  options?: Array<{ label: string; value: string }>;
};

export type CheckboxRowProps = {
  label?: string;
  items?: Array<{ id: string; label: string; checked?: boolean }>;
};

export type RadioRowProps = {
  label?: string;
  name?: string;
  items?: Array<{ id: string; label: string; value: string }>;
  value?: string;
};

export type SliderProps = {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
};

// ═══════════════════════════════════════════════════════════════
// E. Evidence (8 primitives)
// ═══════════════════════════════════════════════════════════════

export type QuoteCardProps = {
  claim?: string;
  speaker?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  extractedFrom?: string;
};

export type IdentityCardProps = {
  name: string;
  aliases?: string[];
  avatarUrl?: string;
  profiles?: Array<{ label: string; url: string }>;
  matchConfidence?: number;
};

export type EvidenceMediaAsset = {
  kind?: "representative" | "favicon" | "page-image" | "screenshot" | "unknown";
  url: string;
  alt?: string;
  sourceUrl?: string;
  width?: number;
  height?: number;
};

export type EvidenceSourceProps = {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
  snippet?: string;
  faviconUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  media?: EvidenceMediaAsset[];
  stance?: "supports" | "contradicts" | "neutral" | "background";
  quality?: "high" | "medium" | "low" | "unknown";
  freshness?: "current" | "stale" | "unknown";
};

export type AlertListProps = {
  items: Array<{
    message: string;
    tone?: "info" | "warning" | "danger" | "success";
  }>;
};

export type ProgressBarProps = {
  value: number;
  label?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type ConclusionCardProps = {
  verdict?:
    | "true"
    | "false"
    | "mixed"
    | "unverified"
    | "outdated"
    | "unknown";
  headline?: string;
  summary?: string;
  confidence?: number;
  lastChecked?: string;
};

export type SourceTrailProps = {
  steps?: Array<{
    label: string;
    state?: "pending" | "running" | "done" | "failed";
  }>;
  currentStep?: number;
};

export type EvidenceStackProps = {
  sources?: EvidenceSourceProps[];
  groupBy?: "stance" | "quality" | "freshness" | "none";
  defaultExpanded?: boolean;
};

// ═══════════════════════════════════════════════════════════════
// F. Visual (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type TimelineProps = {
  items?: Array<{
    id?: string;
    label: string;
    date?: string;
    active?: boolean;
  }>;
  mode?: "linear" | "cycle";
  activeId?: string;
};

export type SequenceDiagramProps = {
  actors?: string[];
  messages?: Array<{ from: string; to: string; label: string }>;
  activeStep?: number;
  highlightRisk?: string;
};

export type StepperProps = {
  steps?: Array<{
    title: string;
    body?: string;
    state?: "pending" | "active" | "done" | "error";
  }>;
  activeStep?: number;
  orientation?: "horizontal" | "vertical";
};

export type ComparisonTableProps = {
  columns?: Array<{ key: string; label: string }>;
  rows?: Array<Record<string, unknown>>;
  highlightColumn?: string;
};

export type AnnotatedDiagramProps = {
  title?: string;
  imageOrSvg?: string;
  callouts?: Array<{ x: number; y: number; label: string }>;
};

export type FlowDiagramProps = {
  nodes?: Array<{ id: string; label: string }>;
  edges?: Array<{ from: string; to: string; label?: string }>;
  layout?: "horizontal" | "vertical" | "radial";
};

// ═══════════════════════════════════════════════════════════════
// G. Actions (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type StepListProps = {
  goal?: string;
  steps?: Array<{
    label: string;
    status?: "pending" | "running" | "done" | "failed";
  }>;
  riskLevel?: "low" | "medium" | "high";
  requiresApproval?: boolean;
};

export type ScopeMatrixProps = {
  scopes?: Array<{
    id: string;
    label: string;
    description?: string;
    risk?: "low" | "medium" | "high";
  }>;
  selectedScopes?: string[];
  mode?: "read-only" | "editable";
  riskLabels?: Record<string, string>;
};

export type ApprovalGateProps = {
  title: string;
  summary: string;
  risks?: Array<{ label: string; level?: "low" | "medium" | "high" }>;
  approveLabel: string;
  cancelLabel: string;
  approvalActionId?: string;
};

export type ExecutionLogProps = {
  entries?: Array<{
    label: string;
    status: "pending" | "running" | "done" | "failed";
    detail?: string;
  }>;
  currentEntry?: number;
  mode?: "compact" | "verbose";
};

export type CopyFieldProps = {
  label?: string;
  value: string;
  masked?: boolean;
  revealRequiresClick?: boolean;
};

export type VerificationResultProps = {
  status?: "success" | "failed" | "partial" | "unknown";
  summary?: string;
  evidence?: string[];
  nextActions?: Array<{ label: string; actionId?: string }>;
};

// ═══════════════════════════════════════════════════════════════
// H. Safety (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type RiskSummaryProps = {
  riskLevel?: "low" | "medium" | "high";
  items?: Array<{ label: string; level?: "low" | "medium" | "high" }>;
  recommendation?: string;
};

export type UncertaintyNoteProps = {
  reason: string;
  missingEvidence?: string[];
  whatWouldChangeVerdict?: string;
};

export type SourceQualityBadgeProps = {
  quality?: "high" | "medium" | "low" | "unknown";
  reason?: string;
};

export type SensitiveContextGuardProps = {
  category?: "health" | "finance" | "legal" | "security" | "personal";
  message: string;
  continueActionId?: string;
};

export type PrivateModeBadgeProps = {
  label?: string;
};

export type AuditTrailProps = {
  entries?: Array<{ timestamp: string; action: string; actor?: string }>;
};

// ═══════════════════════════════════════════════════════════════
// I. State (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type SkeletonProps = {
  shape?: "line" | "block" | "card" | "diagram" | "form";
  count?: number;
};

export type ProgressListProps = {
  items?: Array<{
    label: string;
    state?: "pending" | "running" | "done" | "failed";
  }>;
};

export type EmptyStateProps = {
  title: string;
  body?: string;
  action?: Record<string, unknown>;
};

export type ErrorStateProps = {
  title: string;
  body?: string;
  retryActionId?: string;
  details?: string;
};

export type SuccessStateProps = {
  title: string;
  body?: string;
  nextActions?: Array<{ label: string; actionId?: string }>;
};

export type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
};

// ═══════════════════════════════════════════════════════════════
// J. Trust (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type SecurityBoundaryProps = {
  level?: "low" | "medium" | "high";
  children?: ClickthroughNode[];
};

export type TrustIndicatorProps = {
  level?: "trusted" | "unverified" | "suspicious";
  label?: string;
  detail?: string;
};

export type PermissionBadgeProps = {
  permission: string;
  scope?: string;
  status?: "granted" | "denied" | "pending";
};

export type DataStreamProps = {
  label?: string;
  active?: boolean;
  throughput?: string;
};

export type ScanLineProps = {
  active?: boolean;
  progress?: number;
  label?: string;
};

export type FloatingIndicatorProps = {
  label?: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  pulse?: boolean;
};

// ═══════════════════════════════════════════════════════════════
// K. Agent (8 primitives)
// ═══════════════════════════════════════════════════════════════

export type AgentStateIndicatorProps = {
  state?: string;
  message?: string;
};

export type ToolProgressCardProps = {
  toolName?: string;
  status?: "pending" | "running" | "done" | "failed";
  progress?: number;
  detail?: string;
};

export type BudgetBarProps = {
  turnsUsed: number;
  turnsMax: number;
  toolsUsed: number;
  toolsMax: number;
  elapsedMs: number;
};

export type MemoryChipProps = {
  hint?: string;
  source?: "user" | "site" | "session";
};

export type ClarificationPromptProps = {
  question: string;
  options?: Array<{ label: string; value: string }>;
  allowFreeform?: boolean;
};

export type IntentConfirmationProps = {
  intent: string;
  confidence: number;
  onConfirm?: string;
  onReject?: string;
};

export type FollowUpBarProps = {
  suggestions?: string[];
  onSelect?: string;
};

export type InterruptControlProps = {
  onCancel?: string;
  onPause?: string;
  onResume?: string;
};

// ═══════════════════════════════════════════════════════════════
// L. Navigation (6 primitives)
// ═══════════════════════════════════════════════════════════════

export type AccordionProps = {
  items?: Array<{
    id: string;
    title: string;
    content: string;
    defaultOpen?: boolean;
  }>;
};

export type TabsProps = {
  tabs?: Array<{ id: string; label: string }>;
  activeTab?: string;
};

export type BreadcrumbProps = {
  items?: Array<{ label: string; href?: string }>;
};

export type TooltipProps = {
  content: string;
  targetId?: string;
  placement?: "top" | "bottom" | "left" | "right";
};

export type BadgeProps = {
  label: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
};

export type TagProps = {
  label: string;
  removable?: boolean;
  onRemove?: string;
};

// ═══════════════════════════════════════════════════════════════
// M. Frames (8 primitives)
// ═══════════════════════════════════════════════════════════════

export type ImageFrameProps = {
  src: string;
  alt?: string;
  caption?: string;
  fit?: "cover" | "contain" | "fill";
};

export type MediaFrameProps = {
  src: string;
  type?: "image" | "video" | "audio";
  caption?: string;
  controls?: boolean;
};

export type DiagramFrameProps = {
  src?: string;
  svg?: string;
  caption?: string;
};

export type ScreenshotFrameProps = {
  src: string;
  caption?: string;
  annotated?: boolean;
};

export type CarouselFrameProps = {
  items?: Array<{ src: string; caption?: string }>;
  autoPlay?: boolean;
  interval?: number;
};

export type CodeFrameProps = {
  code: string;
  language?: string;
  filename?: string;
  copyable?: boolean;
};

export type MapFrameProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; label?: string }>;
};

export type ChartFrameProps = {
  type?: "bar" | "line" | "pie" | "area";
  data?: Array<Record<string, unknown>>;
  config?: Record<string, unknown>;
};
