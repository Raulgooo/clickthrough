/**
 * useApproval.ts
 *
 * Approval flow with promise-based resolution.
 * Wraps asynchronous user decisions in a React-friendly hook.
 */

import { useState, useCallback } from "react";
import type { ApprovalRequest, ApprovalDecision } from "@/types/harness";

export const useApproval = () => {
  const [pendingRequest, setPendingRequest] = useState<ApprovalRequest | null>(null);
  const [resolvers, setResolvers] = useState<{
    resolve: (d: ApprovalDecision) => void;
    reject: () => void;
  } | null>(null);

  const requestApproval = useCallback(
    (request: ApprovalRequest): Promise<ApprovalDecision> => {
      return new Promise((resolve, reject) => {
        setPendingRequest(request);
        setResolvers({ resolve, reject });
      });
    },
    []
  );

  const approve = useCallback(
    (modifiedInput?: unknown) => {
      if (!pendingRequest || !resolvers) return;
      const decision: ApprovalDecision = {
        type: "approved",
        requestId: pendingRequest.id,
        modifiedInput,
      };
      resolvers.resolve(decision);
      setPendingRequest(null);
      setResolvers(null);
    },
    [pendingRequest, resolvers]
  );

  const deny = useCallback(
    (reason?: string) => {
      if (!pendingRequest || !resolvers) return;
      const decision: ApprovalDecision = {
        type: "denied",
        requestId: pendingRequest.id,
        reason,
      };
      resolvers.resolve(decision);
      setPendingRequest(null);
      setResolvers(null);
    },
    [pendingRequest, resolvers]
  );

  const redirect = useCallback(
    (instruction: string) => {
      if (!pendingRequest || !resolvers) return;
      const decision: ApprovalDecision = {
        type: "redirected",
        requestId: pendingRequest.id,
        instruction,
      };
      resolvers.resolve(decision);
      setPendingRequest(null);
      setResolvers(null);
    },
    [pendingRequest, resolvers]
  );

  return { pendingRequest, requestApproval, approve, deny, redirect };
};
