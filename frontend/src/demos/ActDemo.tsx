import { useState, useEffect, useCallback } from "react";
import {
  StepList,
  ScopeMatrix,
  ApprovalGate,
  ExecutionLog,
  VerificationResult,
  CopyField,
  Panel,
  Label,
  Button,
  StatusPill,
  RiskSummary,
} from "@/primitives";
import { OverlayPositioner } from "@/renderer/OverlayPositioner";
import { useAgentState } from "@/harness/useAgentState";
import { useApproval } from "@/harness/useApproval";

const LOG_MESSAGES = [
  { ts: "10:42:01", icon: "✓", msg: "Validating permissions matrix", status: "done" as const },
  { ts: "10:42:01", icon: "✓", msg: "Checking environment access", status: "done" as const },
  { ts: "10:42:02", icon: "!", msg: "Full permissions flagged — logging audit event", status: "failed" as const },
  { ts: "10:42:02", icon: "✓", msg: "Generating key pair", status: "done" as const },
  { ts: "10:42:03", icon: "✓", msg: "Key created successfully", status: "done" as const },
];

export default function ActDemo() {
  const { agentState, simulateAct } = useAgentState();
  const { requestApproval, approve, deny } = useApproval();

  const [showApproval, setShowApproval] = useState(false);
  const [showExecution, setShowExecution] = useState(false);
  const [logIndex, setLogIndex] = useState(-1);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    simulateAct();
  }, [simulateAct]);

  useEffect(() => {
    if (agentState === "awaiting_approval") {
      setShowApproval(true);
    }
    if (agentState === "executing_action") {
      setShowApproval(false);
      setShowExecution(true);
      setLogIndex(0);
    }
    if (agentState === "verifying_result") {
      setShowResult(true);
    }
  }, [agentState]);

  useEffect(() => {
    if (logIndex >= 0 && logIndex < LOG_MESSAGES.length) {
      const t = setTimeout(() => setLogIndex((i) => i + 1), 700 + Math.random() * 400);
      return () => clearTimeout(t);
    }
  }, [logIndex]);

  const handleApprove = useCallback(async () => {
    const req = {
      id: "act-1",
      title: "Create API Key",
      summary: "Create a full-permissions API key in Production environment.",
      steps: ["Validate permissions", "Generate key pair", "Store in vault"],
      risks: [{ label: "Full permissions selected", level: "high" as const }],
      approveLabel: "Create key",
      cancelLabel: "Cancel",
    };
    await requestApproval(req);
    approve();
    setShowApproval(false);
    setShowExecution(true);
    setLogIndex(0);
  }, [requestApproval, approve]);

  const handleDeny = useCallback(() => {
    deny("User cancelled");
    setShowApproval(false);
  }, [deny]);

  const currentEntries = LOG_MESSAGES.slice(0, logIndex).map((m) => ({
    label: `${m.ts}  ${m.msg}`,
    status: m.status,
  }));

  return (
    <div className="relative min-h-screen bg-surface-container-low">
      {/* Host page: SharkAuth dashboard */}
      <div className="max-w-[800px] mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[22px] font-semibold text-on-background">API Keys</h2>
          <button className="px-3 py-1.5 bg-primary text-on-primary rounded border border-primary font-label-mono text-label-mono hover:bg-inverse-surface transition-colors">
            Create Key
          </button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-lg p-5 mb-4">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-outline-variant">
                <th className="text-left py-2 px-3 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left py-2 px-3 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Environment
                </th>
                <th className="text-left py-2 px-3 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Scopes
                </th>
                <th className="text-left py-2 px-3 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Created
                </th>
                <th className="text-left py-2 px-3 font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Last used
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-outline-variant">
                <td className="py-2 px-3">production-read</td>
                <td className="py-2 px-3">Production</td>
                <td className="py-2 px-3">read</td>
                <td className="py-2 px-3">Apr 2, 2026</td>
                <td className="py-2 px-3">2 hours ago</td>
              </tr>
              <tr>
                <td className="py-2 px-3">staging-full</td>
                <td className="py-2 px-3">Staging</td>
                <td className="py-2 px-3">read, write, admin</td>
                <td className="py-2 px-3">Mar 15, 2026</td>
                <td className="py-2 px-3">1 day ago</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Clickthrough Overlay */}
      <div className="absolute top-20 right-8 z-[100]">
        <OverlayPositioner mode="native_insertion">
          <div className="w-[440px] max-w-[calc(100vw-32px)] ct-panel-enter">
            <Panel chrome="standard" className="bg-surface border-outline">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b border-outline">
                <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center text-on-primary font-bold text-[8px]">
                  CT
                </div>
                <span className="font-label-mono text-label-mono text-on-surface-variant uppercase tracking-wider">
                  Create API Key
                </span>
                <span className="ml-auto">
                  {showApproval ? (
                    <StatusPill label="Approval" tone="danger" icon="warning" />
                  ) : showExecution && !showResult ? (
                    <StatusPill label="Executing" tone="info" />
                  ) : showResult ? (
                    <StatusPill label="Done" tone="success" icon="check" />
                  ) : (
                    <StatusPill label="Planning" tone="neutral" />
                  )}
                </span>
              </div>

              {/* Step List */}
              {!showExecution && !showResult && (
                <div className="p-3 border-b border-outline">
                  <StepList
                    goal="Create API Key"
                    steps={[
                      { label: "Validate permissions matrix", status: "done" },
                      { label: "Check environment access", status: "done" },
                      { label: "Generate and store key", status: "pending" },
                    ]}
                    riskLevel="high"
                    requiresApproval
                  />
                </div>
              )}

              {/* Scope Matrix */}
              {!showExecution && !showResult && (
                <div className="p-3 border-b border-outline">
                  <Label tone="muted" size="sm">
                    Scope Matrix
                  </Label>
                  <div className="mt-2">
                    <ScopeMatrix
                      selectedScopes={["users-read", "users-write", "users-admin", "keys-read", "keys-write", "keys-admin", "billing-read", "billing-write", "billing-admin"]}
                      scopes={[
                        { id: "users-read", label: "Users", risk: "low" },
                        { id: "keys-read", label: "Keys", risk: "low" },
                        { id: "billing-read", label: "Billing", risk: "high" },
                      ]}
                    />
                  </div>
                </div>
              )}

              {/* Risk Summary */}
              {!showExecution && !showResult && (
                <div className="p-3 border-b border-outline">
                  <RiskSummary
                    riskLevel="high"
                    items={[{ label: "Full permissions selected", level: "high" }]}
                    recommendation="This key can read, modify, and delete all resources including billing data."
                  />
                </div>
              )}

              {/* Approval Gate */}
              {showApproval && (
                <div className="p-3 border-b border-outline">
                  <ApprovalGate
                    title="High risk — full permissions selected"
                    summary="This key can read, modify, and delete all resources including billing data."
                    risks={[{ label: "Full permissions selected", level: "high" }]}
                    approveLabel="Create key"
                    cancelLabel="Cancel"
                  />
                  <div className="flex gap-2 justify-end mt-3">
                    <Button label="Cancel" variant="ghost" onClick={handleDeny} />
                    <Button label="Create key" variant="danger" onClick={handleApprove} />
                  </div>
                </div>
              )}

              {/* Execution Log */}
              {showExecution && (
                <div className="p-3 border-b border-outline">
                  <ExecutionLog
                    entries={currentEntries}
                    currentEntry={logIndex > 0 ? logIndex - 1 : 0}
                    mode="verbose"
                  />
                </div>
              )}

              {/* Result */}
              {showResult && (
                <div className="p-3 space-y-3">
                  <VerificationResult
                    status="success"
                    summary="Your API key has been generated. Copy it now — you won't see it again."
                    nextActions={[{ label: "Done", actionId: "done" }]}
                  />
                  <CopyField
                    label="Key"
                    value="sk_live_51H7x...9J2m"
                    masked
                    revealRequiresClick
                  />
                </div>
              )}
            </Panel>
          </div>
        </OverlayPositioner>
      </div>
    </div>
  );
}
