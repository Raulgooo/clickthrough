# User A Harness And Extension Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the functional TypeScript Clickthrough harness loop and a thin browser-extension message-port adapter that uses the same harness contracts.

**Architecture:** The harness remains the product core: classify intent, create a style brief, plan UI/tools/actions, validate generated primitives, stream typed events, enforce approval, execute approved actions, and verify results. Extension infrastructure is only a transport and page bridge: content script captures page context and renders the overlay, background script owns the session, and both communicate with typed messages matching the in-process event schema.

**Tech Stack:** Vite, React, TypeScript, Vitest, Chrome MV3 extension primitives, async iterables, Clickthrough primitive schema, provider-neutral web tool contracts.

---

## Scope

This plan implements User A's work and the minimum extension infrastructure needed to prove the harness can move outside the Vite demo without changing contracts.

In scope:

- TypeScript harness runtime state machine.
- Intent classifier for `verify`, `understand`, `act`, `respond`, `summarize`, `navigate`, and `unknown`.
- Primordial style brief and deterministic planner.
- Provider-neutral tool registry with DOM, web, and action tool hooks.
- Real UI validation against registered primitives and safety rules.
- Approval wait/resume flow.
- Verification result handling.
- Vitest test infrastructure and focused unit/contract tests.
- Extension message types, content adapter, and background session adapter.

Out of scope for this plan:

- Full model-backed generation.
- Full Exa live API integration beyond provider boundary and disabled-by-default adapter.
- Store-ready browser extension packaging.
- SharkAuth credentials or live workspace discovery.
- Broad MCP loading.

## File Structure

### Runtime Core

- `frontend/src/harness/runtime/session.ts`
  - Owns `LocalHarnessSession`, input queue, pending approvals, state transitions, tool loop, UI patches, approval wait/resume, action execution, verification, cancellation, and completion.
- `frontend/src/harness/runtime/classifier.ts`
  - Deterministic intent classification used by the first functional harness.
- `frontend/src/harness/runtime/stylePlanner.ts`
  - Produces `PrimordialStyleBrief` from intent, prompt, page context, and host theme.
- `frontend/src/harness/runtime/planner.ts`
  - Produces `AgentPlan` and `GeneratedUI` from classification, style brief, page context, and tool results.
- `frontend/src/harness/runtime/tools/registry.ts`
  - Creates a typed tool registry and executes tool calls with policy checks.
- `frontend/src/harness/runtime/tools/web.ts`
  - Provider-neutral `web.search` and `web.fetch` tools with cache/demo fallback and optional Exa adapter.
- `frontend/src/harness/runtime/tools/dom.ts`
  - `dom.scan` wrapper for already-provided page context, plus `dom.highlight` as a low-risk visible tool.
- `frontend/src/harness/runtime/verification.ts`
  - Converts action/tool evidence into `VerificationResult` and final `HarnessResult`.
- `frontend/src/harness/runtime/fixtures.ts`
  - Contract fixtures for page context, web evidence, generated UI declarations, and approvals.
- `frontend/src/harness/runtime/index.ts`
  - Re-exports all runtime modules.

### Validation And Contracts

- `frontend/src/renderer/primitiveManifest.ts`
  - Shared source of truth for primitive names consumed by renderer and runtime validator.
- `frontend/src/renderer/PrimitiveRenderer.tsx`
  - Imports `primitiveMap` from `primitiveManifest.ts`.
- `frontend/src/harness/runtime/validateUi.ts`
  - Validates primitive names, rejects raw HTML/CSS/script props, enforces approval gate for high-risk generated UI, and validates surface/style brief constraints.
- `frontend/src/types/ui.ts`
  - Already contains `PrimordialStyleBrief`, `DeclarativeSurfacePlan`, and `GeneratedUI`; update only if tests reveal a mismatch.
- `frontend/src/types/harness.ts`
  - Keep as the shared event/action/state type source.
- `frontend/src/harness/runtime/contracts.ts`
  - Add runtime dependency injection types for tools, browser action execution, and verification.

### Browser Bridge And Extension

- `frontend/src/browser/pageBridge.ts`
  - Add `buildUserIntentPacket()` helper and keep `buildPageContextPacket()` as content-script-safe scanner entry.
- `frontend/src/extension/shared/messages.ts`
  - Typed extension message protocol.
- `frontend/src/extension/background.ts`
  - Owns a `LocalHarnessSession`, receives run/approval/interrupt messages, streams harness events back through a Chrome port.
- `frontend/src/extension/content.tsx`
  - Captures selected text/page context, connects to background port, sends user run requests, receives events, and mounts overlay root.
- `frontend/public/manifest.json`
  - Chrome MV3 manifest for dev extension build.
- `frontend/vite.config.ts`
  - Add extension-mode build inputs with stable output filenames.

### Tests

- `frontend/vitest.config.ts`
  - Vitest config for TypeScript runtime tests.
- `frontend/src/harness/runtime/__tests__/classifier.test.ts`
- `frontend/src/harness/runtime/__tests__/stylePlanner.test.ts`
- `frontend/src/harness/runtime/__tests__/validateUi.test.ts`
- `frontend/src/harness/runtime/__tests__/planner.test.ts`
- `frontend/src/harness/runtime/__tests__/session.test.ts`
- `frontend/src/harness/runtime/__tests__/tools.test.ts`
- `frontend/src/extension/__tests__/messages.test.ts`

---

### Task 1: Add Vitest And Contract Fixture Foundation

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Create: `frontend/src/harness/runtime/fixtures.ts`
- Test: `frontend/src/harness/runtime/__tests__/fixtures.test.ts`

- [ ] **Step 1: Install test dependencies**

Run:

```powershell
cd frontend
npm install -D vitest jsdom @vitest/ui
```

Expected: `package.json` and `package-lock.json` include the new dev dependencies.

- [ ] **Step 2: Add test scripts**

Modify `frontend/package.json` scripts to exactly include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

- [ ] **Step 3: Create Vitest config**

Create `frontend/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    coverage: {
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Create fixture helpers**

Create `frontend/src/harness/runtime/fixtures.ts`:

```ts
import type { ClickthroughNode, HostTheme } from "@/types/primitives";
import type { GeneratedUI, PrimordialStyleBrief } from "@/types/ui";
import type {
  ApprovalRequest,
  BrowserActionPlan,
  IntentClassification,
} from "@/types/harness";
import type {
  GroundedWebSource,
  PageContextPacket,
  UserIntentPacket,
  WebSearchOutput,
} from "./contracts";

export const fixtureHostTheme: HostTheme = {
  mode: "light",
  fontFamily: "Inter, system-ui, sans-serif",
  textColor: "#0f172a",
  mutedTextColor: "#64748b",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  borderColor: "#cbd5e1",
  accentColor: "#2563eb",
  successColor: "#16a34a",
  warningColor: "#d97706",
  dangerColor: "#dc2626",
  borderRadius: 8,
  controlRadius: 6,
  shadowStyle: "soft",
  density: "comfortable",
  buttonStyle: "mixed",
  inputStyle: "outlined",
};

export const fixtureIntent: UserIntentPacket = {
  prompt: "CT, is this claim true?",
  inputMode: "hotkey",
  selectedText: "I'm joining Amazon as a summer intern",
  anchorElementId: "ct-el-claim",
  pageUrl: "https://x.example/post/1",
  pageTitle: "X post",
  timestamp: "2026-05-09T20:00:00.000Z",
};

export const fixturePage: PageContextPacket = {
  url: fixtureIntent.pageUrl,
  title: fixtureIntent.pageTitle,
  visibleText: "I'm joining Amazon as a summer intern. Like and repost.",
  selectedText: fixtureIntent.selectedText,
  focusedElement: undefined,
  nearbyElements: [
    {
      id: "ct-el-claim",
      tagName: "article",
      label: "Post text",
      text: fixtureIntent.selectedText,
      visible: true,
      disabled: false,
      bounds: { x: 24, y: 120, width: 520, height: 96 },
    },
  ],
  capabilityMap: [
    {
      id: "cap-ct-el-claim",
      label: "Post text",
      kind: "unknown",
      elementIds: ["ct-el-claim"],
      confidence: 0.72,
    },
  ],
  hostTheme: fixtureHostTheme,
};

export const fixtureVerifyClassification: IntentClassification = {
  family: "verify",
  confidence: 0.92,
  target: "claim",
  needsWebSearch: true,
  needsDomActions: false,
  needsApproval: false,
  riskLevel: "low",
};

export const fixtureStyleBrief: PrimordialStyleBrief = {
  intent: "verify",
  interfaceArchetype: "anchored evidence dashboard",
  anchorStrategy: "start from selected claim and preserve source in view",
  layoutBias: "compact sectioned popover with source trail and verdict",
  visualTone: "skeptical but calm",
  density: "compact",
  hostAdaptation: "blend",
  motionHint: "progressive",
  priorityOrder: ["claim", "search progress", "source quality", "verdict"],
  avoid: ["chat transcript", "decorative imagery", "certainty without evidence"],
};

export const fixtureSource: GroundedWebSource = {
  id: "src-amazon-internships",
  url: "https://example.com/amazon-internships",
  title: "Amazon internships announcement",
  publisher: "Example News",
  publishedDate: "2026-05-01",
  retrievedAt: "2026-05-09T20:00:01.000Z",
  snippet: "No matching public announcement was found for the claim.",
  highlights: [{ text: "Amazon summer internship announcements are public for selected programs." }],
  quality: "medium",
  freshness: "current",
  imageUrl: "https://example.com/amazon.jpg",
  faviconUrl: "https://example.com/favicon.ico",
  media: [
    {
      kind: "representative",
      url: "https://example.com/amazon.jpg",
      sourceUrl: "https://example.com/amazon-internships",
      provider: "cache",
    },
  ],
  provider: "cache",
};

export const fixtureWebSearchOutput: WebSearchOutput = {
  query: "Amazon summer intern announcement selected claim",
  provider: "cache",
  retrievedAt: "2026-05-09T20:00:01.000Z",
  cacheStatus: "hit",
  sources: [fixtureSource],
};

export const fixtureActionPlan: BrowserActionPlan = {
  id: "action-create-key",
  goal: "Create a full-permissions API key after approval",
  steps: [
    { kind: "click", elementId: "ct-el-new-key" },
    { kind: "fill", elementId: "ct-el-key-name", value: "Hackathon demo key" },
    { kind: "select", elementId: "ct-el-scope", value: "full" },
    { kind: "verify", assertion: "API key appears in the key list" },
  ],
};

export const fixtureApprovalRequest: ApprovalRequest = {
  id: "approval-create-key",
  title: "Create full-permissions API key?",
  summary: "Clickthrough will create a key that can access all SharkAuth resources.",
  steps: ["Open key form", "Set full permissions", "Create key", "Verify key appears"],
  risks: [{ label: "Credential creation", level: "high" }],
  actionPlanId: fixtureActionPlan.id,
  approveLabel: "Create key",
  cancelLabel: "Cancel",
};

export const fixtureGeneratedUiRoot: ClickthroughNode = {
  type: "OverlayRoot",
  props: { id: "verify-root", intent: "verify", mode: "popover" },
  children: [
    { type: "AnchorHighlight", props: { label: "Claim", tone: "warning" } },
    {
      type: "Panel",
      props: { title: "Claim check", tone: "warning", chrome: "standard" },
      children: [
        { type: "ProgressList", props: { items: [{ label: "Searching sources", state: "done" }] } },
        {
          type: "EvidenceStack",
          props: {
            groupBy: "stance",
            sources: [
              {
                title: fixtureSource.title,
                url: fixtureSource.url,
                publisher: fixtureSource.publisher,
                snippet: fixtureSource.snippet,
                imageUrl: fixtureSource.imageUrl,
                faviconUrl: fixtureSource.faviconUrl,
                stance: "background",
                quality: "medium",
                freshness: "current",
              },
            ],
          },
        },
        {
          type: "ConclusionCard",
          props: {
            verdict: "unverified",
            headline: "No public confirmation yet",
            confidence: 0.48,
          },
        },
      ],
    },
  ],
};

