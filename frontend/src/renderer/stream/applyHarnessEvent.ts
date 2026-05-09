import type { HarnessEvent } from "@/harness/runtime";
import type { ClickthroughNode } from "@/types/primitives";

export type RenderStreamState = {
  tree: ClickthroughNode | null;
  lastEvent: HarnessEvent | null;
  approvalPending: boolean;
};

export const initialRenderStreamState: RenderStreamState = {
  tree: null,
  lastEvent: null,
  approvalPending: false,
};

export function applyHarnessEvent(
  state: RenderStreamState,
  event: HarnessEvent
): RenderStreamState {
  if (event.type === "ui.patch" && event.patch.path === "") {
    return {
      ...state,
      tree: event.patch.value as ClickthroughNode,
      lastEvent: event,
    };
  }

  if (event.type === "approval.requested") {
    return { ...state, approvalPending: true, lastEvent: event };
  }

  if (event.type === "approval.resolved") {
    return { ...state, approvalPending: false, lastEvent: event };
  }

  return { ...state, lastEvent: event };
}
