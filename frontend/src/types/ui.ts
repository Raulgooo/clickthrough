/**
 * Clickthrough UI Types
 *
 * Types specific to the generated UI payload, safety summary,
 * action bindings, primitive manifest, and patch operations.
 */

import type { ClickthroughNode, HostTheme } from "./primitives";
import type { OverlayMode } from "./harness";

// ── Generated UI Payload ──

export type GeneratedUI = {
  overlayMode: OverlayMode;
  root: ClickthroughNode;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
  hostTheme?: HostTheme;
};

// ── Safety Metadata ──

export type UISafetySummary = {
  riskLevel: "low" | "medium" | "high";
  requiresApproval: boolean;
  hasSensitiveContext: boolean;
  uncertaintyNotes?: string[];
  guardPrimitives?: string[];
};

// ── Action Bindings ──

export type UIActionBinding = {
  actionId: string;
  label: string;
  risk?: "low" | "medium" | "high";
  description?: string;
};

// ── Primitive Manifest ──

export type PrimitiveManifestSummary = {
  name: string;
  description: string;
  category: string;
  propSchema: string;
  allowsChildren: boolean;
};

// ── UI Patch (atomic tree update) ──

export type UiPatch = {
  op: "add" | "remove" | "replace" | "move";
  path: string;
  value?: unknown;
};