export const fixtureGeneratedUi: GeneratedUI = {
  overlayMode: "anchored_popover",
  styleBrief: fixtureStyleBrief,
  surface: {
    intent: "verify",
    purpose: "Check a selected claim without leaving the source page",
    anchor: {
      source: "selection",
      elementId: "ct-el-claim",
      textQuote: fixtureIntent.selectedText,
      fallbackMode: "anchored_popover",
    },
    layout: {
      pattern: "evidence_dashboard",
      density: "compact",
      hierarchy: "sectioned",
      maxAttention: "medium",
    },
    style: {
      hostFit: "blend",
      tone: "warning",
      emphasis: "balanced",
      motion: "progressive",
      visualPriority: ["claim", "source", "verdict"],
    },
    interaction: {
      requiresApproval: false,
      canMinimize: true,
      canDismiss: true,
      followUpMode: "anchored",
    },
  },
  root: fixtureGeneratedUiRoot,
  dataModel: { claim: fixtureIntent.selectedText, sources: [fixtureSource] },
  safety: {
    riskLevel: "low",
    requiresApproval: false,
    hasSensitiveContext: false,
    uncertaintyNotes: ["No single source confirms the claim."],
  },
  hostTheme: fixtureHostTheme,
};
```

- [ ] **Step 5: Write a fixture sanity test**

Create `frontend/src/harness/runtime/__tests__/fixtures.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  fixtureGeneratedUi,
  fixturePage,
  fixtureWebSearchOutput,
} from "../fixtures";

describe("runtime fixtures", () => {
  it("provides a realistic page context packet", () => {
    expect(fixturePage.selectedText).toContain("Amazon");
    expect(fixturePage.capabilityMap[0].elementIds).toEqual(["ct-el-claim"]);
  });

  it("provides media-grounded web evidence without provider-specific response shape", () => {
    expect(fixtureWebSearchOutput.sources[0].imageUrl).toMatch(/^https:/);
    expect(fixtureWebSearchOutput.sources[0]).not.toHaveProperty("exa");
  });

  it("provides a generated UI declaration with surface and primitive root", () => {
    expect(fixtureGeneratedUi.surface?.layout.pattern).toBe("evidence_dashboard");
    expect(fixtureGeneratedUi.root.type).toBe("OverlayRoot");
  });
});
```

- [ ] **Step 6: Run fixture test**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/fixtures.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/vitest.config.ts frontend/src/harness/runtime/fixtures.ts frontend/src/harness/runtime/__tests__/fixtures.test.ts
git commit -m "test: add harness fixture foundation"
```

---

### Task 2: Share Primitive Manifest And Harden UI Validation

**Files:**
- Create: `frontend/src/renderer/primitiveManifest.ts`
- Modify: `frontend/src/renderer/PrimitiveRenderer.tsx`
- Modify: `frontend/src/harness/runtime/validateUi.ts`
- Test: `frontend/src/harness/runtime/__tests__/validateUi.test.ts`

- [ ] **Step 1: Write validation tests first**

Create `frontend/src/harness/runtime/__tests__/validateUi.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { GeneratedUI } from "@/types/ui";
import { fixtureGeneratedUi } from "../fixtures";
import { validateGeneratedUi } from "../validateUi";

describe("validateGeneratedUi", () => {
  it("accepts a valid generated UI declaration", () => {
    const result = validateGeneratedUi(fixtureGeneratedUi);
    expect(result.valid).toBe(true);
  });

  it("rejects unknown primitives", () => {
    const invalid: GeneratedUI = {
      ...fixtureGeneratedUi,
      root: { type: "MagicHtmlBox", props: { children: "bad" } },
    };
    const result = validateGeneratedUi(invalid);
    expect(result.valid).toBe(false);
    expect(result.valid === false ? result.errors : []).toContain("Unknown primitive: MagicHtmlBox");
  });

  it("rejects raw html, script, and style props", () => {
    const invalid: GeneratedUI = {
      ...fixtureGeneratedUi,
      root: {
        type: "Panel",
        props: {
          dangerouslySetInnerHTML: { __html: "<script>alert(1)</script>" },
          style: { position: "fixed" },
          onClick: "alert(1)",
        },
      },
    };
    const result = validateGeneratedUi(invalid);
    expect(result.valid).toBe(false);
    expect(result.valid === false ? result.errors.join("\n") : "").toContain("Unsafe prop");
  });

  it("requires an approval gate when generated UI requires approval", () => {
    const invalid: GeneratedUI = {
      ...fixtureGeneratedUi,
      safety: { ...fixtureGeneratedUi.safety, riskLevel: "high", requiresApproval: true },
      root: {
        type: "OverlayRoot",
        props: { id: "act-root", intent: "act", mode: "panel" },
        children: [{ type: "Panel", props: { title: "Create key" } }],
      },
    };
    const result = validateGeneratedUi(invalid);
    expect(result.valid).toBe(false);
    expect(result.valid === false ? result.errors : []).toContain(
      "High-risk generated UI requires an ApprovalGate primitive."
    );
  });
});
```

- [ ] **Step 2: Run validation tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/validateUi.test.ts
```

Expected: FAIL because `validateGeneratedUi` currently accepts only a `ClickthroughNode`, not a full `GeneratedUI`, and does not reject unsafe props.

- [ ] **Step 3: Create primitive manifest**

Create `frontend/src/renderer/primitiveManifest.ts`:

```ts
import type { ComponentType } from "react";
import {
  Accordion,
  AgentStateIndicator,
  AlertList,
  AnchorHighlight,
  AnnotatedDiagram,
  ApprovalGate,
  AuditTrail,
  Badge,
  BodyText,
  Breadcrumb,
  BudgetBar,
  Button,
  Callout,
  CarouselFrame,
  ChartFrame,
  CheckboxRow,
  ClarificationPrompt,
  CodeBlock,
  CodeFrame,
  ComparisonTable,
  ConclusionCard,
  CopyField,
  CTMark,
  DataStream,
  DiagramFrame,
  Divider,
  EmptyState,
  ErrorState,
  EvidenceSource,
  EvidenceStack,
  ExecutionLog,
  FloatingIndicator,
  FlowDiagram,
  FollowUpBar,
  Grid,
  Heading,
  IconButton,
  IdentityCard,
  ImageFrame,
  InlineQuote,
  IntentConfirmation,
  InterruptControl,
  Label,
  LoadingSpinner,
  MapFrame,
  MediaFrame,
  MemoryChip,
  Metadata,
  OverlayPositioner,
  OverlayRoot,
  PageDimmer,
  Panel,
  PermissionBadge,
  PrivateModeBadge,
  ProgressBar,
  ProgressList,
  PromptBar,
  QuoteCard,
  RadioRow,
  Rail,
  RiskSummary,
  ScanLine,
  ScopeMatrix,
  ScreenshotFrame,
  Section,
  SecurityBoundary,
  SegmentedControl,
  Select,
  SensitiveContextGuard,
  SequenceDiagram,
  Skeleton,
  Slider,
  SourceQualityBadge,
  SourceTrail,
  Spacer,
  SplitPane,
  Stack,
  StatusPill,
  StepList,
  Stepper,
  SuccessState,
  Tabs,
  Tag,
  TextArea,
  TextField,
  Timeline,
  Toggle,
  ToolProgressCard,
  Tooltip,
  TrustIndicator,
  UncertaintyNote,
  VerificationResult,
} from "@/primitives";

export const primitiveMap: Record<string, ComponentType<any>> = {
  Accordion,
  AgentStateIndicator,
  AlertList,
  AnchorHighlight,
  AnnotatedDiagram,
  ApprovalGate,
  AuditTrail,
  Badge,
  BodyText,
  Breadcrumb,
  BudgetBar,
  Button,
  Callout,
  CarouselFrame,
  ChartFrame,
  CheckboxRow,
  ClarificationPrompt,
  CodeBlock,
  CodeFrame,
  ComparisonTable,
  ConclusionCard,
  CopyField,
  CTMark,
  DataStream,
  DiagramFrame,
  Divider,
  EmptyState,
  ErrorState,
  EvidenceSource,
  EvidenceStack,
  ExecutionLog,
  FloatingIndicator,
  FlowDiagram,
  FollowUpBar,
  Grid,
  Heading,
  IconButton,
  IdentityCard,
  ImageFrame,
  InlineQuote,
  IntentConfirmation,
  InterruptControl,
  Label,
  LoadingSpinner,
  MapFrame,
  MediaFrame,
  MemoryChip,
  Metadata,
  OverlayPositioner,
  OverlayRoot,
  PageDimmer,
  Panel,
  PermissionBadge,
  PrivateModeBadge,
  ProgressBar,
  ProgressList,
  PromptBar,
  QuoteCard,
  RadioRow,
  Rail,
  RiskSummary,
  ScanLine,
  ScopeMatrix,
  ScreenshotFrame,
  Section,
  SecurityBoundary,
  SegmentedControl,
  Select,
  SensitiveContextGuard,
  SequenceDiagram,
  Skeleton,
  Slider,
  SourceQualityBadge,
  SourceTrail,
  Spacer,
  SplitPane,
  Stack,
  StatusPill,
  StepList,
  Stepper,
  SuccessState,
  Tabs,
  Tag,
  TextArea,
  TextField,
  Timeline,
  Toggle,
  ToolProgressCard,
  Tooltip,
  TrustIndicator,
  UncertaintyNote,
  VerificationResult,
};

export const primitiveNames = new Set(Object.keys(primitiveMap));
```

- [ ] **Step 4: Modify renderer to import manifest**

Replace local `primitiveMap` in `frontend/src/renderer/PrimitiveRenderer.tsx` with:

```ts
import { Fragment } from "react";
import type { ClickthroughNode } from "@/types/primitives";
import { primitiveMap } from "./primitiveManifest";
```

Keep `renderNode` and `PrimitiveRenderer` unchanged after removing the old imports and local map.

- [ ] **Step 5: Implement validator**

Replace `frontend/src/harness/runtime/validateUi.ts` with:

```ts
import type { ClickthroughNode } from "@/types/primitives";
import type { GeneratedUI } from "@/types/ui";
import { primitiveNames } from "@/renderer/primitiveManifest";

export type UiValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const UNSAFE_PROP_NAMES = new Set(["dangerouslySetInnerHTML", "style"]);

