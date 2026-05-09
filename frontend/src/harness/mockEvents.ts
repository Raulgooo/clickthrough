/**
 * mockEvents.ts
 *
 * Mock event stream for demo purposes.
 * Simulates the backend sending AG-UI-style events based on intent family.
 */

import type {
  IntentFamily,
  HarnessEvent,
  ApprovalRequest,
  ApprovalDecision,
} from "@/types/harness";

type CleanupFn = () => void;

export const createMockEventStream = (
  intent: IntentFamily,
  callback: (event: HarnessEvent) => void
): CleanupFn => {
  const timeouts: number[] = [];
  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeouts.push(id);
  };

  const emit = (event: HarnessEvent) => callback(event);

  if (intent === "verify") {
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "observing_page",
          message: "Scanning page context...",
        }),
      100
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "planning",
          message: "Planning verification steps...",
        }),
      800
    );
    schedule(
      () =>
        emit({
          type: "tool.started",
          call: {
            callId: "ws-1",
            toolName: "web_search",
            input: { query: "claim verification" },
          },
        }),
      1400
    );
    schedule(
      () =>
        emit({
          type: "tool.finished",
          result: {
            callId: "ws-1",
            toolName: "web_search",
            status: "success",
            summaryForModel: "Found 3 relevant sources.",
          },
        }),
      3200
    );
    schedule(
      () =>
        emit({
          type: "tool.started",
          call: {
            callId: "fs-1",
            toolName: "fetch_source",
            input: { url: "https://example.com/article" },
          },
        }),
      3600
    );
    schedule(
      () =>
        emit({
          type: "tool.finished",
          result: {
            callId: "fs-1",
            toolName: "fetch_source",
            status: "success",
            summaryForModel:
              "Source confirms claim with high confidence.",
          },
        }),
      5200
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "generating_ui",
          message: "Rendering verification dashboard...",
        }),
      5600
    );
    schedule(
      () =>
        emit({
          type: "ui.patch",
          patch: {
            op: "replace",
            path: "",
            value: {
              type: "conclusion_card",
              props: {
                verdict: "true",
                headline: "Claim verified",
                confidence: 0.94,
              },
            },
          },
        }),
      6000
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "completed",
          message: "Verification complete.",
        }),
      7000
    );
    schedule(
      () =>
        emit({
          type: "result",
          result: {
            status: "success",
            summary: "Claim verified against 3 sources.",
            stopReason: "success",
          },
        }),
      7200
    );
  } else if (intent === "understand") {
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "observing_page",
          message: "Reading page structure...",
        }),
      100
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "planning",
          message: "Building explanation plan...",
        }),
      700
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "generating_ui",
          message: "Generating visual explainer...",
        }),
      1500
    );
    schedule(
      () =>
        emit({
          type: "ui.patch",
          patch: {
            op: "replace",
            path: "",
            value: {
              type: "stepper",
              props: {
                steps: [
                  { title: "Initiate", state: "done" },
                  { title: "Authorize", state: "done" },
                  { title: "Exchange", state: "done" },
                ],
              },
            },
          },
        }),
      2000
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "completed",
          message: "Explainer ready.",
        }),
      3000
    );
    schedule(
      () =>
        emit({
          type: "result",
          result: {
            status: "success",
            summary: "Visual explainer generated.",
            stopReason: "success",
          },
        }),
      3200
    );
  } else if (intent === "act") {
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "observing_page",
          message: "Identifying action targets...",
        }),
      100
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "planning",
          message: "Planning API key workflow...",
        }),
      700
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "awaiting_approval",
          message: "Waiting for user approval...",
        }),
      1300
    );
    schedule(() => {
      const req: ApprovalRequest = {
        id: "apr-1",
        title: "Generate Full-Permissions API Key",
        summary:
          "Create a new SharkAuth API key with all scopes enabled.",
        steps: [
          "Navigate to Keys",
          "Select Full Permissions",
          "Generate and copy key",
        ],
        risks: [{ label: "Exposes all data", level: "high" }],
        approveLabel: "Generate Key",
        cancelLabel: "Cancel",
      };
      emit({ type: "approval.requested", request: req });
    }, 1600);
    // Auto-resolve approval for demo flow
    schedule(() => {
      const dec: ApprovalDecision = {
        type: "approved",
        requestId: "apr-1",
      };
      emit({ type: "approval.resolved", decision: dec });
      emit({
        type: "state.changed",
        state: "executing_actions",
        message: "Executing action plan...",
      });
    }, 3500);
    schedule(
      () =>
        emit({
          type: "tool.started",
          call: {
            callId: "ba-1",
            toolName: "browser_action",
            input: { step: "click", target: "#generate-key" },
          },
        }),
      4000
    );
    schedule(
      () =>
        emit({
          type: "tool.finished",
          result: {
            callId: "ba-1",
            toolName: "browser_action",
            status: "success",
            summaryForModel: "Key generated successfully.",
          },
        }),
      5500
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "verifying",
          message: "Verifying key creation...",
        }),
      6000
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "completed",
          message: "Action completed successfully.",
        }),
      7200
    );
    schedule(
      () =>
        emit({
          type: "result",
          result: {
            status: "success",
            summary: "API key generated and verified.",
            stopReason: "success",
          },
        }),
      7400
    );
  } else if (intent === "respond") {
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "observing_page",
          message: "Reading message context...",
        }),
      100
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "classifying_intent",
          message: "Classifying reply intent...",
        }),
      600
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "generating_ui",
          message: "Drafting reply suggestions...",
        }),
      1200
    );
    schedule(
      () =>
        emit({
          type: "ui.patch",
          patch: {
            op: "replace",
            path: "",
            value: {
              type: "panel",
              props: { title: "Reply Assistant" },
              children: [
                {
                  type: "body_text",
                  props: {
                    children:
                      "Here are a few ways to respond...",
                  },
                },
              ],
            },
          },
        }),
      1600
    );
    schedule(
      () =>
        emit({
          type: "state.changed",
          state: "completed",
          message: "Reply suggestions ready.",
        }),
      2400
    );
    schedule(
      () =>
        emit({
          type: "result",
          result: {
            status: "success",
            summary: "Reply assistant rendered.",
            stopReason: "success",
          },
        }),
      2600
    );
  } else {
    // Generic fallback
    schedule(
      () => emit({ type: "state.changed", state: "observing_page" }),
      100
    );
    schedule(
      () => emit({ type: "state.changed", state: "planning" }),
      600
    );
    schedule(
      () => emit({ type: "state.changed", state: "completed" }),
      1500
    );
    schedule(
      () =>
        emit({
          type: "result",
          result: {
            status: "success",
            summary: "Generic run completed.",
            stopReason: "success",
          },
        }),
      1700
    );
  }

  return () => {
    timeouts.forEach((id) => clearTimeout(id));
  };
};
