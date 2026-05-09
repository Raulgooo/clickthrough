import type { HarnessEvent } from "@/harness/runtime";
import type { ClickthroughNode } from "@/types/primitives";
import type { GeneratedUI } from "@/types/ui";

export type RenderStreamState = {
  tree: ClickthroughNode | null;
  surface: GeneratedUI["surface"] | null;
  lastEvent: HarnessEvent | null;
  approvalPending: boolean;
};

export const initialRenderStreamState: RenderStreamState = {
  tree: null,
  surface: null,
  lastEvent: null,
  approvalPending: false,
};

export function applyHarnessEvent(
  state: RenderStreamState,
  event: HarnessEvent
): RenderStreamState {
  if (event.type === "ui.patch" && event.patch.path === "") {
    const generated = event.patch.value as GeneratedUI;
    return {
      ...state,
      tree: generated?.root ?? null,
      surface: generated?.surface ?? null,
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