export function validateGeneratedUi(ui: GeneratedUI | ClickthroughNode): UiValidationResult {
  const root = "root" in ui ? ui.root : ui;
  const errors: string[] = [];

  visit(root, errors);

  if ("safety" in ui && ui.safety.requiresApproval && !containsPrimitive(root, "ApprovalGate")) {
    errors.push("High-risk generated UI requires an ApprovalGate primitive.");
  }

  if ("styleBrief" in ui && ui.styleBrief) {
    if (ui.styleBrief.avoid.some((item) => item.toLowerCase().includes("raw css"))) {
      errors.push("Style brief must not rely on raw CSS avoidance as its only safety boundary.");
    }
  }

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function visit(node: ClickthroughNode, errors: string[]): void {
  if (!primitiveNames.has(node.type)) {
    errors.push(`Unknown primitive: ${node.type}`);
  }

  for (const [key, value] of Object.entries(node.props ?? {})) {
    if (UNSAFE_PROP_NAMES.has(key) || key.startsWith("on")) {
      errors.push(`Unsafe prop on ${node.type}: ${key}`);
    }
    if (typeof value === "string" && /<script|javascript:/i.test(value)) {
      errors.push(`Unsafe prop value on ${node.type}: ${key}`);
    }
  }

  for (const child of node.children ?? []) {
    visit(child, errors);
  }
}

function containsPrimitive(node: ClickthroughNode, primitive: string): boolean {
  if (node.type === primitive) return true;
  return (node.children ?? []).some((child) => containsPrimitive(child, primitive));
}
```

- [ ] **Step 6: Run validation tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/validateUi.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run TypeScript check**

Run:

```powershell
cd frontend
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/renderer/primitiveManifest.ts frontend/src/renderer/PrimitiveRenderer.tsx frontend/src/harness/runtime/validateUi.ts frontend/src/harness/runtime/__tests__/validateUi.test.ts
git commit -m "feat: validate generated primitive UI"
```

---

### Task 3: Implement Intent Classifier

**Files:**
- Create: `frontend/src/harness/runtime/classifier.ts`
- Modify: `frontend/src/harness/runtime/index.ts`
- Test: `frontend/src/harness/runtime/__tests__/classifier.test.ts`

- [ ] **Step 1: Write classifier tests**

Create `frontend/src/harness/runtime/__tests__/classifier.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { classifyIntent } from "../classifier";
import { fixtureIntent, fixturePage } from "../fixtures";

describe("classifyIntent", () => {
  it("classifies claim verification", () => {
    const result = classifyIntent({
      intent: { ...fixtureIntent, prompt: "CT, is this true?" },
      page: fixturePage,
    });
    expect(result.family).toBe("verify");
    expect(result.target).toBe("claim");
    expect(result.needsWebSearch).toBe(true);
    expect(result.riskLevel).toBe("low");
  });

  it("classifies full-permissions API key creation as high-risk act", () => {
    const result = classifyIntent({
      intent: {
        ...fixtureIntent,
        prompt: "Create a new full-permissions API key",
        selectedText: undefined,
      },
      page: { ...fixturePage, title: "SharkAuth" },
    });
    expect(result.family).toBe("act");
    expect(result.needsDomActions).toBe(true);
    expect(result.needsApproval).toBe(true);
    expect(result.riskLevel).toBe("high");
  });

  it("classifies visual explanation from selected text", () => {
    const result = classifyIntent({
      intent: { ...fixtureIntent, prompt: "Explain this visually" },
      page: fixturePage,
    });
    expect(result.family).toBe("understand");
    expect(result.target).toBe("selection");
  });

  it("classifies reply assistance as respond", () => {
    const result = classifyIntent({
      intent: { ...fixtureIntent, prompt: "What does this mean and what should I say?" },
      page: fixturePage,
    });
    expect(result.family).toBe("respond");
    expect(result.target).toBe("message");
    expect(result.riskLevel).toBe("medium");
  });

  it("returns unknown for vague low-context requests", () => {
    const result = classifyIntent({
      intent: { ...fixtureIntent, prompt: "help", selectedText: undefined },
      page: { ...fixturePage, visibleText: "", selectedText: undefined },
    });
    expect(result.family).toBe("unknown");
    expect(result.confidence).toBeLessThan(0.6);
  });
});
```

- [ ] **Step 2: Run classifier tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/classifier.test.ts
```

Expected: FAIL because `classifier.ts` does not exist.

- [ ] **Step 3: Implement classifier**

Create `frontend/src/harness/runtime/classifier.ts`:

```ts
import type { IntentClassification } from "@/types/harness";
import type { PageContextPacket, UserIntentPacket } from "./contracts";

export type ClassifierInput = {
  intent: UserIntentPacket;
  page: PageContextPacket;
};

export function classifyIntent(input: ClassifierInput): IntentClassification {
  const prompt = normalize(input.intent.prompt);
  const selectedText = input.intent.selectedText || input.page.selectedText;
  const pageText = normalize(input.page.visibleText);

  if (isActPrompt(prompt)) {
    const highRisk = /api key|credential|permission|full[- ]permission|delete|billing|payment|send|post/.test(prompt);
    return {
      family: "act",
      confidence: highRisk ? 0.94 : 0.82,
      target: "workflow",
      needsWebSearch: false,
      needsDomActions: true,
      needsApproval: highRisk,
      riskLevel: highRisk ? "high" : "medium",
    };
  }

  if (isVerifyPrompt(prompt)) {
    return {
      family: "verify",
      confidence: selectedText || pageText ? 0.92 : 0.68,
      target: selectedText ? "claim" : "page",
      needsWebSearch: true,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    };
  }

  if (isUnderstandPrompt(prompt)) {
    return {
      family: "understand",
      confidence: selectedText ? 0.9 : 0.74,
      target: selectedText ? "selection" : "page",
      needsWebSearch: false,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    };
  }

  if (isRespondPrompt(prompt)) {
    return {
      family: "respond",
      confidence: 0.88,
      target: "message",
      needsWebSearch: false,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "medium",
    };
  }

  if (/summari[sz]e|recap|tl;dr|short version/.test(prompt)) {
    return {
      family: "summarize",
      confidence: 0.8,
      target: selectedText ? "selection" : "page",
      needsWebSearch: false,
      needsDomActions: false,
      needsApproval: false,
      riskLevel: "low",
    };
  }

  if (/go to|open|navigate|find the page|click into/.test(prompt)) {
    return {
      family: "navigate",
      confidence: 0.76,
      target: "workflow",
      needsWebSearch: false,
      needsDomActions: true,
      needsApproval: false,
      riskLevel: "medium",
    };
  }

  return {
    family: "unknown",
    confidence: 0.35,
    target: selectedText ? "selection" : "page",
    needsWebSearch: false,
    needsDomActions: false,
    needsApproval: false,
    riskLevel: "low",
  };
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function isVerifyPrompt(prompt: string): boolean {
  return /is this true|true\?|verify|fact[- ]check|claim|source|real\?|legit|confirm/.test(prompt);
}

function isUnderstandPrompt(prompt: string): boolean {
  return /explain|teach|visual|diagram|what is|how does|break down|understand/.test(prompt);
}

function isActPrompt(prompt: string): boolean {
  return /create|make|submit|send|post|delete|update|change|fill|click|do this|api key|permission/.test(prompt);
}

function isRespondPrompt(prompt: string): boolean {
  return /what should i say|reply|respond|answer|draft|tone|message mean|what does this mean/.test(prompt);
}
```

- [ ] **Step 4: Export classifier**

Modify `frontend/src/harness/runtime/index.ts`:

```ts
export * from "./contracts";
export * from "./session";
export * from "./policy";
export * from "./validateUi";
export * from "./classifier";
```

- [ ] **Step 5: Run classifier tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/classifier.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add frontend/src/harness/runtime/classifier.ts frontend/src/harness/runtime/index.ts frontend/src/harness/runtime/__tests__/classifier.test.ts
git commit -m "feat: classify clickthrough intents"
```

---

### Task 4: Implement Style Planner And Declarative UI Planner

**Files:**
- Create: `frontend/src/harness/runtime/stylePlanner.ts`
- Create: `frontend/src/harness/runtime/planner.ts`
- Modify: `frontend/src/harness/runtime/index.ts`
- Test: `frontend/src/harness/runtime/__tests__/stylePlanner.test.ts`
- Test: `frontend/src/harness/runtime/__tests__/planner.test.ts`

- [ ] **Step 1: Write style planner tests**

Create `frontend/src/harness/runtime/__tests__/stylePlanner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixturePage, fixtureVerifyClassification } from "../fixtures";
import { createPrimordialStyleBrief } from "../stylePlanner";

describe("createPrimordialStyleBrief", () => {
  it("creates an evidence-dashboard brief for verify", () => {
    const brief = createPrimordialStyleBrief({
      classification: fixtureVerifyClassification,
      prompt: "CT, is this true?",
      page: fixturePage,
    });
    expect(brief.interfaceArchetype).toBe("anchored evidence dashboard");
    expect(brief.anchorStrategy).toContain("selected");
    expect(brief.priorityOrder).toContain("verdict");
    expect(brief.avoid).toContain("chat transcript");
  });

  it("creates an action-surface brief for high-risk action", () => {
    const brief = createPrimordialStyleBrief({
      classification: {
        family: "act",
        confidence: 0.94,
        target: "workflow",
        needsWebSearch: false,
        needsDomActions: true,
        needsApproval: true,
        riskLevel: "high",
      },
      prompt: "Create a full permissions API key",
      page: fixturePage,
    });
    expect(brief.interfaceArchetype).toBe("approval-first action surface");
    expect(brief.hostAdaptation).toBe("ct_controlled");
    expect(brief.priorityOrder[0]).toBe("risk");
  });
});
```

- [ ] **Step 2: Write planner tests**

Create `frontend/src/harness/runtime/__tests__/planner.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixtureIntent, fixturePage, fixtureVerifyClassification } from "../fixtures";
import { createPrimordialStyleBrief } from "../stylePlanner";
import { createRunPlan, createInitialGeneratedUi } from "../planner";

