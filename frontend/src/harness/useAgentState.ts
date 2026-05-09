/**
 * useAgentState.ts
 *
 * Consumes streaming agent state and produces UI patches.
 * Provides demo simulation functions for each intent family.
 */

import { useState, useCallback, useRef } from "react";
import type { AgentState, IntentClassification } from "@/types/harness";

export type ToolProgress = {
  callId: string;
  toolName: string;
  status: "pending" | "running" | "done" | "failed";
  progress?: number;
  detail?: string;
};

export const useAgentState = () => {
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [toolProgress, setToolProgress] = useState<ToolProgress[]>([]);
  const [currentIntent, setCurrentIntent] = useState<IntentClassification | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);

  const simulateVerify = useCallback(() => {
    clearAllTimeouts();
    setToolProgress([]);
    setCurrentIntent({
      family: "verify",
      confidence: 0.94,
      target: "claim",
      needsWebSearch: true,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    });

    schedule(() => setAgentState("observing_page"), 100);
    schedule(() => setAgentState("planning"), 600);
    schedule(() => {
      setAgentState("running_tools");
      setToolProgress([
        {
          callId: "t1",
          toolName: "web_search",
          status: "running",
          progress: 0,
          detail: "Searching claim sources...",
        },
      ]);
    }, 1200);
    schedule(() => {
      setToolProgress((prev) =>
        prev.map((t) => (t.callId === "t1" ? { ...t, progress: 50 } : t))
      );
    }, 2200);
    schedule(() => {
      setToolProgress((prev) => [
        ...prev.map((t) =>
          t.callId === "t1"
            ? { ...t, status: "done" as const, progress: 100 }
            : t
        ),
        {
          callId: "t2",
          toolName: "fetch_source",
          status: "running",
          progress: 0,
          detail: "Fetching primary source...",
        },
      ]);
    }, 2800);
    schedule(() => {
      setToolProgress((prev) =>
        prev.map((t) =>
          t.callId === "t2"
            ? { ...t, status: "done" as const, progress: 100 }
            : t
        )
      );
    }, 4200);
    schedule(() => {
      setAgentState("generating_ui");
      setToolProgress([]);
    }, 4600);
    schedule(() => setAgentState("completed"), 5600);
  }, [clearAllTimeouts, schedule]);

  const simulateUnderstand = useCallback(() => {
    clearAllTimeouts();
    setToolProgress([]);
    setCurrentIntent({
      family: "understand",
      confidence: 0.91,
      target: "page",
      needsWebSearch: false,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    });

    schedule(() => setAgentState("observing_page"), 100);
    schedule(() => setAgentState("planning"), 600);
    schedule(() => setAgentState("generating_ui"), 1400);
    schedule(() => setAgentState("completed"), 2400);
  }, [clearAllTimeouts, schedule]);

  const simulateAct = useCallback(() => {
    clearAllTimeouts();
    setToolProgress([]);
    setCurrentIntent({
      family: "act",
      confidence: 0.88,
      target: "workflow",
      needsWebSearch: false,
      needsDomActions: true,
      needsApproval: true,
      riskLevel: "high",
    });

    schedule(() => setAgentState("observing_page"), 100);
    schedule(() => setAgentState("planning"), 600);
    schedule(() => setAgentState("awaiting_approval"), 1200);
    schedule(() => {
      setAgentState("executing_action");
      setToolProgress([
        {
          callId: "ba-1",
          toolName: "browser_action",
          status: "running",
          progress: 0,
          detail: "Executing workflow steps...",
        },
      ]);
    }, 3200);
    schedule(() => {
      setToolProgress((prev) =>
        prev.map((t) => (t.callId === "ba-1" ? { ...t, progress: 60 } : t))
      );
    }, 4200);
    schedule(() => {
      setAgentState("verifying_result");
      setToolProgress((prev) =>
        prev.map((t) =>
          t.callId === "ba-1"
            ? { ...t, status: "done" as const, progress: 100 }
            : t
        )
      );
    }, 5200);
    schedule(() => setAgentState("completed"), 6200);
  }, [clearAllTimeouts, schedule]);

  const simulateRespond = useCallback(() => {
    clearAllTimeouts();
    setToolProgress([]);
    setCurrentIntent({
      family: "respond",
      confidence: 0.85,
      target: "message",
      needsWebSearch: false,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    });

    schedule(() => setAgentState("observing_page"), 100);
    schedule(() => setAgentState("classifying_intent"), 600);
    schedule(() => setAgentState("generating_ui"), 1200);
    schedule(() => setAgentState("completed"), 2200);
  }, [clearAllTimeouts, schedule]);

  return {
    agentState,
    toolProgress,
    currentIntent,
    simulateVerify,
    simulateUnderstand,
    simulateAct,
    simulateRespond,
  };
};
