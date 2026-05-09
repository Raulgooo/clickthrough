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
  styleBrief?: PrimordialStyleBrief;
  surface?: DeclarativeSurfacePlan;
  root: ClickthroughNode;
  dataModel?: UIDeclarativeDataModel;
  requiredActions?: UIActionBinding[];
  safety: UISafetySummary;
  hostTheme?: HostTheme;
};

// ── Safety Metadata ──

// Declarative UI Plan

export type PrimordialStyleBrief = {
  intent: string;
  interfaceArchetype: string;
  anchorStrategy: string;
  layoutBias: string;
  visualTone: string;
  density: "compact" | "comfortable" | "spacious";
  hostAdaptation: "inherit" | "blend" | "contrast" | "ct_controlled";
  motionHint: "none" | "subtle" | "progressive" | "urgent";
  priorityOrder: string[];
  avoid: string[];
};

export type DeclarativeSurfacePlan = {
  intent:
    | "verify"
    | "understand"
    | "act"
    | "respond"
    | "navigate"
    | "summarize"
    | "mixed";
  purpose: string;
  anchor: UIAnchorIntent;
  layout: UILayoutIntent;
  style: UIStyleIntent;
  interaction: UIInteractionIntent;
};

export type UIAnchorIntent = {
  source:
    | "selection"
    | "focused_element"
    | "hovered_element"
    | "cursor"
    | "page_region"
    | "viewport"
    | "none";
  elementId?: string;
  selector?: string;
  textQuote?: string;
  point?: { x: number; y: number };
  fallbackMode: OverlayMode;
};

export type UILayoutIntent = {
  pattern:
    | "tiny_prompt"
    | "anchored_card"
    | "evidence_dashboard"
    | "visual_explainer"
    | "action_surface"
    | "response_assistant"
    | "workbench";
  density: "compact" | "comfortable" | "spacious";
  hierarchy: "flat" | "sectioned" | "split" | "stepped" | "timeline";
  maxAttention: "low" | "medium" | "high";
};

export type UIStyleIntent = {
  hostFit: "inherit" | "blend" | "contrast" | "ct_controlled";
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  emphasis: "quiet" | "balanced" | "strong";
  motion: "none" | "subtle" | "progressive" | "urgent";
  visualPriority?: Array<
    "source" | "claim" | "verdict" | "risk" | "action" | "explanation" | "reply"
  >;
};

export type UIInteractionIntent = {
  primaryAction?: string;
  requiresApproval: boolean;
  canMinimize: boolean;
  canDismiss: boolean;
  followUpMode: "none" | "inline" | "anchored" | "panel";
};

export type UIDeclarativeDataModel = Record<string, unknown>;

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