describe("planner", () => {
  it("plans web tools and evidence UI for verify", () => {
    const styleBrief = createPrimordialStyleBrief({
      classification: fixtureVerifyClassification,
      prompt: fixtureIntent.prompt,
      page: fixturePage,
    });
    const plan = createRunPlan({
      input: { runId: "run-1", sessionId: "session-1", intent: fixtureIntent, page: fixturePage },
      classification: fixtureVerifyClassification,
      styleBrief,
    });
    expect(plan.uiMode).toBe("anchored_popover");
    expect(plan.toolCalls.map((call) => call.name)).toContain("web.search");
  });

  it("creates initial generated UI with surface, style brief, root, and safety", () => {
    const styleBrief = createPrimordialStyleBrief({
      classification: fixtureVerifyClassification,
      prompt: fixtureIntent.prompt,
      page: fixturePage,
    });
    const plan = createRunPlan({
      input: { runId: "run-1", sessionId: "session-1", intent: fixtureIntent, page: fixturePage },
      classification: fixtureVerifyClassification,
      styleBrief,
    });
    const ui = createInitialGeneratedUi({ plan, input: { runId: "run-1", sessionId: "session-1", intent: fixtureIntent, page: fixturePage }, styleBrief });
    expect(ui.surface?.intent).toBe("verify");
    expect(ui.root.type).toBe("OverlayRoot");
    expect(ui.safety.requiresApproval).toBe(false);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/stylePlanner.test.ts src/harness/runtime/__tests__/planner.test.ts
```

Expected: FAIL because planner modules do not exist.

- [ ] **Step 4: Implement style planner**

Create `frontend/src/harness/runtime/stylePlanner.ts`:

```ts
import type { IntentClassification } from "@/types/harness";
import type { PrimordialStyleBrief } from "@/types/ui";
import type { PageContextPacket } from "./contracts";

export type StylePlannerInput = {
  classification: IntentClassification;
  prompt: string;
  page: PageContextPacket;
};

export function createPrimordialStyleBrief(input: StylePlannerInput): PrimordialStyleBrief {
  const hasSelection = Boolean(input.page.selectedText);

  if (input.classification.family === "act") {
    return {
      intent: "act",
      interfaceArchetype: input.classification.needsApproval
        ? "approval-first action surface"
        : "compact action surface",
      anchorStrategy: "start from the closest actionable page affordance, then expand into a controlled panel",
      layoutBias: "risk summary above editable action plan, approval gate before execution log",
      visualTone: "precise and controlled",
      density: "comfortable",
      hostAdaptation: input.classification.needsApproval ? "ct_controlled" : "blend",
      motionHint: "progressive",
      priorityOrder: ["risk", "action", "approval", "verification"],
      avoid: ["auto-execution", "hidden permission changes", "chat transcript", "generic form"],
    };
  }

  if (input.classification.family === "understand") {
    return {
      intent: "understand",
      interfaceArchetype: "visual explainer",
      anchorStrategy: hasSelection
        ? "start from selected text and keep the quote visible"
        : "start from the visible reading region",
      layoutBias: "diagram first with stepper controls and a short quote",
      visualTone: "clear and instructional",
      density: "comfortable",
      hostAdaptation: "blend",
      motionHint: "progressive",
      priorityOrder: ["explanation", "source", "action"],
      avoid: ["long paragraph wall", "decorative diagram", "unlabeled arrows"],
    };
  }

  if (input.classification.family === "respond") {
    return {
      intent: "respond",
      interfaceArchetype: "private response assistant",
      anchorStrategy: hasSelection
        ? "start from selected message and keep reply controls private"
        : "start from the focused conversation region",
      layoutBias: "small anchored helper with private explanation and editable drafts",
      visualTone: "quiet and respectful",
      density: "compact",
      hostAdaptation: "blend",
      motionHint: "subtle",
      priorityOrder: ["explanation", "reply", "risk"],
      avoid: ["auto-send", "judgmental language", "public insertion without approval"],
    };
  }

  if (input.classification.family === "verify") {
    return {
      intent: "verify",
      interfaceArchetype: "anchored evidence dashboard",
      anchorStrategy: hasSelection
        ? "start from the selected claim and preserve the source in view"
        : "start from the visible claim-like page region",
      layoutBias: "compact sectioned popover with source trail and verdict visible without scrolling",
      visualTone: "skeptical but calm",
      density: "compact",
      hostAdaptation: "blend",
      motionHint: "progressive",
      priorityOrder: ["claim", "search progress", "source quality", "contradiction", "verdict"],
      avoid: ["chat transcript", "generic card grid", "decorative imagery", "certainty without evidence"],
    };
  }

  return {
    intent: input.classification.family,
    interfaceArchetype: "anchored clarification prompt",
    anchorStrategy: hasSelection ? "start from selected text" : "start from current viewport center",
    layoutBias: "single question with two or three concrete choices",
    visualTone: "neutral and brief",
    density: "compact",
    hostAdaptation: "blend",
    motionHint: "subtle",
    priorityOrder: ["explanation", "action"],
    avoid: ["large dashboard", "unnecessary explanation", "unrelated suggestions"],
  };
}
```

- [ ] **Step 5: Implement planner**

Create `frontend/src/harness/runtime/planner.ts`:

```ts
import type {
  AgentPlan,
  BrowserActionPlan,
  IntentClassification,
  PlannedToolCall,
  RiskItem,
} from "@/types/harness";
import type { ClickthroughNode } from "@/types/primitives";
import type { GeneratedUI, PrimordialStyleBrief } from "@/types/ui";
import type { HarnessRunInput, ToolResultSummary } from "./contracts";

export type CreateRunPlanInput = {
  input: HarnessRunInput;
  classification: IntentClassification;
  styleBrief: PrimordialStyleBrief;
};

export type CreateGeneratedUiInput = {
  input: HarnessRunInput;
  plan: AgentPlan;
  styleBrief: PrimordialStyleBrief;
  toolResults?: ToolResultSummary[];
};

export function createRunPlan(args: CreateRunPlanInput): AgentPlan {
  const toolCalls = createToolCalls(args);
  const actionPlan = args.classification.family === "act" ? createActionPlan(args.input) : undefined;
  const risks = createRisks(args.classification);

  return {
    goal: args.input.intent.prompt,
    intent: args.classification,
    uiMode: selectOverlayMode(args.classification),
    toolCalls,
    actionPlan,
    expectedResult: expectedResultFor(args.classification),
    risks,
  };
}

export function createInitialGeneratedUi(args: CreateGeneratedUiInput): GeneratedUI {
  const root = rootFor(args);

  return {
    overlayMode: args.plan.uiMode,
    styleBrief: args.styleBrief,
    surface: {
      intent: args.plan.intent.family === "unknown" ? "mixed" : args.plan.intent.family,
      purpose: args.plan.expectedResult,
      anchor: {
        source: args.input.page.selectedText ? "selection" : args.input.intent.anchorElementId ? "focused_element" : "viewport",
        elementId: args.input.intent.anchorElementId,
        textQuote: args.input.page.selectedText,
        fallbackMode: args.plan.uiMode,
      },
      layout: {
        pattern: layoutPatternFor(args.plan.intent.family),
        density: args.styleBrief.density,
        hierarchy: args.plan.intent.family === "understand" ? "stepped" : "sectioned",
        maxAttention: args.plan.intent.riskLevel === "high" ? "high" : "medium",
      },
      style: {
        hostFit: args.styleBrief.hostAdaptation,
        tone: args.plan.intent.riskLevel === "high" ? "warning" : "neutral",
        emphasis: args.plan.intent.riskLevel === "high" ? "strong" : "balanced",
        motion: args.styleBrief.motionHint,
        visualPriority: normalizePriority(args.styleBrief.priorityOrder),
      },
      interaction: {
        requiresApproval: args.plan.intent.needsApproval,
        canMinimize: true,
        canDismiss: !args.plan.intent.needsApproval,
        followUpMode: "anchored",
      },
    },
    root,
    dataModel: {
      prompt: args.input.intent.prompt,
      selectedText: args.input.page.selectedText,
      toolResults: args.toolResults ?? [],
      actionPlan: args.plan.actionPlan,
      risks: args.plan.risks,
    },
    requiredActions: args.plan.actionPlan
      ? [{ actionId: args.plan.actionPlan.id, label: args.plan.actionPlan.goal, risk: args.plan.intent.riskLevel }]
      : undefined,
    safety: {
      riskLevel: args.plan.intent.riskLevel,
      requiresApproval: args.plan.intent.needsApproval,
      hasSensitiveContext: args.plan.intent.family === "respond" || args.plan.intent.riskLevel === "high",
      uncertaintyNotes: args.plan.intent.family === "verify" ? ["Evidence may be incomplete."] : undefined,
      guardPrimitives: args.plan.intent.needsApproval ? ["ApprovalGate"] : undefined,
    },
    hostTheme: args.input.page.hostTheme,
  };
}

function createToolCalls(args: CreateRunPlanInput): PlannedToolCall[] {
  const calls: PlannedToolCall[] = [];
  if (args.classification.needsDomActions) {
    calls.push({ name: "dom.scan", input: { reason: args.classification.family } });
  }
  if (args.classification.needsWebSearch) {
    calls.push({
      name: "web.search",
      input: {
        query: args.input.page.selectedText || args.input.intent.prompt,
        mode: "verify",
        count: 4,
        includeHighlights: true,
        includeImages: true,
      },
    });
  }
  return calls;
}

function createActionPlan(input: HarnessRunInput): BrowserActionPlan {
  const newKey = input.page.capabilityMap.find((capability) =>
    /new|create|api key|key/i.test(capability.label)
  );
  return {
    id: `action-${input.runId}`,
    goal: input.intent.prompt,
    steps: [
      { kind: "click", elementId: newKey?.elementIds[0] ?? "missing-action-target" },
      { kind: "verify", assertion: "Requested action completed visibly on the page" },
    ],
  };
}

function createRisks(classification: IntentClassification): RiskItem[] {
  if (classification.riskLevel === "high") {
    return [{ label: "High-risk browser action requires approval", level: "high" }];
  }
  if (classification.family === "verify") {
    return [{ label: "Public web evidence may be incomplete", level: "medium" }];
  }
  return [];
}

function selectOverlayMode(classification: IntentClassification): AgentPlan["uiMode"] {
  if (classification.family === "act") return "side_panel";
  if (classification.family === "understand") return "side_panel";
  if (classification.family === "verify") return "anchored_popover";
  if (classification.family === "respond") return "anchored_popover";
  return "anchored_popover";
}

function expectedResultFor(classification: IntentClassification): string {
  if (classification.family === "verify") return "A source-grounded verdict with uncertainty.";
  if (classification.family === "understand") return "A visual explanation grounded in the selected content.";
  if (classification.family === "act") return "An approved action is executed and verified.";
  if (classification.family === "respond") return "Private context and editable reply drafts.";
  return "A clarification prompt that helps the user choose the next step.";
}

function layoutPatternFor(family: IntentClassification["family"]): GeneratedUI["surface"]["layout"]["pattern"] {
  if (family === "verify") return "evidence_dashboard";
  if (family === "understand") return "visual_explainer";
  if (family === "act") return "action_surface";
  if (family === "respond") return "response_assistant";
  return "anchored_card";
}

function normalizePriority(priorityOrder: string[]): NonNullable<GeneratedUI["surface"]>["style"]["visualPriority"] {
  const allowed = new Set(["source", "claim", "verdict", "risk", "action", "explanation", "reply"]);
  return priorityOrder.filter((item) => allowed.has(item)) as NonNullable<GeneratedUI["surface"]>["style"]["visualPriority"];
}

function rootFor(args: CreateGeneratedUiInput): ClickthroughNode {
  if (args.plan.intent.family === "act") {
    return {
      type: "OverlayRoot",
      props: { id: args.input.runId, intent: "act", mode: "panel" },
      children: [
        { type: "CTMark", props: { variant: "badge", status: "warning" } },
        {
          type: "Panel",
          props: { title: "Action plan", tone: "warning", chrome: "standard" },
          children: [
            {
              type: "StepList",
              props: {
                goal: args.plan.goal,
                steps: args.plan.actionPlan?.steps.map((step) => ({ label: step.kind, status: "pending" })) ?? [],
                riskLevel: "high",
                requiresApproval: true,
              },
            },
            { type: "RiskSummary", props: { riskLevel: "high", items: args.plan.risks } },
            {
              type: "ApprovalGate",
              props: {
                title: "Approve action?",
                summary: args.plan.goal,
                risks: args.plan.risks,
                approveLabel: "Approve",
                cancelLabel: "Cancel",
                approvalActionId: args.plan.actionPlan?.id,
              },
            },
          ],
        },
      ],
    };
  }

  if (args.plan.intent.family === "understand") {
    return {
      type: "OverlayRoot",
      props: { id: args.input.runId, intent: "understand", mode: "panel" },
      children: [
        { type: "AnchorHighlight", props: { label: "Selected text", tone: "info" } },
        {
          type: "Panel",
          props: { title: "Visual explanation", tone: "info" },
          children: [
            { type: "InlineQuote", props: { quote: args.input.page.selectedText || args.input.page.visibleText.slice(0, 180) } },
            { type: "Skeleton", props: { shape: "diagram", count: 1 } },
            { type: "ProgressList", props: { items: [{ label: "Building explanation", state: "running" }] } },
          ],
        },
      ],
    };
  }

  if (args.plan.intent.family === "respond") {
    return {
      type: "OverlayRoot",
      props: { id: args.input.runId, intent: "respond", mode: "popover" },
      children: [
        {
          type: "Panel",
          props: { title: "Private response helper", chrome: "minimal" },
          children: [
            { type: "PrivateModeBadge", props: { label: "Private until you choose otherwise" } },
            { type: "BodyText", props: { children: "Drafting a careful response.", tone: "muted" } },
            { type: "TextArea", props: { label: "Draft", value: "", rows: 4 } },
          ],
        },
      ],
    };
  }

  if (args.plan.intent.family === "verify") {
    return {
      type: "OverlayRoot",
      props: { id: args.input.runId, intent: "verify", mode: "popover" },
      children: [
        { type: "AnchorHighlight", props: { label: "Claim", tone: "warning" } },
        {
          type: "Panel",
          props: { title: "Checking claim", tone: "warning", chrome: "standard" },
          children: [
            { type: "ProgressList", props: { items: [{ label: "Searching sources", state: "running" }] } },
            { type: "Skeleton", props: { shape: "card", count: 2 } },
            { type: "UncertaintyNote", props: { reason: "Verdict pending source checks." } },
          ],
        },
      ],
    };
  }

  return {
    type: "OverlayRoot",
    props: { id: args.input.runId, intent: "mixed", mode: "popover" },
    children: [
      {
        type: "Panel",
        props: { title: "What should Clickthrough do?" },
        children: [
          {
            type: "ClarificationPrompt",
            props: {
              question: "I need a little more direction.",
              options: [
                { label: "Verify this", value: "verify" },
                { label: "Explain this", value: "understand" },
                { label: "Act here", value: "act" },
              ],
            },
          },
        ],
      },
    ],
  };
}
```

- [ ] **Step 6: Export modules**

Modify `frontend/src/harness/runtime/index.ts`:

```ts
export * from "./contracts";
export * from "./session";
export * from "./policy";
export * from "./validateUi";
export * from "./classifier";
export * from "./stylePlanner";
export * from "./planner";
```

- [ ] **Step 7: Run planner tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/stylePlanner.test.ts src/harness/runtime/__tests__/planner.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/harness/runtime/stylePlanner.ts frontend/src/harness/runtime/planner.ts frontend/src/harness/runtime/index.ts frontend/src/harness/runtime/__tests__/stylePlanner.test.ts frontend/src/harness/runtime/__tests__/planner.test.ts
git commit -m "feat: plan declarative harness UI"
```

---

### Task 5: Add Tool Registry And Web Tool Boundary

**Files:**
- Create: `frontend/src/harness/runtime/tools/registry.ts`
- Create: `frontend/src/harness/runtime/tools/web.ts`
- Create: `frontend/src/harness/runtime/tools/dom.ts`
- Create: `frontend/src/harness/runtime/tools/index.ts`
- Modify: `frontend/src/harness/runtime/contracts.ts`
- Modify: `frontend/src/harness/runtime/index.ts`
- Test: `frontend/src/harness/runtime/__tests__/tools.test.ts`

- [ ] **Step 1: Write tool tests**

Create `frontend/src/harness/runtime/__tests__/tools.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixturePage, fixtureWebSearchOutput } from "../fixtures";
import { createDefaultTools, executeToolCall } from "../tools";

describe("runtime tools", () => {
  it("runs cached web.search through provider-neutral output", async () => {
    const tools = createDefaultTools({
      webSearch: async () => fixtureWebSearchOutput,
    });
    const result = await executeToolCall(
      tools,
      { name: "web.search", input: { query: "Amazon intern", mode: "verify" } },
      { runId: "run-1", sessionId: "session-1", intent: {
        prompt: "is this true",
        inputMode: "text",
        pageUrl: fixturePage.url,
        pageTitle: fixturePage.title,
        timestamp: "2026-05-09T20:00:00.000Z",
      }, page: fixturePage }
    );
    expect(result.status).toBe("success");
    expect(result.toolName).toBe("web.search");
    expect(result.summaryForModel).toContain("1 source");
  });

  it("returns failed tool result for unknown tools", async () => {
    const result = await executeToolCall(
      createDefaultTools({}),
      { name: "missing.tool", input: {} },
      { runId: "run-1", sessionId: "session-1", intent: {
        prompt: "noop",
        inputMode: "text",
        pageUrl: fixturePage.url,
        pageTitle: fixturePage.title,
        timestamp: "2026-05-09T20:00:00.000Z",
      }, page: fixturePage }
    );
    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("tool_not_found");
  });
});
```

- [ ] **Step 2: Run tool tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/tools.test.ts
```

Expected: FAIL because tools module does not exist.

- [ ] **Step 3: Add dependency types**

Append to `frontend/src/harness/runtime/contracts.ts`:

```ts
export type RuntimeDependencies = {
  tools?: ToolDefinition[];
  webSearch?: (input: WebSearchInput, context: HarnessRunInput) => Promise<WebSearchOutput>;
  webFetch?: (input: WebFetchInput, context: HarnessRunInput) => Promise<WebFetchOutput>;
  executeActionPlan?: (
    plan: import("@/types/harness").BrowserActionPlan,
    context: HarnessRunInput
  ) => Promise<{ status: "success" | "failed" | "partial"; evidence: string[] }>;
};
```

- [ ] **Step 4: Implement web tools**

Create `frontend/src/harness/runtime/tools/web.ts`:

```ts
import type {
  HarnessRunInput,
  ToolDefinition,
  WebFetchInput,
  WebFetchOutput,
  WebSearchInput,
  WebSearchOutput,
} from "../contracts";

export type WebToolDependencies = {
  webSearch?: (input: WebSearchInput, context: HarnessRunInput) => Promise<WebSearchOutput>;
  webFetch?: (input: WebFetchInput, context: HarnessRunInput) => Promise<WebFetchOutput>;
};

export function createWebTools(deps: WebToolDependencies): ToolDefinition[] {
  return [
    {
      name: "web.search",
      description: "Search public web sources and return normalized grounded source results.",
      readOnly: true,
      risk: "low",
      requiresApproval: () => false,
      execute: async (input, context) => {
        const parsed = input as WebSearchInput;
        if (deps.webSearch) return deps.webSearch(parsed, context);
        return fallbackSearch(parsed);
      },
    },
    {
      name: "web.fetch",
      description: "Fetch readable content and media metadata for a known URL.",
      readOnly: true,
      risk: "low",
      requiresApproval: () => false,
      execute: async (input, context) => {
        const parsed = input as WebFetchInput;
        if (deps.webFetch) return deps.webFetch(parsed, context);
        return fallbackFetch(parsed);
      },
    },
  ];
}

function fallbackSearch(input: WebSearchInput): WebSearchOutput {
  const now = new Date().toISOString();
  return {
    query: input.query,
    provider: "fallback",
    retrievedAt: now,
    cacheStatus: "miss",
    sources: [
      {
        id: "fallback-source",
        url: "https://example.com/source-unavailable",
        title: "Search provider unavailable",
        publisher: "Clickthrough fallback",
        retrievedAt: now,
        snippet: "No live web provider is configured. This fallback preserves the evidence UI contract.",
        quality: "unknown",
        freshness: "unknown",
        provider: "fallback",
      },
    ],
    warnings: ["No web provider configured."],
  };
}

function fallbackFetch(input: WebFetchInput): WebFetchOutput {
  return {
    status: "error",
    provider: "fallback",
    retrievedAt: new Date().toISOString(),
    url: input.url,
    error: {
      code: "provider_unavailable",
      message: "No web fetch provider is configured.",
      retryable: false,
    },
  };
}
```

- [ ] **Step 5: Implement DOM tool wrapper**

Create `frontend/src/harness/runtime/tools/dom.ts`:

```ts
import type { HarnessRunInput, ToolDefinition } from "../contracts";

export function createDomTools(): ToolDefinition[] {
  return [
    {
      name: "dom.scan",
      description: "Return the current compact page context packet already supplied by the page bridge.",
      readOnly: true,
      risk: "low",
      requiresApproval: () => false,
      execute: async (_input: unknown, context: HarnessRunInput) => context.page,
    },
    {
      name: "dom.highlight",
      description: "Request a visual highlight of a known page element.",
      readOnly: true,
      risk: "low",
      requiresApproval: () => false,
      execute: async (input: unknown) => ({
        status: "queued",
        input,
      }),
    },
  ];
}
```

- [ ] **Step 6: Implement registry**

Create `frontend/src/harness/runtime/tools/registry.ts`:

```ts
import type { PlannedToolCall, ToolResult } from "@/types/harness";
import type { HarnessRunInput, RuntimeDependencies, ToolDefinition } from "../contracts";
import { createDomTools } from "./dom";
import { createWebTools } from "./web";

export function createDefaultTools(deps: RuntimeDependencies): ToolDefinition[] {
  return [
    ...createDomTools(),
    ...createWebTools(deps),
    ...(deps.tools ?? []),
  ];
}

export async function executeToolCall(
  tools: ToolDefinition[],
  call: PlannedToolCall,
  context: HarnessRunInput
): Promise<ToolResult> {
  const tool = tools.find((candidate) => candidate.name === call.name);
  if (!tool) {
    return {
      callId: createCallId(call.name),
      toolName: call.name,
      status: "failed",
      error: {
        code: "tool_not_found",
        message: `Tool not registered: ${call.name}`,
        recoverable: true,
      },
      summaryForModel: `Tool not registered: ${call.name}`,
    };
  }

  const callId = createCallId(call.name);

  try {
    const output = await tool.execute(call.input, context);
    return {
      callId,
      toolName: tool.name,
      status: "success",
      output,
      summaryForModel: summarizeToolOutput(tool.name, output),
      evidence: evidenceFromOutput(output),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      callId,
      toolName: tool.name,
      status: "failed",
      error: { code: "tool_error", message, recoverable: true },
      summaryForModel: `${tool.name} failed: ${message}`,
    };
  }
}

function createCallId(toolName: string): string {
  return `${toolName}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function summarizeToolOutput(toolName: string, output: unknown): string {
  if (toolName === "web.search" && isRecord(output) && Array.isArray(output.sources)) {
    return `web.search returned ${output.sources.length} source${output.sources.length === 1 ? "" : "s"}.`;
  }
  if (toolName === "web.fetch" && isRecord(output) && output.status === "error") {
    return `web.fetch failed: ${isRecord(output.error) ? output.error.message : "unknown error"}`;
  }
  if (toolName === "dom.scan") {
    return "dom.scan returned current page context.";
  }
  return `${toolName} completed.`;
}

function evidenceFromOutput(output: unknown): string[] {
  if (isRecord(output) && Array.isArray(output.sources)) {
    return output.sources
      .filter(isRecord)
      .map((source) => String(source.url ?? source.title ?? "source"));
  }
  return [];
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}
```

- [ ] **Step 7: Create tool barrel**

Create `frontend/src/harness/runtime/tools/index.ts`:

```ts
export * from "./dom";
export * from "./registry";
export * from "./web";
```

- [ ] **Step 8: Export tools**

Modify `frontend/src/harness/runtime/index.ts`:

```ts
export * from "./contracts";
export * from "./session";
export * from "./policy";
export * from "./validateUi";
export * from "./classifier";
export * from "./stylePlanner";
export * from "./planner";
export * from "./tools";
```

- [ ] **Step 9: Run tool tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/tools.test.ts
```

Expected: PASS.

- [ ] **Step 10: Commit**

```powershell
git add frontend/src/harness/runtime/contracts.ts frontend/src/harness/runtime/tools frontend/src/harness/runtime/index.ts frontend/src/harness/runtime/__tests__/tools.test.ts
git commit -m "feat: add harness tool registry"
```

---

### Task 6: Implement Functional Session Loop For Read-Only Runs

**Files:**
- Modify: `frontend/src/harness/runtime/session.ts`
- Test: `frontend/src/harness/runtime/__tests__/session.test.ts`

- [ ] **Step 1: Write session test for verify run**

Create `frontend/src/harness/runtime/__tests__/session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixtureIntent, fixturePage, fixtureWebSearchOutput } from "../fixtures";
import { createLocalHarnessSession } from "../session";

async function collectUntilResult(session: ReturnType<typeof createLocalHarnessSession>) {
  const events = [];
  for await (const event of session.events()) {
    events.push(event);
    if (event.type === "result") break;
  }
  return events;
}

describe("LocalHarnessSession", () => {
  it("streams a functional verify run with state, UI, tool progress, and result", async () => {
    const session = createLocalHarnessSession("session-test", {
      webSearch: async () => fixtureWebSearchOutput,
    });

    const eventsPromise = collectUntilResult(session);
    await session.streamInput({ type: "user.message", intent: fixtureIntent, page: fixturePage });
    const events = await eventsPromise;
    session.close();

    expect(events.map((event) => event.type)).toContain("ui.patch");
    expect(events.map((event) => event.type)).toContain("tool.started");
    expect(events.map((event) => event.type)).toContain("tool.finished");
    expect(events.at(-1)).toMatchObject({ type: "result", result: { status: "success" } });
    expect(events.filter((event) => event.type === "state.changed").map((event) => event.state)).toEqual(
      expect.arrayContaining(["receiving_intent", "classifying_intent", "planning", "generating_ui", "running_tools", "completed"])
    );
  });
});
```

- [ ] **Step 2: Run session test to verify it fails**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/session.test.ts
```

Expected: FAIL because session does not accept dependencies and stops at `planning`.

- [ ] **Step 3: Replace session implementation**

Replace `frontend/src/harness/runtime/session.ts` with:

```ts
import type { HarnessEvent, ToolResult } from "@/types/harness";
import type {
  HarnessRunInput,
  HarnessSession,
  HarnessSessionInput,
  RuntimeDependencies,
} from "./contracts";
import { classifyIntent } from "./classifier";
import { createInitialGeneratedUi, createRunPlan } from "./planner";
import { createPrimordialStyleBrief } from "./stylePlanner";
import { createDefaultTools, executeToolCall } from "./tools";
import { validateGeneratedUi } from "./validateUi";
import { verifyToolOnlyRun } from "./verification";

type EventQueueItem =
  | { done: false; event: HarnessEvent }
  | { done: true; event?: never };

const DEFAULT_DELAY_MS = 30;

export class LocalHarnessSession implements HarnessSession {
  readonly id: string;

  private queue: EventQueueItem[] = [];
  private waiters: Array<(item: EventQueueItem) => void> = [];
  private closed = false;
  private cancelled = false;
  private deps: RuntimeDependencies;

  constructor(id: string, deps: RuntimeDependencies = {}) {
    this.id = id;
    this.deps = deps;
  }

  async streamInput(input: HarnessSessionInput): Promise<void> {
    if (this.closed) return;

    if (input.type === "interrupt") {
      this.cancelled = input.action === "cancel";
      this.emit({
        type: "state.changed",
        state: input.action === "cancel" ? "cancelled" : "waiting_for_user",
        message: `Run ${input.action} requested.`,
      });
      return;
    }

    if (input.type === "approval.resolved") {
      this.emit({ type: "approval.resolved", decision: input.decision });
      return;
    }

    await this.runOnce({
      runId: createId("run"),
      sessionId: this.id,
      intent: input.intent,
      page: input.page,
    });
  }

  async *events(): AsyncIterable<HarnessEvent> {
    while (!this.closed || this.queue.length > 0) {
      const item = await this.nextQueueItem();
      if (item.done) return;
      yield item.event;
    }
  }

  interrupt(): void {
    this.cancelled = true;
    this.emit({
      type: "state.changed",
      state: "cancelled",
      message: "Run cancelled by user.",
    });
  }

  close(): void {
    this.closed = true;
    this.flushDone();
  }

  private async runOnce(input: HarnessRunInput): Promise<void> {
    this.cancelled = false;
    const toolResults: ToolResult[] = [];

    try {
      this.state("receiving_intent", input.intent.prompt);
      await delay(DEFAULT_DELAY_MS);
      this.stopIfCancelled();

      this.state("observing_page", input.page.title);
      await delay(DEFAULT_DELAY_MS);
      this.stopIfCancelled();

      this.state("classifying_intent", "Classifying intent.");
      const classification = classifyIntent({ intent: input.intent, page: input.page });
      await delay(DEFAULT_DELAY_MS);
      this.stopIfCancelled();

      this.state("planning", "Planning tools and UI.");
      const styleBrief = createPrimordialStyleBrief({
        classification,
        prompt: input.intent.prompt,
        page: input.page,
      });
      const plan = createRunPlan({ input, classification, styleBrief });
      await delay(DEFAULT_DELAY_MS);
      this.stopIfCancelled();

      this.state("generating_ui", "Generating initial interface.");
      const initialUi = createInitialGeneratedUi({ input, plan, styleBrief });
      const validation = validateGeneratedUi(initialUi);
      if (!validation.valid) {
        this.emit({
          type: "result",
          result: {
            status: "failed",
            summary: validation.errors.join("; "),
            stopReason: "schema_validation_failed",
          },
        });
        return;
      }
      this.emit({ type: "ui.patch", patch: { op: "replace", path: "", value: initialUi.root } });
      await delay(DEFAULT_DELAY_MS);

      const tools = createDefaultTools(this.deps);
      if (plan.toolCalls.length > 0) {
        this.state("running_tools", `Running ${plan.toolCalls.length} tool call${plan.toolCalls.length === 1 ? "" : "s"}.`);
      }
      for (const call of plan.toolCalls) {
        this.stopIfCancelled();
        const callId = createId(call.name);
        this.emit({ type: "tool.started", call: { callId, toolName: call.name, input: call.input } });
        const result = await executeToolCall(tools, call, input);
        toolResults.push(result);
        this.emit({
          type: "tool.finished",
          result: {
            callId: result.callId,
            toolName: result.toolName,
            status: result.status,
            summaryForModel: result.summaryForModel,
          },
        });
      }

      this.state("generating_ui", "Updating interface from tool results.");
      const updatedUi = createInitialGeneratedUi({ input, plan, styleBrief, toolResults });
      this.emit({ type: "ui.patch", patch: { op: "replace", path: "", value: updatedUi.root } });

      this.state("verifying", "Verifying result.");
      const verification = verifyToolOnlyRun(plan, toolResults);
      this.state(verification.status === "success" ? "completed" : "failed", verification.summary);
      this.emit({
        type: "result",
        result: {
          status: verification.status === "success" ? "success" : "partial",
          summary: verification.summary,
          stopReason: verification.status === "success" ? "success" : "verification_failed",
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.state(this.cancelled ? "cancelled" : "failed", message);
      this.emit({
        type: "result",
        result: {
          status: this.cancelled ? "cancelled" : "failed",
          summary: message,
          stopReason: this.cancelled ? "cancelled_by_user" : "tool_error",
        },
      });
    }
  }

  private state(state: HarnessEvent & { type: "state.changed" }["state"], message?: string): void {
    this.emit({ type: "state.changed", state, message });
  }

  private stopIfCancelled(): void {
    if (this.cancelled) {
      throw new Error("Run cancelled by user.");
    }
  }

  private emit(event: HarnessEvent): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter({ done: false, event });
      return;
    }
    this.queue.push({ done: false, event });
  }

  private nextQueueItem(): Promise<EventQueueItem> {
    const item = this.queue.shift();
    if (item) return Promise.resolve(item);
    if (this.closed) return Promise.resolve({ done: true });
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  private flushDone(): void {
    for (const waiter of this.waiters.splice(0)) {
      waiter({ done: true });
    }
  }
}

export function createLocalHarnessSession(
  sessionId = createId("session"),
  deps: RuntimeDependencies = {}
): HarnessSession {
  return new LocalHarnessSession(sessionId, deps);
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

- [ ] **Step 4: Add verification helper required by session**

Create `frontend/src/harness/runtime/verification.ts`:

```ts
import type { AgentPlan, ToolResult, VerificationResult } from "@/types/harness";

export function verifyToolOnlyRun(plan: AgentPlan, toolResults: ToolResult[]): VerificationResult {
  const failed = toolResults.filter((result) => result.status !== "success");
  if (failed.length > 0) {
    return {
      status: "partial",
      summary: `${failed.length} tool call${failed.length === 1 ? "" : "s"} failed while pursuing: ${plan.expectedResult}`,
      evidence: toolResults.flatMap((result) => result.evidence ?? []),
    };
  }

  return {
    status: "success",
    summary: plan.expectedResult,
    evidence: toolResults.flatMap((result) => result.evidence ?? []),
  };
}
```

- [ ] **Step 5: Fix session state type if TypeScript reports an error**

If `state` helper typing fails, replace the helper signature in `session.ts` with:

```ts
  private state(state: import("@/types/harness").HarnessState, message?: string): void {
    this.emit({ type: "state.changed", state, message });
  }
```

- [ ] **Step 6: Run session test**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/session.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run all runtime tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add frontend/src/harness/runtime/session.ts frontend/src/harness/runtime/verification.ts frontend/src/harness/runtime/__tests__/session.test.ts
git commit -m "feat: run functional harness sessions"
```

---

### Task 7: Add Approval Wait/Resume And Action Verification

**Files:**
- Modify: `frontend/src/harness/runtime/session.ts`
- Modify: `frontend/src/harness/runtime/verification.ts`
- Test: `frontend/src/harness/runtime/__tests__/approval.test.ts`

- [ ] **Step 1: Write approval tests**

Create `frontend/src/harness/runtime/__tests__/approval.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixtureIntent, fixturePage } from "../fixtures";
import { createLocalHarnessSession } from "../session";

async function collectUntil(session: ReturnType<typeof createLocalHarnessSession>, predicate: (event: any) => boolean) {
  const events = [];
  for await (const event of session.events()) {
    events.push(event);
    if (predicate(event)) break;
  }
  return events;
}

describe("approval flow", () => {
  it("blocks high-risk action until approval is received", async () => {
    const session = createLocalHarnessSession("approval-session", {
      executeActionPlan: async () => ({ status: "success", evidence: ["visible:key-created"] }),
    });
    const actionIntent = {
      ...fixtureIntent,
      prompt: "Create a full-permissions API key",
      selectedText: undefined,
    };

    const approvalEventsPromise = collectUntil(session, (event) => event.type === "approval.requested");
    await session.streamInput({ type: "user.message", intent: actionIntent, page: fixturePage });
    const approvalEvents = await approvalEventsPromise;
    const approval = approvalEvents.find((event) => event.type === "approval.requested");

    expect(approval).toBeDefined();

    const resultEventsPromise = collectUntil(session, (event) => event.type === "result");
    await session.streamInput({
      type: "approval.resolved",
      decision: { type: "approved", requestId: approval.request.id },
    });
    const resultEvents = await resultEventsPromise;
    session.close();

    expect(resultEvents.at(-1)).toMatchObject({ type: "result", result: { status: "success" } });
  });

  it("stops high-risk action when approval is denied", async () => {
    const session = createLocalHarnessSession("denied-session");
    const actionIntent = {
      ...fixtureIntent,
      prompt: "Create a full-permissions API key",
      selectedText: undefined,
    };

    const approvalEventsPromise = collectUntil(session, (event) => event.type === "approval.requested");
    await session.streamInput({ type: "user.message", intent: actionIntent, page: fixturePage });
    const approvalEvents = await approvalEventsPromise;
    const approval = approvalEvents.find((event) => event.type === "approval.requested");

    const resultEventsPromise = collectUntil(session, (event) => event.type === "result");
    await session.streamInput({
      type: "approval.resolved",
      decision: { type: "denied", requestId: approval.request.id, reason: "Too risky" },
    });
    const resultEvents = await resultEventsPromise;
    session.close();

    expect(resultEvents.at(-1)).toMatchObject({
      type: "result",
      result: { status: "cancelled", stopReason: "approval_denied" },
    });
  });
});
```

- [ ] **Step 2: Run approval tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/approval.test.ts
```

Expected: FAIL because session currently emits approval resolution but does not pause/resume action runs.

- [ ] **Step 3: Add pending approval state to session**

Modify `LocalHarnessSession` in `frontend/src/harness/runtime/session.ts`:

```ts
  private pendingApproval:
    | {
        requestId: string;
        input: HarnessRunInput;
        plan: import("@/types/harness").AgentPlan;
      }
    | null = null;
```

- [ ] **Step 4: Handle approval decisions in `streamInput`**

Replace the `approval.resolved` branch in `streamInput` with:

```ts
    if (input.type === "approval.resolved") {
      this.emit({ type: "approval.resolved", decision: input.decision });
      if (!this.pendingApproval || input.decision.requestId !== this.pendingApproval.requestId) return;

      const pending = this.pendingApproval;
      this.pendingApproval = null;

      if (input.decision.type !== "approved") {
        this.emit({
          type: "result",
          result: {
            status: "cancelled",
            summary: input.decision.type === "denied" ? input.decision.reason ?? "Approval denied." : input.decision.instruction,
            stopReason: "approval_denied",
          },
        });
        return;
      }

      await this.executeApprovedAction(pending.input, pending.plan);
      return;
    }
```

- [ ] **Step 5: Emit approval request from `runOnce`**

In `runOnce`, after initial UI is emitted and before read-only tool execution returns final result, add:

```ts
      if (plan.intent.needsApproval && plan.actionPlan) {
        const requestId = `approval-${plan.actionPlan.id}`;
        this.pendingApproval = { requestId, input, plan };
        this.state("awaiting_approval", "Waiting for approval.");
        this.emit({
          type: "approval.requested",
          request: {
            id: requestId,
            title: "Approve Clickthrough action?",
            summary: plan.actionPlan.goal,
            steps: plan.actionPlan.steps.map((step) => step.kind),
            risks: plan.risks,
            actionPlanId: plan.actionPlan.id,
            approveLabel: "Approve",
            cancelLabel: "Cancel",
          },
        });
        return;
      }
```

- [ ] **Step 6: Implement `executeApprovedAction` in session**

Add this method to `LocalHarnessSession`:

```ts
  private async executeApprovedAction(
    input: HarnessRunInput,
    plan: import("@/types/harness").AgentPlan
  ): Promise<void> {
    if (!plan.actionPlan) {
      this.emit({
        type: "result",
        result: {
          status: "failed",
          summary: "No action plan was available after approval.",
          stopReason: "verification_failed",
        },
      });
      return;
    }

    this.state("executing_actions", "Executing approved action.");
    const execution = this.deps.executeActionPlan
      ? await this.deps.executeActionPlan(plan.actionPlan, input)
      : { status: "failed" as const, evidence: ["No action executor configured."] };

    this.state("verifying", "Verifying action result.");
    const status = execution.status === "success" ? "success" : execution.status === "partial" ? "partial" : "failed";
    this.state(status === "success" ? "completed" : "failed", execution.evidence.join("; "));
    this.emit({
      type: "result",
      result: {
        status,
        summary: execution.evidence.join("; ") || "Action finished without visible evidence.",
        stopReason: status === "success" ? "success" : "verification_failed",
      },
    });
  }
```

- [ ] **Step 7: Run approval tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/approval.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run all runtime tests**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add frontend/src/harness/runtime/session.ts frontend/src/harness/runtime/verification.ts frontend/src/harness/runtime/__tests__/approval.test.ts
git commit -m "feat: enforce approval before actions"
```

---

### Task 8: Wire Page Bridge To Harness And Renderer Stream

**Files:**
- Modify: `frontend/src/browser/pageBridge.ts`
- Create: `frontend/src/harness/runtime/runLocalHarness.ts`
- Modify: `frontend/src/renderer/stream/applyHarnessEvent.ts`
- Test: `frontend/src/harness/runtime/__tests__/runLocalHarness.test.ts`

- [ ] **Step 1: Write local runner test**

Create `frontend/src/harness/runtime/__tests__/runLocalHarness.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fixtureIntent, fixturePage, fixtureWebSearchOutput } from "../fixtures";
import { runLocalHarnessOnce } from "../runLocalHarness";

describe("runLocalHarnessOnce", () => {
  it("collects events from a local session", async () => {
    const events = await runLocalHarnessOnce({
      intent: fixtureIntent,
      page: fixturePage,
      deps: { webSearch: async () => fixtureWebSearchOutput },
    });

    expect(events.some((event) => event.type === "ui.patch")).toBe(true);
    expect(events.at(-1)).toMatchObject({ type: "result" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/runLocalHarness.test.ts
```

Expected: FAIL because `runLocalHarness.ts` does not exist.

- [ ] **Step 3: Add user intent packet builder**

Modify `frontend/src/browser/pageBridge.ts`:

```ts
import { scanDom } from "./domScanner";
import { sampleHostTheme } from "./hostTheme";
import type { PageContextPacket, UserIntentPacket } from "@/harness/runtime";

export function buildUserIntentPacket(prompt: string, inputMode: UserIntentPacket["inputMode"] = "hotkey"): UserIntentPacket {
  const selection = window.getSelection()?.toString() || undefined;
  return {
    prompt,
    inputMode,
    selectedText: selection,
    pageUrl: window.location.href,
    pageTitle: document.title || "Untitled page",
    timestamp: new Date().toISOString(),
  };
}

export function buildPageContextPacket(): PageContextPacket {
  const scan = scanDom();

  return {
    url: window.location.href,
    title: document.title || "Untitled page",
    visibleText: scan.visibleText,
    selectedText: scan.selectedText,
    nearbyElements: scan.elements,
    capabilityMap: scan.capabilities,
    hostTheme: sampleHostTheme(),
  };
}
```

- [ ] **Step 4: Add local harness runner**

Create `frontend/src/harness/runtime/runLocalHarness.ts`:

```ts
import type { HarnessEvent } from "@/types/harness";
import type { PageContextPacket, RuntimeDependencies, UserIntentPacket } from "./contracts";
import { createLocalHarnessSession } from "./session";

export type RunLocalHarnessOnceInput = {
  intent: UserIntentPacket;
  page: PageContextPacket;
  deps?: RuntimeDependencies;
};

export async function runLocalHarnessOnce(input: RunLocalHarnessOnceInput): Promise<HarnessEvent[]> {
  const session = createLocalHarnessSession(undefined, input.deps ?? {});
  const events: HarnessEvent[] = [];

  const consume = (async () => {
    for await (const event of session.events()) {
      events.push(event);
      if (event.type === "result") break;
    }
  })();

  await session.streamInput({ type: "user.message", intent: input.intent, page: input.page });
  await consume;
  session.close();

  return events;
}
```

- [ ] **Step 5: Export runner**

Modify `frontend/src/harness/runtime/index.ts`:

```ts
export * from "./contracts";
export * from "./session";
export * from "./policy";
export * from "./validateUi";
export * from "./classifier";
export * from "./stylePlanner";
export * from "./planner";
export * from "./tools";
export * from "./runLocalHarness";
```

- [ ] **Step 6: Harden stream application**

Modify `frontend/src/renderer/stream/applyHarnessEvent.ts` to preserve result and errors:

```ts
import type { HarnessEvent, HarnessResult } from "@/harness/runtime";
import type { ClickthroughNode } from "@/types/primitives";

export type RenderStreamState = {
  tree: ClickthroughNode | null;
  lastEvent: HarnessEvent | null;
  approvalPending: boolean;
  result: HarnessResult | null;
  error: string | null;
};

export const initialRenderStreamState: RenderStreamState = {
  tree: null,
  lastEvent: null,
  approvalPending: false,
  result: null,
  error: null,
};

export function applyHarnessEvent(
  state: RenderStreamState,
  event: HarnessEvent
): RenderStreamState {
  if (event.type === "ui.patch" && (event.patch.path === "" || event.patch.path === "/")) {
    return {
      ...state,
      tree: event.patch.value as ClickthroughNode,
      lastEvent: event,
      error: null,
    };
  }

  if (event.type === "approval.requested") {
    return { ...state, approvalPending: true, lastEvent: event };
  }

  if (event.type === "approval.resolved") {
    return { ...state, approvalPending: false, lastEvent: event };
  }

  if (event.type === "result") {
    return {
      ...state,
      result: event.result,
      error: event.result.status === "failed" ? event.result.summary : null,
      lastEvent: event,
    };
  }

  return { ...state, lastEvent: event };
}
```

- [ ] **Step 7: Run runner test**

Run:

```powershell
cd frontend
npm test -- src/harness/runtime/__tests__/runLocalHarness.test.ts
```

Expected: PASS.

- [ ] **Step 8: Run TypeScript check**

Run:

```powershell
cd frontend
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add frontend/src/browser/pageBridge.ts frontend/src/harness/runtime/runLocalHarness.ts frontend/src/harness/runtime/index.ts frontend/src/renderer/stream/applyHarnessEvent.ts frontend/src/harness/runtime/__tests__/runLocalHarness.test.ts
git commit -m "feat: bridge page context into harness"
```

---

### Task 9: Add Minimal Extension Message-Port Infrastructure

**Files:**
- Create: `frontend/src/extension/shared/messages.ts`
- Create: `frontend/src/extension/background.ts`
- Create: `frontend/src/extension/content.tsx`
- Create: `frontend/src/extension/__tests__/messages.test.ts`
- Create: `frontend/public/manifest.json`
- Modify: `frontend/vite.config.ts`
- Modify: `frontend/package.json`

- [ ] **Step 1: Write message contract tests**

Create `frontend/src/extension/__tests__/messages.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { ExtensionToBackgroundMessage, BackgroundToExtensionMessage } from "../shared/messages";

describe("extension messages", () => {
  it("types a run request and event response", () => {
    const run: ExtensionToBackgroundMessage = {
      type: "ct.run",
      requestId: "req-1",
      prompt: "is this true?",
    };
    const ready: BackgroundToExtensionMessage = {
      type: "ct.ready",
      sessionId: "session-1",
    };
    expect(run.type).toBe("ct.run");
    expect(ready.type).toBe("ct.ready");
  });
});
```

- [ ] **Step 2: Run message tests to verify they fail**

Run:

```powershell
cd frontend
npm test -- src/extension/__tests__/messages.test.ts
```

Expected: FAIL because extension messages do not exist.

- [ ] **Step 3: Create typed messages**

Create `frontend/src/extension/shared/messages.ts`:

```ts
import type { ApprovalDecision, HarnessEvent } from "@/types/harness";

export type ExtensionToBackgroundMessage =
  | { type: "ct.run"; requestId: string; prompt: string }
  | { type: "ct.approval"; requestId: string; decision: ApprovalDecision }
  | { type: "ct.interrupt"; requestId: string; action: "cancel" | "pause" | "resume" };

export type BackgroundToExtensionMessage =
  | { type: "ct.ready"; sessionId: string }
  | { type: "ct.event"; requestId: string; event: HarnessEvent }
  | { type: "ct.error"; requestId: string; message: string };

export const CLICKTHROUGH_PORT = "clickthrough-runtime";
```

- [ ] **Step 4: Add background session adapter**

Create `frontend/src/extension/background.ts`:

```ts
import { createLocalHarnessSession } from "@/harness/runtime";
import type { HarnessSession } from "@/harness/runtime";
import type {
  BackgroundToExtensionMessage,
  ExtensionToBackgroundMessage,
} from "./shared/messages";
import { CLICKTHROUGH_PORT } from "./shared/messages";

const sessions = new Map<string, HarnessSession>();

chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== CLICKTHROUGH_PORT) return;

  const session = createLocalHarnessSession();
  sessions.set(session.id, session);
  post(port, { type: "ct.ready", sessionId: session.id });

  void streamSessionEvents(port, session);

  port.onMessage.addListener((message: ExtensionToBackgroundMessage) => {
    void handleMessage(port, session, message);
  });

  port.onDisconnect.addListener(() => {
    session.close();
    sessions.delete(session.id);
  });
});

async function handleMessage(
  port: chrome.runtime.Port,
  session: HarnessSession,
  message: ExtensionToBackgroundMessage
): Promise<void> {
  try {
    if (message.type === "ct.run") {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab available.");
      await chrome.tabs.sendMessage(tab.id, {
        type: "ct.collect-context",
        requestId: message.requestId,
        prompt: message.prompt,
      });
      return;
    }

    if (message.type === "ct.approval") {
      await session.streamInput({ type: "approval.resolved", decision: message.decision });
      return;
    }

    if (message.type === "ct.interrupt") {
      await session.streamInput({ type: "interrupt", action: message.action });
    }
  } catch (error) {
    post(port, {
      type: "ct.error",
      requestId: message.requestId,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

async function streamSessionEvents(port: chrome.runtime.Port, session: HarnessSession): Promise<void> {
  for await (const event of session.events()) {
    post(port, { type: "ct.event", requestId: "stream", event });
  }
}

function post(port: chrome.runtime.Port, message: BackgroundToExtensionMessage): void {
  port.postMessage(message);
}
```

- [ ] **Step 5: Add content script adapter**

Create `frontend/src/extension/content.tsx`:

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { buildPageContextPacket, buildUserIntentPacket } from "@/browser/pageBridge";
import { createLocalHarnessSession } from "@/harness/runtime";
import { PrimitiveRenderer } from "@/renderer/PrimitiveRenderer";
import { applyHarnessEvent, initialRenderStreamState } from "@/renderer/stream";
import type { BackgroundToExtensionMessage } from "./shared/messages";
import { CLICKTHROUGH_PORT } from "./shared/messages";

const mountId = "clickthrough-extension-root";

function ensureMount(): HTMLElement {
  const existing = document.getElementById(mountId);
  if (existing) return existing;
  const mount = document.createElement("div");
  mount.id = mountId;
  mount.style.position = "fixed";
  mount.style.inset = "0";
  mount.style.pointerEvents = "none";
  mount.style.zIndex = "2147483647";
  document.documentElement.appendChild(mount);
  return mount;
}

function App() {
  const [state, setState] = React.useState(initialRenderStreamState);

  React.useEffect(() => {
    const port = chrome.runtime.connect({ name: CLICKTHROUGH_PORT });
    port.onMessage.addListener((message: BackgroundToExtensionMessage) => {
      if (message.type === "ct.event") {
        setState((current) => applyHarnessEvent(current, message.event));
      }
    });
    return () => port.disconnect();
  }, []);

  React.useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      if (!(event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "k")) return;
      event.preventDefault();
      const prompt = window.prompt("Clickthrough")?.trim();
      if (!prompt) return;

      const session = createLocalHarnessSession();
      void (async () => {
        for await (const harnessEvent of session.events()) {
          setState((current) => applyHarnessEvent(current, harnessEvent));
          if (harnessEvent.type === "result") break;
        }
      })();
      await session.streamInput({
        type: "user.message",
        intent: buildUserIntentPacket(prompt, "hotkey"),
        page: buildPageContextPacket(),
      });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!state.tree) return null;
  return (
    <div style={{ pointerEvents: "auto" }}>
      <PrimitiveRenderer tree={state.tree} />
    </div>
  );
}

createRoot(ensureMount()).render(<App />);
```

This content script intentionally runs the local harness directly for the first milestone. The background port exists as the future transport boundary; after the content-to-background context roundtrip is implemented, the local direct session can be removed.

- [ ] **Step 6: Add MV3 manifest**

Create `frontend/public/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "Clickthrough Dev",
  "version": "0.1.0",
  "description": "Runtime generated UI overlay for the active web page.",
  "permissions": ["activeTab", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "commands": {
    "invoke-clickthrough": {
      "suggested_key": {
        "default": "Ctrl+Shift+K"
      },
      "description": "Invoke Clickthrough"
    }
  }
}
```

- [ ] **Step 7: Update Vite config for extension mode**

Modify `frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const extension = mode === "extension";

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    build: extension
      ? {
          emptyOutDir: true,
          rollupOptions: {
            input: {
              background: path.resolve(__dirname, "src/extension/background.ts"),
              content: path.resolve(__dirname, "src/extension/content.tsx"),
            },
            output: {
              entryFileNames: "[name].js",
              chunkFileNames: "chunks/[name].js",
              assetFileNames: "assets/[name][extname]",
            },
          },
        }
      : undefined,
  };
});
```

- [ ] **Step 8: Add extension build script**

Modify `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:extension": "tsc && vite build --mode extension",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

