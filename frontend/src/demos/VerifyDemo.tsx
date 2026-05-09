import { useState, useEffect } from "react";
import {
  IdentityCard,
  EvidenceSource,
  AlertList,
  ProgressBar,
  ConclusionCard,
  SourceTrail,
  Skeleton,
  Panel,
  StatusPill,
  Label,
  UncertaintyNote,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";
import { useAgentState } from "@/harness/useAgentState";

export default function VerifyDemo() {
  const { agentState, simulateVerify } = useAgentState();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    simulateVerify();
    const t = setTimeout(() => setShowContent(true), 2500);
    return () => clearTimeout(t);
  }, [simulateVerify]);

  const isAnalyzing = agentState !== "completed" && !showContent;
  const isComplete = showContent;

  return (
    <div className="relative min-h-screen bg-white">
      {/* Host page: Twitter-like feed */}
      <div className="flex justify-center p-6">
        <div className="w-full max-w-[560px] space-y-3">
          {/* Tweet 1 */}
          <div className="p-4 border border-outline-variant rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-surface-container" />
              <div>
                <div className="font-semibold text-sm text-on-background">Raul Garcia</div>
                <div className="text-[13px] text-on-surface-variant">@raulgcc1</div>
              </div>
            </div>
            <div className="text-[15px] leading-relaxed mb-2 text-on-background">
              I'm excited to announce that I'm joining Amazon as a summer intern!
            </div>
            <div className="text-[13px] text-on-surface-variant">
              10:42 AM · May 9, 2026
            </div>
          </div>

          {/* Tweet 2 */}
          <div className="p-4 border border-outline-variant rounded-lg bg-white">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-surface-container" />
              <div>
                <div className="font-semibold text-sm text-on-background">Jane Doe</div>
                <div className="text-[13px] text-on-surface-variant">@janedoe</div>
              </div>
            </div>
            <div className="text-[15px] leading-relaxed mb-2 text-on-background">
              Just shipped a new feature. Feels good.
            </div>
            <div className="text-[13px] text-on-surface-variant">
              9:15 AM · May 9, 2026
            </div>
          </div>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="absolute top-4 right-4 z-[100]">
        <OverlayPositioner mode="native_insertion">
          <div className="w-[400px] max-w-[calc(100vw-32px)] ct-panel-enter">
            <Panel
              chrome="standard"
              className="bg-surface border-outline"
            >
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b border-outline">
                <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                  CT
                </div>
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Claim Verification
                </span>
                <span className="ml-auto">
                  <StatusPill
                    label={isComplete ? "Complete" : "Analyzing"}
                    tone={isComplete ? "success" : "info"}
                    icon={isComplete ? "check" : undefined}
                  />
                </span>
              </div>

              {isAnalyzing && (
                <div className="p-3">
                  <Skeleton shape="form" count={4} />
                </div>
              )}

              {isComplete && (
                <div className="space-y-0">
                  {/* Claim */}
                  <div className="p-3 border-b border-outline">
                    <Label tone="muted" size="sm">
                      Claim
                    </Label>
                    <p className="font-body-md text-body-md text-on-background leading-relaxed mt-1">
                      &ldquo;I'm excited to announce that I'm joining Amazon as a summer intern!&rdquo;
                    </p>
                    <div className="font-label-mono text-label-mono text-on-surface-variant mt-2">
                      x.com/raulgcc1 · May 9, 2026
                    </div>
                  </div>

                  {/* Identity */}
                  <div className="p-3 border-b border-outline">
                    <IdentityCard
                      name="Raul Garcia"
                      aliases={["@raulgcc1"]}
                      profiles={[{ label: "X (Twitter)", url: "#" }]}
                    />
                  </div>

                  {/* Evidence Sources */}
                  <div className="p-3 border-b border-outline">
                    <Label tone="muted" size="sm">
                      Evidence Sources
                    </Label>
                    <div className="mt-2 space-y-2">
                      <EvidenceSource
                        title="Raul Garcia"
                        publisher="LinkedIn"
                        url="linkedin.com/in/raulgcc"
                        quality="high"
                      />
                      <EvidenceSource
                        title="Amazon Jobs Blog"
                        publisher="Amazon"
                        url="amazon.jobs"
                        quality="high"
                      />
                      <EvidenceSource
                        title="raulgcc1"
                        publisher="GitHub"
                        url="github.com/raulgcc1"
                        quality="medium"
                      />
                    </div>
                  </div>

                  {/* Contradictions */}
                  <div className="p-3 border-b border-outline">
                    <AlertList
                      items={[
                        {
                          message:
                            "Disagreement on start date. LinkedIn shows 'Incoming SWE Intern — Summer 2026'. Amazon blog lists cohort starting June 2.",
                          tone: "danger",
                        },
                      ]}
                    />
                  </div>

                  {/* Confidence */}
                  <div className="p-3 border-b border-outline">
                    <Label tone="muted" size="sm">
                      Confidence
                    </Label>
                    <div className="mt-2">
                      <ProgressBar value={72} label="Overall" tone="neutral" />
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="p-3 border-b border-outline">
                    <ConclusionCard
                      verdict="true"
                      summary="Multiple sources confirm Raul Garcia is joining Amazon as a summer intern. No direct contradiction found, though exact start date is unverified."
                      confidence={72}
                    />
                  </div>

                  {/* Source Trail */}
                  <div className="p-3 border-b border-outline">
                    <SourceTrail
                      steps={[
                        { label: "LinkedIn", state: "done" },
                        { label: "Amazon", state: "done" },
                        { label: "GitHub", state: "done" },
                      ]}
                    />
                  </div>

                  {/* Uncertainty */}
                  <div className="p-3">
                    <UncertaintyNote
                      reason="Clickthrough is uncertain because identity on X could not be cryptographically verified. The claim itself is consistent with other sources."
                    />
                  </div>
                </div>
              )}
            </Panel>
          </div>
        </OverlayPositioner>
      </div>
    </div>
  );
}
