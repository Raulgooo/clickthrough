import { useState, useCallback, useRef, useEffect } from "react";
import type { HarnessEvent, HarnessState } from "@/types/harness";
import type { ClickthroughNode } from "@/types/primitives";
import type { GeneratedUI } from "@/types/ui";
import { createLocalHarnessSession, type HarnessSession } from "@/harness/runtime";
import type { UserIntentPacket, PageContextPacket } from "@/harness/runtime";

export type ToolProgressItem = {
  callId: string;
  toolName: string;
  status: "pending" | "running" | "done" | "failed";
  summary?: string;
};

export function useHarnessSession() {
  const [state, setState] = useState<HarnessState>("idle");
  const [events, setEvents] = useState<HarnessEvent[]>([]);
  const [uiTree, setUiTree] = useState<ClickthroughNode | null>(null);
  const [toolProgress, setToolProgress] = useState<ToolProgressItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = useRef<HarnessSession | null>(null);
  const abortRef = useRef(false);

  const sendIntent = useCallback(
    async (intent: UserIntentPacket, page: PageContextPacket) => {
      // Reset state
      setState("idle");
      setEvents([]);
      setUiTree(null);
      setToolProgress([]);
      setError(null);
      setLoading(true);
      abortRef.current = false;

      // Create session
      const session = createLocalHarnessSession();
      sessionRef.current = session;

      // Start consuming events
      const consume = async () => {
        try {
          for await (const event of session.events()) {
            if (abortRef.current) break;

            setEvents((prev) => [...prev, event]);

            if (event.type === "state.changed") {
              setState(event.state);
            }

            if (event.type === "tool.started") {
              setToolProgress((prev) => [
                ...prev,
                {
                  callId: event.call.callId,
                  toolName: event.call.toolName,
                  status: "running",
                },
              ]);
            }

            if (event.type === "tool.finished") {
              setToolProgress((prev) =>
                prev.map((t) =>
                  t.callId === event.result.callId
                    ? {
                        ...t,
                        status: event.result.status === "success" ? "done" : "failed",
                        summary: event.result.summaryForModel,
                      }
                    : t
                )
              );
            }

            if (event.type === "ui.patch" && event.patch.path === "") {
              const generated = event.patch.value as GeneratedUI;
              if (generated?.root) {
                setUiTree(generated.root);
              }
            }

            if (event.type === "result") {
              setLoading(false);
            }
          }
        } catch (err: any) {
          if (!abortRef.current) {
            setError(err.message || "Harness stream error");
            setLoading(false);
          }
        } finally {
          setLoading(false);
        }
      };

      // Start consumption in background
      consume();

      // Send input
      try {
        await session.streamInput({ type: "user.message", intent, page });
      } catch (err: any) {
        setError(err.message || "Failed to send intent");
        setLoading(false);
      }
    },
    []
  );

  const cancel = useCallback(() => {
    abortRef.current = true;
    sessionRef.current?.interrupt();
    sessionRef.current?.close();
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      sessionRef.current?.close();
    };
  }, []);

  return { state, events, uiTree, toolProgress, loading, error, sendIntent, cancel };
}