- [ ] **Step 9: Install Chrome type definitions**

Run:

```powershell
cd frontend
npm install -D @types/chrome
```

Expected: `@types/chrome` appears in `devDependencies`.

- [ ] **Step 10: Run extension message test**

Run:

```powershell
cd frontend
npm test -- src/extension/__tests__/messages.test.ts
```

Expected: PASS.

- [ ] **Step 11: Run extension build**

Run:

```powershell
cd frontend
npm run build:extension
```

Expected: PASS and `frontend/dist/manifest.json`, `frontend/dist/background.js`, and `frontend/dist/content.js` exist.

- [ ] **Step 12: Commit**

```powershell
git add frontend/package.json frontend/package-lock.json frontend/vite.config.ts frontend/public/manifest.json frontend/src/extension
git commit -m "feat: add extension harness adapter"
```

---

### Task 10: Final Contract Verification And Documentation Update

**Files:**
- Modify: `BRIEF.md`
- Modify: `docs/team-kickoff/user-a-harness-runtime.md`
- Modify: `openspec/changes/core-demo-execution-plan/tasks.md`

- [ ] **Step 1: Update User A kickoff with exact implemented modules**

Append this to `docs/team-kickoff/user-a-harness-runtime.md`:

```md
## Implementation Notes

The harness runtime now owns:

- `classifier.ts` for deterministic intent routing
- `stylePlanner.ts` for primordial style briefs
- `planner.ts` for declarative UI and tool/action plans
- `tools/` for provider-neutral tool execution
- `validateUi.ts` for primitive and safety validation
- `session.ts` for async event streaming, approval wait/resume, and result emission
- `runLocalHarness.ts` for one-shot local runs used by tests and demo wiring

Extension infrastructure must stay a transport adapter around these contracts. It must not fork classification, planning, policy, or validation logic.
```

