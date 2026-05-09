/**
 * useHarness.ts
 *
 * Manages the harness state machine and emits events.
 * Integrates with the Clickthrough agent loop to track runtime state,
 * accumulate events, and apply UI patches.
 */

import { useState, useCallback, useRef } from "react";
import type { HarnessState, HarnessEvent } from "@/types/harness";
import type { UiPatch } from "@/types/ui";
import type { ClickthroughNode } from "@/types/primitives";

export type UserIntentPacket = {
  text: string;
  selection?: string;
  pageUrl?: string;
  pageTitle?: string;
};

function applyUiPatch(
  tree: ClickthroughNode | null,
  patch: UiPatch
): ClickthroughNode | null {
  if (patch.path === "" || patch.path === "/") {
    if (patch.op === "replace" || patch.op === "add") {
      return patch.value as ClickthroughNode;
    }
    return null;
  }

  if (!tree) return null;

  const clone = (node: ClickthroughNode): ClickthroughNode => ({
    ...node,
    props: node.props ? { ...node.props } : undefined,
    children: node.children ? node.children.map(clone) : undefined,
  });

  const segments = patch.path.split("/").filter(Boolean);
  const newTree = clone(tree);

  let target: ClickthroughNode = newTree;
  let i = 0;

  while (i < segments.length - 1) {
    const seg = segments[i];
    if (seg === "children") {
      i++;
      const idx = parseInt(segments[i], 10);
      if (isNaN(idx) || !target.children || !target.children[idx]) {
        return newTree;
      }
      target = target.children[idx];
      i++;
    } else if (seg === "props") {
      i++;
      if (i < segments.length - 1) return newTree;
    } else {
      return newTree;
    }
  }

  const last = segments[segments.length - 1];

  if (last === "children") {
    if (patch.op === "add" || patch.op === "replace") {
      target.children = [
        ...(target.children || []),
        patch.value as ClickthroughNode,
      ];
    }
  } else if (!isNaN(parseInt(last, 10))) {
    const idx = parseInt(last, 10);
    if (!target.children) target.children = [];
    if (patch.op === "replace") {
      target.children[idx] = patch.value as ClickthroughNode;
    } else if (patch.op === "remove") {
      target.children = target.children.filter((_, j) => j !== idx);
    } else if (patch.op === "add") {
      target.children.splice(idx, 0, patch.value as ClickthroughNode);
    }
  } else if (last === "props") {
    if (patch.op === "replace" || patch.op === "add") {
      target.props = patch.value as Record<string, unknown>;
    } else if (patch.op === "remove") {
      target.props = {};
    }
  } else {
    const key = last.startsWith("props.") ? last.slice(6) : last;
    if (!target.props) target.props = {};
    if (patch.op === "replace" || patch.op === "add") {
      target.props[key] = patch.value;
    } else if (patch.op === "remove") {
      delete target.props[key];
    }
  }

  return newTree;
}

export const useHarness = () => {
  const [state, setState] = useState<HarnessState>("idle");
  const [events, setEvents] = useState<HarnessEvent[]>([]);
  const [uiTree, setUiTree] = useState<ClickthroughNode | null>(null);
  const runIdRef = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const appendEvent = useCallback((event: HarnessEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  const transition = useCallback(
    (newState: HarnessState, message?: string) => {
      setState(newState);
      appendEvent({ type: "state.changed", state: newState, message });
    },
    [appendEvent]
  );

  const patchUi = useCallback(
    (patch: UiPatch) => {
      setUiTree((prev) => {
        const next = applyUiPatch(prev, patch);
        return next;
      });
      appendEvent({ type: "ui.patch", patch });
    },
    [appendEvent]
  );

  const startRun = useCallback(
    (intent: UserIntentPacket) => {
      runIdRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setEvents([]);
      setUiTree(null);
      transition("receiving_intent", `Received intent: ${intent.text}`);
    },
    [transition]
  );

  return { state, events, uiTree, startRun, transition, patchUi };
};
