import { useState } from "react";
import {
  Panel,
  Label,
  Button,
  Tag,
  StatusPill,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";

export default function SummarizeDemo() {
  const [activeAction, setActiveAction] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen bg-white">
      {/* Host page: Article */}
      <div className="flex justify-center p-8">
        <div className="w-full max-w-[640px]">
          <h1 className="text-[28px] font-semibold mb-4 text-on-background">
            The Future of Agentic Interfaces
          </h1>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            Agentic interfaces represent a fundamental shift in how humans interact with software. Instead of navigating through menus, forms, and dashboards, users state their intent and the interface adapts to meet them.
          </p>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            This paradigm is enabled by three converging trends: large language models capable of understanding context, runtime UI generation systems that can compose interfaces on the fly, and browser APIs that allow injected overlays to interact with the host page.
          </p>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            The implications are profound. A user reading a dense technical document can summon an explainer that turns paragraphs into interactive diagrams. Someone verifying a claim on social media can see a live evidence dashboard materialize over the post.
          </p>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            However, this power comes with responsibility. Generated interfaces must be safe, transparent, and controllable. Users need to know when they are interacting with agent-generated UI versus native page elements.
          </p>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            The future is not chatbots explaining the maze. It is agents generating the missing door.
          </p>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="absolute top-4 right-4 z-[100]">
        <OverlayPositioner mode="native_insertion">
          <div className="w-[380px] max-w-[calc(100vw-32px)] ct-panel-enter">
            <Panel chrome="standard" className="bg-surface border-outline">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b border-outline">
                <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                  CT
                </div>
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Page Summary
                </span>
                <span className="ml-auto">
                  <StatusPill label="Done" tone="success" icon="check" />
                </span>
              </div>

              {/* Key Points (metric grid) */}
              <div className="p-3 border-b border-outline">
                <Label tone="muted" size="sm">
                  Key Points
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold flex-shrink-0 mt-px">
                      1
                    </span>
                    <p className="font-body-sm text-body-sm text-on-background">
                      Agentic interfaces adapt to user intent instead of forcing navigation.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold flex-shrink-0 mt-px">
                      2
                    </span>
                    <p className="font-body-sm text-body-sm text-on-background">
                      Three trends enable this: LLMs, runtime UI generation, and browser APIs.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-mono text-[10px] font-bold flex-shrink-0 mt-px">
                      3
                    </span>
                    <p className="font-body-sm text-body-sm text-on-background">
                      Safety and transparency are critical for generated interfaces.
                    </p>
                  </div>
                </div>
              </div>

              {/* Topics (Tags) */}
              <div className="p-3 border-b border-outline">
                <Label tone="muted" size="sm">
                  Topics
                </Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Tag label="AI Interfaces" />
                  <Tag label="UX Design" />
                  <Tag label="Browser APIs" />
                  <Tag label="Safety" />
                </div>
              </div>

              {/* Reading Time */}
              <div className="p-3 border-b border-outline">
                <Label tone="muted" size="sm">
                  Reading Time
                </Label>
                <div className="mt-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                    schedule
                  </span>
                  <span className="font-body-sm text-body-sm text-on-background">
                    Original: 4 min · Summary: 30 sec
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-3">
                <Label tone="muted" size="sm">
                  Actions
                </Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Button
                    label="Explain visually"
                    variant="primary"
                    onClick={() => setActiveAction("explain")}
                  />
                  <Button
                    label="Find sources"
                    variant="secondary"
                    onClick={() => setActiveAction("sources")}
                  />
                  <Button
                    label="Share"
                    variant="ghost"
                    onClick={() => setActiveAction("share")}
                  />
                </div>
                {activeAction && (
                  <p className="mt-2 font-label-mono text-label-mono text-on-surface-variant">
                    Action: {activeAction}
                  </p>
                )}
              </div>
            </Panel>
          </div>
        </OverlayPositioner>
      </div>
    </div>
  );
}
