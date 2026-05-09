/**
 * Clickthrough Harness Types
 *
 * Sourced from AGENT_LOOP.md and HARNESS.md.
 * All state, event, plan, approval, execution, and budget types.
 */

// ── Agent Loop State ──

export type AgentState =
  | "idle"
  | "observing_page"
  | "recalling_context"
  | "classifying_intent"
  | "planning"
  | "generating_ui"
  | "waiting_for_user"
  | "running_tools"
  | "awaiting_approval"
  | "executing_action"
  | "verifying_result"
  | "remembering"
  | "completed"
  | "failed";

// ── Intent ──

export type IntentFamily =
  | "verify"
  | "understand"
  | "act"
  | "respond"
  | "navigate"
  | "summarize"
  | "unknown";

// ── Overlay Modes ──

export type OverlayMode =
  | "inline_prompt"
  | "anchored_popover"
  | "side_panel"
  | "spotlight"
  | "fullscreen_workbench"
  | "native_insertion";

// ── Harness State (runtime engine) ──

export type HarnessState =
  | "idle"
  | "receiving_intent"
  | "observing_page"
  | "recalling_memory"
  | "classifying_intent"
  | "planning"
  | "generating_ui"
  | "running_tools"
  | "waiting_for_user"
  | "awaiting_approval"
  | "executing_actions"
  | "verifying"
  | "remembering"
  | "completed"
  | "cancelled"
  | "failed";

// ─── Supporting Types ───

export type RiskItem = {
  label: string;
  level?: "low" | "medium" | "high";
  description?: string;
};

export type PlannedToolCall = {
  name: string;
  input: Record<string, unknown>;
};

export type ToolCallSummary = {
  callId: string;
  toolName: string;
  input: Record<string, unknown>;
};

export type ToolResultSummary = {
  callId: string;
  toolName: string;
  status: "success" | "denied" | "failed" | "timeout";
  summaryForModel: string;
};

export type HarnessStopReason =
  | "success"
  | "cancelled_by_user"
  | "max_turns"
  | "max_tool_calls"
  | "max_wall_clock"
  | "max_cost"
  | "tool_error"
  | "schema_validation_failed"
  | "approval_denied"
  | "verification_failed";

export type HarnessResult = {
  status: "success" | "failed" | "cancelled" | "partial";
  summary: string;
  stopReason?: HarnessStopReason;
};

// ── Discriminated Union: Harness Events ──

export type HarnessEvent =
  | { type: "state.changed"; state: HarnessState; message?: string }
  | {
      type: "ui.patch";
      patch: {
        op: "add" | "remove" | "replace" | "move";
        path: string;
        value?: unknown;
      };
    }
  | { type: "tool.started"; call: ToolCallSummary }
  | { type: "tool.finished"; result: ToolResultSummary }
  | { type: "approval.requested"; request: ApprovalRequest }
  | { type: "approval.resolved"; decision: ApprovalDecision }
  | { type: "result"; result: HarnessResult };

// ── Intent Classification ──

export type IntentClassification = {
  family: IntentFamily;
  confidence: number;
  target?: "claim" | "selection" | "page" | "form" | "message" | "workflow";
  needsWebSearch: boolean;
  needsDomActions: boolean;
  needsApproval: boolean;
  riskLevel: "low" | "medium" | "high";
};

// ── Agent Plan ──

export type AgentPlan = {
  goal: string;
  intent: IntentClassification;
  uiMode: OverlayMode;
  toolCalls: PlannedToolCall[];
  actionPlan?: BrowserActionPlan;
  expectedResult: string;
  risks: RiskItem[];
};

// ── Approval ──

export type ApprovalRequest = {
  id: string;
  title: string;
  summary: string;
  steps: string[];
  risks: RiskItem[];
  actionPlanId?: string;
  approveLabel: string;
  cancelLabel: string;
  editableFields?: string[];
};

export type ApprovalDecision =
  | { type: "approved"; requestId: string; modifiedInput?: unknown }
  | { type: "denied"; requestId: string; reason?: string }
  | { type: "redirected"; requestId: string; instruction: string };

