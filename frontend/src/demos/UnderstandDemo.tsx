import { useState, useEffect } from "react";
import {
  Stepper,
  SequenceDiagram,
  SegmentedControl,
  ComparisonTable,
  InlineQuote,
  Panel,
  Label,
  Callout,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";
import { useAgentState } from "@/harness/useAgentState";

export default function UnderstandDemo() {
  const { simulateUnderstand } = useAgentState();
  const [pkceMode, setPkceMode] = useState<"without" | "with">("with");

  useEffect(() => {
    simulateUnderstand();
  }, [simulateUnderstand]);

  return (
    <div className="relative min-h-screen bg-[#f5f5f0]">
      {/* Host page: PDF reader */}
      <div className="flex justify-center p-8">
        <div className="w-full max-w-[720px] bg-white p-12 shadow-[0_4px_24px_rgba(0,0,0,0.06)] rounded">
          <h1 className="text-[28px] font-semibold mb-6 text-on-background">
            OAuth 2.0 Authorization Code Flow with PKCE
          </h1>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            The Authorization Code flow with PKCE is the recommended approach for native apps and SPAs. The client first generates a code verifier — a cryptographically random string — and derives a code challenge from it. The client sends the code challenge to the authorization server during the authorization request. After the user authenticates, the authorization server returns an authorization code. The client then exchanges this code for an access token by presenting both the authorization code and the original code verifier. Because the verifier was never sent over the wire during the initial request, an attacker who intercepts the authorization code cannot exchange it for a token.
          </p>
          <p className="text-[15px] leading-[1.7] text-on-background mb-4">
            This mitigation prevents authorization code interception attacks, which are a realistic threat on mobile platforms where malicious apps may register URL schemes.
          </p>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="absolute top-4 right-4 z-[100]">
        <OverlayPositioner mode="native_insertion">
          <div className="w-[480px] max-w-[calc(100vw-32px)] ct-panel-enter">
            <Panel chrome="standard" className="bg-surface border-outline">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b border-outline">
                <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                  CT
                </div>
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Visual Explanation
                </span>
              </div>

              {/* Segmented Control */}
              <div className="p-3 border-b border-outline">
                <SegmentedControl
                  value={pkceMode}
                  onChange={(v) => setPkceMode(v as "without" | "with")}
                  options={[
                    { label: "Without PKCE", value: "without" },
                    { label: "With PKCE", value: "with" },
                  ]}
                />
              </div>

              {/* Stepper */}
              <div className="p-3 border-b border-outline">
                <Stepper
                  activeStep={2}
                  steps={[
                    { title: "Request", state: "done" },
                    { title: "Auth", state: "done" },
                    { title: "Exchange", state: "active" },
                    { title: "Token", state: "pending" },
                  ]}
                />
              </div>

              {/* Sequence Diagram */}
              <div className="p-3 border-b border-outline">
                <SequenceDiagram
                  actors={["Client", "Server"]}
                  messages={[
                    { from: "Client", to: "Server", label: "Authorization Request + Code Challenge" },
                    { from: "Server", to: "Client", label: "Authorization Code" },
                    { from: "Client", to: "Server", label: "Token Request + Code + Verifier" },
                    { from: "Server", to: "Client", label: "Access Token" },
                  ]}
                  activeStep={2}
                />
              </div>

              {/* Callout */}
              <div className="p-3 border-b border-outline">
                <Callout
                  title="Why intercepted codes are useless"
                  body="The attacker knows the authorization code, but not the code verifier. The verifier never traveled over the network — only its hashed challenge did."
                  tone="info"
                />
              </div>

              {/* Comparison Table */}
              <div className="p-3 border-b border-outline">
                <Label tone="muted" size="sm">
                  Comparison
                </Label>
                <div className="mt-2">
                  <ComparisonTable
                    highlightColumn={pkceMode === "with" ? "with" : "without"}
                    columns={[
                      { key: "aspect", label: "Aspect" },
                      { key: "without", label: "Without" },
                      { key: "with", label: "With" },
                    ]}
                    rows={[
                      { aspect: "Interception risk", without: "High", with: "Low" },
                      { aspect: "Client secret", without: "Yes", with: "No" },
                      { aspect: "Mobile-safe", without: "No", with: "Yes" },
                    ]}
                  />
                </div>
              </div>

              {/* Inline Quote */}
              <div className="p-3">
                <InlineQuote
                  quote="Because the verifier was never sent over the wire during the initial request, an attacker who intercepts the authorization code cannot exchange it for a token."
                  source="Source paragraph, page 12"
                />
              </div>
            </Panel>
          </div>
        </OverlayPositioner>
      </div>
    </div>
  );
}