- [ ] **Step 2: Update OpenSpec task statuses for completed User A work**

In `openspec/changes/core-demo-execution-plan/tasks.md`, mark these tasks complete if the implementation and tests above passed:

```md
- [x] 1.3 Add Zod or JSON Schema validation generated from or aligned with the TypeScript contracts.
- [x] 1.5 Add contract fixtures for all event types, normalized web evidence/media results, and all four scenario context packets.
- [x] 1.7 Add declarative UI fixtures for surface plan, data model, primitive tree, action bindings, safety summary, and rejected raw HTML/CSS cases.
- [x] 1.8 Add primordial style brief fixtures for verify, understand, act, and respond intents.
- [x] 2.2 Implement the run state machine for receiving intent, observing page, classifying intent, planning, generating UI, running tools, awaiting approval, executing actions, verifying, completed, failed.
- [x] 2.3 Implement intent classification for verify, understand, act, respond, summarize, navigate, and unknown.
- [x] 2.4 Implement the planner interface that consumes intent classification, page context, available tools, and primitive manifest.
- [x] 2.6 Implement UI schema validation and repair/failure handling for generated primitive trees.
- [x] 2.8 Implement verification result handling for success, failed, partial, and unknown outcomes.
- [x] 2.9 Implement provider-neutral `web.search` and `web.fetch` tool interfaces.
- [x] 2.12 Add Vitest unit tests for state transitions, classifier outputs, approval policy, UI validation, web tool normalization including media fields, and verification decisions.
- [x] 2.13 Teach the planner to emit the declarative UI contract: surface plan, data model, primitive tree, safety summary, and action bindings.
- [x] 2.14 Add a fast style-planner step that produces a compact non-authoritative `PrimordialStyleBrief` for the principal CT agent.
```

