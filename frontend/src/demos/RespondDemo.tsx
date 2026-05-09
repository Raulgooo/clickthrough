import { useState, useEffect } from "react";
import {
  SensitiveContextGuard,
  Timeline,
  Callout,
  SegmentedControl,
  TextArea,
  Button,
  Panel,
  Label,
  StatusPill,
  UncertaintyNote,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";
import { useAgentState } from "@/harness/useAgentState";

const REPLIES = [
  "I'm sorry you're feeling awful today. No pressure to do anything — just rest if you need to. Let me know if I can bring you anything or help out.",
  "That sounds really rough. Take care of yourself today. I'm here if you need anything.",
  "Sending you comfort. Periods can be really debilitating. Rest up and don't push yourself.",
];

export default function RespondDemo() {
  const { agentState, simulateRespond } = useAgentState();
  const [guardDismissed, setGuardDismissed] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [tone, setTone] = useState<"empathetic" | "light" | "check-in">("empathetic");
  const [reply, setReply] = useState(REPLIES[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    simulateRespond();
  }, [simulateRespond]);

  useEffect(() => {
    if (agentState === "completed") {
      setGuardDismissed(true);
      setOverlayVisible(true);
    }
  }, [agentState]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRegenerate = () => {
    setReply(REPLIES[Math.floor(Math.random() * REPLIES.length)]);
  };

  return (
    <div className="relative min-h-screen bg-[#f0f0f0]">
      {/* Host page: Chat window */}
      <div className="flex justify-center p-6">
        <div className="w-full max-w-[420px] bg-white rounded-lg shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col h-[560px]">
          <div className="p-3 px-4 border-b border-outline-variant font-semibold text-sm text-on-background">
            Message
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="max-w-[80%] p-2 px-3 rounded-lg bg-surface-container-low self-start text-[13px] leading-relaxed text-on-background border-b border-outline-variant">
              Sorry, I'm on my period and feel awful today.
            </div>
            <div className="max-w-[80%] p-2 px-3 rounded-lg bg-primary text-white self-end text-[13px] leading-relaxed">
              Oh no, I'm sorry to hear that. Let me think about how to respond.
            </div>
          </div>
          <div className="p-3 px-4 border-t border-outline-variant flex gap-2">
            <input
              className="flex-1 px-2 py-1.5 bg-surface border border-outline rounded text-[13px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Type a message..."
            />
            <button className="px-3 py-1.5 bg-primary text-on-primary rounded border border-primary font-label-mono text-label-mono hover:bg-inverse-surface transition-colors">
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Sensitive Context Guard (modal) */}
      {!guardDismissed && (
        <OverlayPositioner mode="spotlight">
          <div className="p-6">
            <SensitiveContextGuard
              category="health"
              message="This topic may be personal. Clickthrough can offer general information, not professional medical advice. Nothing you share here is stored."
              continueActionId="continue"
            />
            <div className="flex gap-2 justify-center mt-4">
              <Button
                label="Cancel"
                variant="ghost"
                onClick={() => setGuardDismissed(true)}
              />
              <Button
                label="Continue"
                variant="primary"
                onClick={() => {
                  setGuardDismissed(true);
                  setOverlayVisible(true);
                }}
              />
            </div>
          </div>
        </OverlayPositioner>
      )}

      {/* Clickthrough Overlay */}
      {guardDismissed && overlayVisible && (
        <div className="absolute top-2 right-2 z-[100]">
          <OverlayPositioner mode="native_insertion">
            <div className="w-[380px] max-w-[calc(100vw-16px)] ct-panel-enter">
              <Panel chrome="standard" className="bg-surface border-outline">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 border-b border-outline">
                  <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                    CT
                  </div>
                  <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                    Response Assistant
                  </span>
                  <span className="ml-auto">
                    <StatusPill label="Private" tone="neutral" />
                  </span>
                </div>

                {/* Explanation Callout */}
                <div className="p-3 border-b border-outline">
                  <Callout
                    title="What this means"
                    body="The person is experiencing menstrual discomfort and is not feeling well today. They are sharing this to explain why they may be less available."
                    tone="info"
                  />
                </div>

                {/* Timeline */}
                <div className="p-3 border-b border-outline">
                  <Label tone="muted" size="sm">
                    Cycle Context
                  </Label>
                  <div className="mt-2">
                    <Timeline
                      activeId="menstruation"
                      items={[
                        { id: "follicular", label: "Follicular phase", date: "Days 1–14 · Energy rising" },
                        { id: "menstruation", label: "Menstruation", date: "Days 1–5 · Possible cramps, fatigue", active: true },
                        { id: "ovulation", label: "Ovulation", date: "Day 14 · Peak energy" },
                        { id: "luteal", label: "Luteal phase", date: "Days 15–28 · Mood may shift" },
                      ]}
                    />
                  </div>
                </div>

                {/* What not to say */}
                <div className="p-3 border-b border-outline">
                  <Callout
                    title="What not to say"
                    body={`"It can't be that bad." / "Have you tried yoga?" / "At least it's not [something worse]."`}
                    tone="danger"
                  />
                </div>

                {/* Tone Segmented Control */}
                <div className="p-3 border-b border-outline">
                  <Label tone="muted" size="sm">
                    Tone
                  </Label>
                  <div className="mt-2">
                    <SegmentedControl
                      value={tone}
                      onChange={(v) => setTone(v as typeof tone)}
                      options={[
                        { label: "Empathetic", value: "empathetic" },
                        { label: "Light", value: "light" },
                        { label: "Check-in", value: "check-in" },
                      ]}
                    />
                  </div>
                </div>

                {/* Suggested Reply */}
                <div className="p-3">
                  <Label tone="muted" size="sm">
                    Suggested Reply
                  </Label>
                  <div className="mt-2">
                    <TextArea
                      value={reply}
                      onChange={setReply}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button
                      label="↻ Regenerate"
                      variant="ghost"
                      onClick={handleRegenerate}
                    />
                    <Button
                      label={copied ? "Copied" : "Copy reply"}
                      variant="primary"
                      icon={copied ? "check" : "content_copy"}
                      onClick={handleCopy}
                    />
                  </div>
                </div>

                {/* Uncertainty */}
                <div className="p-3 pt-2 border-t border-dashed border-outline-variant">
                  <UncertaintyNote
                    reason="Clickthrough is uncertain because it does not know your relationship with this person or what they might need most right now. You know them best."
                  />
                </div>
              </Panel>
            </div>
          </OverlayPositioner>
        </div>
      )}
    </div>
  );
}