// ── Browser Action Execution ──

export type BrowserActionPlan = {
  id: string;
  goal: string;
  steps: BrowserActionStep[];
};

export type BrowserActionStep =
  | { kind: "click"; elementId: string }
  | { kind: "fill"; elementId: string; value: string }
  | { kind: "select"; elementId: string; value: string }
  | { kind: "waitFor"; condition: string; timeoutMs: number }
  | { kind: "verify"; assertion: string };

// ── Tool Results ──

export type ToolResult<T = unknown> = {
  callId: string;
  toolName: string;
  status: "success" | "denied" | "failed" | "timeout";
  output?: T;
  error?: {
    code: string;
    message: string;
    recoverable: boolean;
  };
  summaryForModel: string;
  evidence?: string[];
};

// ── Run Budgets ──

export type RunBudget = {
  maxModelTurns: number;
  maxToolCalls: number;
  maxWallClockMs: number;
  maxCostUsd?: number;
};

export const DEFAULT_BUDGETS: Record<IntentFamily, RunBudget> = {
  verify: { maxModelTurns: 8, maxToolCalls: 16, maxWallClockMs: 45_000 },
  understand: { maxModelTurns: 6, maxToolCalls: 8, maxWallClockMs: 30_000 },
  act: { maxModelTurns: 10, maxToolCalls: 20, maxWallClockMs: 60_000 },
  respond: { maxModelTurns: 5, maxToolCalls: 6, maxWallClockMs: 20_000 },
  navigate: { maxModelTurns: 5, maxToolCalls: 10, maxWallClockMs: 25_000 },
  summarize: { maxModelTurns: 4, maxToolCalls: 6, maxWallClockMs: 20_000 },
  unknown: { maxModelTurns: 3, maxToolCalls: 4, maxWallClockMs: 15_000 },
};

// ── Verification ──

export type VerificationResult = {
  status: "success" | "failed" | "partial" | "unknown";
  summary: string;
  evidence: string[];
  nextActions?: string[];
};

// ── User Steering / Interrupt ──

export type UserSteeringEvent =
  | { type: "cancel" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "redirect"; instruction: string }
  | { type: "answer_question"; answers: Record<string, string | string[]> }
  | { type: "approve"; decision: ApprovalDecision };

// ── Supplementary Harness Types ──

export type PermissionMode =
  | "default"
  | "read_only"
  | "auto_low_risk"
  | "strict_approval"
  | "demo_trusted";

export type ToolManifestSummary = {
  name: string;
  description: string;
  category: "dom" | "web" | "pdf" | "memory" | "mcp" | "browser_action" | "ui";
  readOnly: boolean;
  risk: "low" | "medium" | "high";
  requiresApproval: boolean;
};

export type McpServerSummary = {
  name: string;
  description: string;
  toolCount: number;
  categories: string[];
  connected: boolean;
};

export type CompactedSession = {
  currentGoal: string;
  activePage: string;
  decisions: string[];
  constraints: string[];
  toolFindings: string[];
  generatedUiState: string;
  approvalState?: string;
  verificationState?: string;
  openQuestions: string[];
};

export type PageCapability = {
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

export type HarnessHook =
  | "BeforeRun"
  | "BeforeModelTurn"
  | "AfterModelTurn"
  | "BeforeToolUse"
  | "AfterToolUse"
  | "BeforeUiPatch"
  | "BeforeApproval"
  | "AfterApproval"
  | "BeforeActionExecution"
  | "AfterActionExecution"
  | "BeforeMemoryWrite"
  | "OnRunStop"
  | "BeforeCompaction";

export type RunTrace = {
  runId: string;
  sessionId: string;
  startedAt: string;
  endedAt?: string;
  states: HarnessState[];
  modelTurns: number;
  toolCalls: ToolResultSummary[];
  approvals: ApprovalDecision[];
  stopReason?: HarnessStopReason;
  costUsd?: number;
};