Do not mark `2.10` complete unless a live Exa provider is implemented and tested with an API key.

- [ ] **Step 3: Add brief note about extension infra**

Add this to `BRIEF.md` under Architecture Direction:

```md
Extension infrastructure is a transport adapter around the harness, not a separate product path. Content scripts collect page context and mount overlays; the background worker or in-process local session runs the same `HarnessSession` contract used by the Vite demo.
```

- [ ] **Step 4: Run all checks**

Run:

```powershell
cd frontend
npm test
npx tsc --noEmit
npm run build
npm run build:extension
cd ..
openspec validate core-demo-execution-plan
```

Expected:

- Vitest passes.
- TypeScript passes.
- Vite app build passes.
- Extension build passes.
- OpenSpec validates.

- [ ] **Step 5: Commit final docs and spec status**

```powershell
git add BRIEF.md docs/team-kickoff/user-a-harness-runtime.md openspec/changes/core-demo-execution-plan/tasks.md
git commit -m "docs: record harness implementation status"
```

---

## Self-Review

### Spec Coverage

- Explicit run state machine: Tasks 6 and 7.
- Functional planning/tool loop: Tasks 4, 5, and 6.
- Intent classification: Task 3.
- Claude Code-style async session event stream: Task 6.
- Approval enforcement: Task 7.
- Result verification: Tasks 6 and 7.
- Deterministic fixtures as test fallback only: Task 1.
- Page context packet bridge: Task 8.
- Validated primitive rendering: Task 2.
- Declarative styling intent and style brief: Task 4.
- Web search/fetch provider-neutral boundary: Task 5.
- Harness tests: Tasks 1 through 10.
- Extension infrastructure: Task 9.

### Known Follow-Up After This Plan

- Live Exa provider implementation with API key handling and cache persistence.
- Model-backed principal CT agent generation.
- Playwright browser integration tests.
- Real SharkAuth workspace targeting and action executor integration.
- Content-to-background context roundtrip replacing the Task 9 direct local session shortcut.

### Type Consistency

The plan uses existing exported types:

- `HarnessEvent`, `AgentPlan`, `BrowserActionPlan`, `ToolResult`, `IntentClassification` from `frontend/src/types/harness.ts`.
- `GeneratedUI`, `PrimordialStyleBrief`, `DeclarativeSurfacePlan` from `frontend/src/types/ui.ts`.
- `HarnessRunInput`, `RuntimeDependencies`, `ToolDefinition`, `PageContextPacket`, `UserIntentPacket` from `frontend/src/harness/runtime/contracts.ts`.

If TypeScript catches a mismatch, update the implementation to the existing source type rather than duplicating a second type.

