import type { HarnessRunInput, ToolDefinition } from "./contracts";

export type ApprovalPolicyResult =
  | { allowed: true; approvalRequired: false }
  | { allowed: false; approvalRequired: true; reason: string };

const HIGH_RISK_TOOL_NAMES = new Set([
  "dom.click",
  "dom.fill",
  "dom.select",
  "dom.submit",
  "sharkauth.createApiKey",
]);

export function evaluateToolApproval(
  tool: ToolDefinition,
  input: unknown,
  context: HarnessRunInput
): ApprovalPolicyResult {
  if (tool.requiresApproval(input, context) || HIGH_RISK_TOOL_NAMES.has(tool.name)) {
    return {
      allowed: false,
      approvalRequired: true,
      reason: `${tool.name} requires explicit approval.`,
    };
  }

  return { allowed: true, approvalRequired: false };
}
