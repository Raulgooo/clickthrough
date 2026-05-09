import type {
  HarnessEvent,
  HarnessRunInput,
  HarnessSession,
  HarnessSessionInput,
  HarnessState,
  IntentClassification,
} from "./contracts";
import { classifyIntent, generateUiTree, generateClarificationPrompt } from "./openrouter";
import { getTool } from "./tools";
import { validateGeneratedUi } from "./validateUi";
import type { ClickthroughNode } from "@/types/primitives";
import type { GeneratedUI, UiPatch, DeclarativeSurfacePlan } from "@/types/ui";

type EventQueueItem =
  | { done: false; event: HarnessEvent }
  | { done: true; event?: never };

const DEFAULT_DELAY_MS = 60;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class LocalHarnessSession implements HarnessSession {
  readonly id: string;

  private queue: EventQueueItem[] = [];
  private waiters: Array<(item: EventQueueItem) => void> = [];
  private closed = false;
  private runCount = 0;
  private maxToolCalls = 12;
  private maxWallClockMs = 45_000;

  constructor(id: string) {
    this.id = id;
  }

  async streamInput(input: HarnessSessionInput): Promise<void> {
    if (this.closed) return;

    if (input.type === "interrupt") {
      this.emit({
        type: "state.changed",
        state: input.action === "cancel" ? "cancelled" : "waiting_for_user",
        message: `Run ${input.action} requested.`,
      });
      return;
    }

    if (input.type === "approval.resolved") {
      this.emit({ type: "approval.resolved", decision: input.decision });
      return;
    }

    this.runCount++;
    const runInput: HarnessRunInput = {
      runId: crypto.randomUUID(),
      sessionId: this.id,
      intent: input.intent,
      page: input.page,
      memory: { recentTurns: [], siteHints: [], userPreferences: [] },
      constraints: {
        permissionMode: "read_only",
        maxToolCalls: this.maxToolCalls,
        maxWallClockMs: this.maxWallClockMs,
      },
    };

    await this.runLoop(runInput);
  }

  async *events(): AsyncIterable<HarnessEvent> {
    while (!this.closed || this.queue.length > 0) {
      const item = await this.nextQueueItem();
      if (item.done) return;
      yield item.event;
    }
  }

  interrupt(): void {
    this.emit({
      type: "state.changed",
      state: "cancelled",
      message: "Run cancelled by user.",
    });
  }

  close(): void {
    this.closed = true;
    this.flushDone();
  }

  // ── Main Run Loop ──

  private async runLoop(input: HarnessRunInput): Promise<void> {
    const startTime = Date.now();
    const budget = {
      toolCallsRemaining: input.constraints?.maxToolCalls ?? this.maxToolCalls,
      deadline: startTime + (input.constraints?.maxWallClockMs ?? this.maxWallClockMs),
    };

    const emitState = async (state: HarnessState, message?: string) => {
      this.emit({ type: "state.changed", state, message });
      await delay(DEFAULT_DELAY_MS);
    };

    try {
      // 1. Receiving intent
      await emitState("receiving_intent", input.intent.prompt);

      // 2. Observing page
      await emitState("observing_page", input.page.title);

      // 3. Classifying intent
      await emitState("classifying_intent", "Analyzing intent...");
      let classification: IntentClassification;
      try {
        classification = await classifyIntent(input.intent, input.page);
      } catch (err) {
        console.error("[Harness] Intent classification failed:", err);
        classification = {
          family: "unknown",
          confidence: 0.3,
          needsWebSearch: false,
          needsDomActions: false,
          needsApproval: false,
          riskLevel: "low",
        };
      }

      // If unknown, emit clarification UI and stop
      if (classification.family === "unknown" || classification.confidence < 0.4) {
        await emitState("waiting_for_user", "Need clarification.");
        const clarificationTree = await generateClarificationPrompt(input.intent, input.page);
        this.emitUiTree(clarificationTree, "anchored_popover", classification);
        await emitState("completed", "Clarification requested.");
        this.emit({ type: "result", result: { status: "success", summary: "Clarification requested." } });
        return;
      }

      // 4. Planning + Progressive Skeleton
      await emitState("planning", `Plan: ${classification.family}`);
      this.emitSkeleton(classification);

      // 5. Running tools
      const toolResults: { search?: any; fetch?: any } = {};

      if (classification.needsWebSearch && budget.toolCallsRemaining > 0) {
        await emitState("running_tools", "Searching web...");
        const searchTool = getTool("web.search");
        if (searchTool) {
          const callId = crypto.randomUUID();
          this.emit({
            type: "tool.started",
            call: { callId, toolName: "web.search", input: { query: input.intent.prompt } },
          });

          try {
            const result = await searchTool.execute(
              {
                query: input.intent.prompt,
                mode: classification.family === "verify" ? "verify" : "general",
                count: 5,
                includeText: true,
                includeHighlights: true,
              },
              input
            );

            toolResults.search = result as any;
            budget.toolCallsRemaining--;

            this.emit({
              type: "tool.finished",
              result: {
                callId,
                toolName: "web.search",
                status: "success",
                summaryForModel: `Found ${(result as any).sources?.length || 0} sources.`,
              },
            });
          } catch (err: any) {
            this.emit({
              type: "tool.finished",
              result: {
                callId,
                toolName: "web.search",
                status: "failed",
                summaryForModel: `Search failed: ${err.message}`,
              },
            });
          }
        }
      }

      // Check budget
      if (Date.now() > budget.deadline) {
        await emitState("failed", "Run exceeded time budget.");
        this.emit({ type: "result", result: { status: "failed", stopReason: "max_wall_clock", summary: "Time budget exceeded." } });
        return;
      }

      // 6. Generating UI
      await emitState("generating_ui", "Building interface...");

      let tree: ClickthroughNode;
      try {
        tree = await generateUiTree(input.intent, input.page, classification, toolResults);
      } catch (err) {
        console.error("[Harness] UI generation failed:", err);
        // Fallback: generate a simple error panel
        tree = {
          type: "Panel",
          props: { tone: "warning", chrome: "standard" },
          children: [
            {
              type: "Heading",
              props: { level: 3 },
              children: [{ type: "BodyText", props: { children: "Could not generate interface" } }],
            },
            {
              type: "BodyText",
              props: {
                children: `Something went wrong while building the overlay. Error: ${(err as Error).message}`,
              },
            },
            {
              type: "Button",
              props: { label: "Try again", variant: "primary" },
            },
          ],
        };
      }

      // Validate
      const validation = validateGeneratedUi(tree);
      if (!validation.valid) {
        console.warn("[Harness] UI validation failed:", validation.errors);
      }

      // Determine overlay mode
      const overlayMode = inferOverlayMode(classification);

      // Emit UI patch
      this.emitUiTree(tree, overlayMode, classification);

      // 7. Completed
      await emitState("completed", "Done.");
      this.emit({
        type: "result",
        result: { status: "success", summary: `Generated ${classification.family} overlay.` },
      });
    } catch (err: any) {
      console.error("[Harness] Run loop error:", err);
      await emitState("failed", err.message || "Unknown error.");
      this.emit({
        type: "result",
        result: { status: "failed", summary: err.message || "Run failed." },
      });
    }
  }

  // ── Helpers ──

  private emitSkeleton(classification: IntentClassification): void {
    const skeleton: ClickthroughNode = {
      type: "Panel",
      props: { tone: "neutral", chrome: "standard" },
      children: [
        { type: "Skeleton", props: { shape: "line", count: 1 } },
        { type: "Skeleton", props: { shape: "block", count: 3 } },
        ...(classification.family === "verify"
          ? [
              { type: "Skeleton", props: { shape: "card", count: 2 } },
              { type: "ProgressList", props: { items: [{ label: "Searching web...", state: "running" }] } },
            ]
          : classification.family === "understand"
          ? [
              { type: "Skeleton", props: { shape: "diagram", count: 1 } },
              { type: "Skeleton", props: { shape: "block", count: 2 } },
            ]
          : [
              { type: "Skeleton", props: { shape: "block", count: 2 } },
            ]),
      ],
    };

    const surface: DeclarativeSurfacePlan = {
      intent: classification.family as any,
      purpose: `${classification.family} overlay`,
      anchor: { source: "selection", fallbackMode: "side_panel" },
      layout: {
        pattern:
          classification.family === "verify"
            ? "evidence_dashboard"
            : classification.family === "understand"
            ? "visual_explainer"
            : classification.family === "respond"
            ? "response_assistant"
            : "anchored_card",
        density: "comfortable",
        hierarchy: "sectioned",
        maxAttention: "medium",
      },
      style: {
        hostFit: "blend",
        tone: "neutral",
        emphasis: "balanced",
        motion: "progressive",
      },
      interaction: {
        requiresApproval: classification.needsApproval,
        canMinimize: true,
        canDismiss: true,
        followUpMode: "inline",
      },
    };

    const generatedUi: GeneratedUI = {
      overlayMode: inferOverlayMode(classification) as any,
      surface,
      root: skeleton,
      safety: {
        riskLevel: classification.riskLevel,
        requiresApproval: classification.needsApproval,
        hasSensitiveContext: false,
      },
    };

    this.emit({
      type: "ui.patch",
      patch: { op: "replace", path: "", value: generatedUi },
    });
  }

  private emitUiTree(
    tree: ClickthroughNode,
    overlayMode: string,
    classification: IntentClassification
  ): void {
    const surface: DeclarativeSurfacePlan = {
      intent: classification.family as any,
      purpose: `${classification.family} overlay`,
      anchor: { source: "selection", fallbackMode: "side_panel" },
      layout: {
        pattern:
          classification.family === "verify"
            ? "evidence_dashboard"
            : classification.family === "understand"
            ? "visual_explainer"
            : classification.family === "respond"
            ? "response_assistant"
            : "anchored_card",
        density: "comfortable",
        hierarchy: "sectioned",
        maxAttention: "medium",
      },
      style: {
        hostFit: "blend",
        tone: "neutral",
        emphasis: "balanced",
        motion: "progressive",
      },
      interaction: {
        requiresApproval: classification.needsApproval,
        canMinimize: true,
        canDismiss: true,
        followUpMode: "inline",
      },
    };

    const generatedUi: GeneratedUI = {
      overlayMode: overlayMode as any,
      surface,
      root: tree,
      safety: {
        riskLevel: classification.riskLevel,
        requiresApproval: classification.needsApproval,
        hasSensitiveContext: false,
      },
    };

    const patch: UiPatch = {
      op: "replace",
      path: "",
      value: generatedUi,
    };

    this.emit({ type: "ui.patch", patch });
  }

  private emit(event: HarnessEvent): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ done: false, event });
      return;
    }
    this.queue.push({ done: false, event });
  }

  private nextQueueItem(): Promise<EventQueueItem> {
    const item = this.queue.shift();
    if (item) return Promise.resolve(item);
    if (this.closed) return Promise.resolve({ done: true });
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  private flushDone(): void {
    for (const waiter of this.waiters.splice(0)) {
      waiter({ done: true });
    }
  }
}

export function createLocalHarnessSession(sessionId = crypto.randomUUID()): HarnessSession {
  return new LocalHarnessSession(sessionId);
}

function inferOverlayMode(classification: IntentClassification): string {
  switch (classification.family) {
    case "verify":
      return "side_panel";
    case "understand":
      return "panel";
    case "act":
      return "native_insertion";
    case "respond":
      return "anchored_popover";
    case "navigate":
    case "summarize":
      return "popover";
    default:
      return "popover";
  }
}
