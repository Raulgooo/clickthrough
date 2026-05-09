import type { ClickthroughNode, HostTheme } from "@/types/primitives";
import type {
  ApprovalDecision,
  ApprovalRequest,
  HarnessEvent,
  HarnessResult,
  HarnessState,
  IntentClassification,
  IntentFamily,
  ToolCallSummary,
  ToolResultSummary,
} from "@/types/harness";
import type { GeneratedUI, UiPatch } from "@/types/ui";

export type UserIntentPacket = {
  prompt: string;
  inputMode: "text" | "voice" | "hotkey";
  selectedText?: string;
  anchorElementId?: string;
  pageUrl: string;
  pageTitle: string;
  timestamp: string;
};

export type DomElementSummary = {
  id: string;
  tagName: string;
  role?: string;
  label: string;
  text?: string;
  type?: string;
  href?: string;
  value?: string;
  visible: boolean;
  disabled: boolean;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

export type PageContextPacket = {
  url: string;
  title: string;
  visibleText: string;
  selectedText?: string;
  focusedElement?: DomElementSummary;
  nearbyElements: DomElementSummary[];
  capabilityMap: PageCapabilitySummary[];
  hostTheme: HostTheme;
};

export type PageCapabilitySummary = {
  id: string;
  label: string;
  kind:
    | "button"
    | "link"
    | "form"
    | "input"
    | "select"
    | "table"
    | "menu"
    | "dialog"
    | "tab"
    | "workflow"
    | "unknown";
  elementIds: string[];
  confidence: number;
  description?: string;
};

export type MemorySlice = {
  recentTurns: string[];
  siteHints: string[];
  userPreferences: string[];
};

export type HarnessConstraints = {
  permissionMode: "default" | "read_only" | "auto_low_risk" | "strict_approval" | "demo_trusted";
  maxToolCalls: number;
  maxWallClockMs: number;
};

export type HarnessRunInput = {
  runId: string;
  sessionId: string;
  intent: UserIntentPacket;
  page: PageContextPacket;
  memory?: MemorySlice;
  constraints?: Partial<HarnessConstraints>;
};

export type HarnessSessionInput =
  | { type: "user.message"; intent: UserIntentPacket; page: PageContextPacket }
  | { type: "approval.resolved"; decision: ApprovalDecision }
  | { type: "interrupt"; action: "cancel" | "pause" | "resume" };

export type HarnessSession = {
  id: string;
  streamInput(input: HarnessSessionInput): Promise<void>;
  events(): AsyncIterable<HarnessEvent>;
  interrupt(): void;
  close(): void;
};

export type ToolDefinition<Input = unknown, Output = unknown> = {
  name: string;
  description: string;
  readOnly: boolean;
  risk: "low" | "medium" | "high";
  requiresApproval: (input: Input, context: HarnessRunInput) => boolean;
  execute: (input: Input, context: HarnessRunInput) => Promise<Output>;
};

export type GeneratedUiEnvelope = {
  classification: IntentClassification;
  ui: GeneratedUI;
  root: ClickthroughNode;
};

export type {
  ApprovalDecision,
  ApprovalRequest,
  GeneratedUI,
  HarnessEvent,
  HarnessResult,
  HarnessState,
  IntentClassification,
  IntentFamily,
  ToolCallSummary,
  ToolResultSummary,
  UiPatch,
};
