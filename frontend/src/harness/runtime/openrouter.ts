import type { ClickthroughNode } from "@/types/primitives";
import type { IntentClassification, IntentFamily } from "@/types/harness";
import type { UserIntentPacket, PageContextPacket, WebSearchOutput } from "./contracts";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "google/gemini-2.0-flash";

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("VITE_OPENROUTER_API_KEY is not set");
  return key;
}

function getModel(): string {
  return import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;
}

async function llmGenerate(systemPrompt: string, userPrompt: string, jsonMode = true): Promise<string> {
  const key = getApiKey();
  const model = getModel();
  const url = `${OPENROUTER_BASE}/chat/completions`;

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Clickthrough",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

// ── Robust JSON Extraction ──

function extractJson(text: string): string {
  let cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*$/gi, "").trim();
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) return objectMatch[0];
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) return arrayMatch[0];
  return cleaned;
}

function safeJsonParse<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const extracted = extractJson(text);
    return JSON.parse(extracted) as T;
  }
}

// ── Page Context Helpers ──

function formatPageContext(page: PageContextPacket): string {
  const elements = page.nearbyElements
    .slice(0, 20)
    .map((e) => `- [${e.role || e.tagName}] ${e.label || e.text?.slice(0, 60) || "(no label)"}`)
    .join("\n");

  let ctx = `Page: ${page.title}
URL: ${page.url}
Visible text: ${page.visibleText.slice(0, 1200)}
Selected text: ${page.selectedText?.slice(0, 400) || "(none)"}
Interactive elements:
${elements || "(none found)"}`;

  if (page.cursorPosition) {
    ctx += `\nCursor position: (${page.cursorPosition.x}, ${page.cursorPosition.y})`;
  }

  return ctx;
}

// ── Intent Classification ──

const INTENT_FAMILIES: IntentFamily[] = [
  "verify",
  "understand",
  "act",
  "respond",
  "navigate",
  "summarize",
  "unknown",
];

export async function classifyIntent(
  intent: UserIntentPacket,
  page: PageContextPacket
): Promise<IntentClassification> {
  const system = `You classify user intent for a browser agent. You MUST read the page context carefully. The user's request often refers to "this" or "it" — that means the selected text or the main visible content. Output ONLY JSON. No prose.`;

  const user = `${formatPageContext(page)}

User request: "${intent.prompt}"

Choose ONE family: ${INTENT_FAMILIES.join(", ")}

Output exact JSON:
{"family":"verify","confidence":0.94,"target":"claim","needsWebSearch":true,"needsDomActions":false,"needsApproval":false,"riskLevel":"low"}`;

  try {
    const raw = await llmGenerate(system, user, true);
    const parsed = safeJsonParse<Record<string, any>>(raw);

    return {
      family: INTENT_FAMILIES.includes(parsed.family) ? parsed.family : "unknown",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      target: parsed.target || undefined,
      needsWebSearch: !!parsed.needsWebSearch,
      needsDomActions: !!parsed.needsDomActions,
      needsApproval: !!parsed.needsApproval,
      riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "low",
    };
  } catch (err) {
    console.warn("[classifyIntent] failed, using heuristic fallback:", err);
    return heuristicClassify(intent.prompt);
  }
}

function heuristicClassify(prompt: string): IntentClassification {
  const p = prompt.toLowerCase();
  if (p.includes("true") || p.includes("verify") || p.includes("fake") || p.includes("real"))
    return { family: "verify", confidence: 0.7, target: "claim", needsWebSearch: true, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("explain") || p.includes("what") || p.includes("how") || p.includes("mean"))
    return { family: "understand", confidence: 0.7, target: "selection", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("reply") || p.includes("say") || p.includes("respond") || p.includes("draft"))
    return { family: "respond", confidence: 0.7, target: "message", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("do") || p.includes("create") || p.includes("make") || p.includes("fill"))
    return { family: "act", confidence: 0.6, target: "workflow", needsWebSearch: false, needsDomActions: true, needsApproval: true, riskLevel: "medium" };
  if (p.includes("go to") || p.includes("find") || p.includes("open"))
    return { family: "navigate", confidence: 0.6, target: "page", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  return { family: "unknown", confidence: 0.3, needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
}

// ── UI Tree Generation ──

const AVAILABLE_PRIMITIVES = `
Layout: Panel, Stack, Grid, Section, SplitPane, Rail, Spacer, Divider
Text: Heading, BodyText, StatusPill, Label, Callout, InlineQuote, CodeBlock, Metadata
Inputs: Button, IconButton, SegmentedControl, TextField, TextArea, Select, Toggle, Slider
Evidence: QuoteCard, IdentityCard, EvidenceSource, EvidenceStack, AlertList, ProgressBar, ConclusionCard, SourceTrail
Visual: Timeline, SequenceDiagram, Stepper, ComparisonTable, AnnotatedDiagram
State: Skeleton, ProgressList, EmptyState, ErrorState, SuccessState, LoadingSpinner
Safety: RiskSummary, UncertaintyNote, SourceQualityBadge
Agent: AgentStateIndicator, ToolProgressCard, BudgetBar
Action: StepList, ScopeMatrix, ApprovalGate, CopyField
Navigation: Tabs, Accordion, Badge
Media: ImageFrame, CodeFrame
`;

export async function generateUiTree(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): Promise<ClickthroughNode> {
  try {
    const tree = await modelGenerateUiTree(intent, page, classification, toolResults);
    if (tree && tree.type) return tree;
  } catch (err) {
    console.warn("[generateUiTree] Model failed, using deterministic fallback:", err);
  }
  return deterministicFallbackUi(intent, page, classification, toolResults);
}

async function modelGenerateUiTree(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): Promise<ClickthroughNode> {
  const searchSummary = toolResults.search?.sources?.length
    ? toolResults.search.sources
        .slice(0, 4)
        .map((s) => `- ${s.title}: ${s.snippet?.slice(0, 120) || ""}`)
        .join("\n")
    : "No sources found.";

  const system = `You are an expert analyst AND UI designer for a browser agent called Clickthrough.

YOUR PRIMARY JOB IS TO THINK AND ANSWER THE USER'S QUESTION. Then present that answer as a JSON UI tree.

RULES:
1. FIRST analyze the user's request using the page context and search results.
2. THEN synthesize a REAL ANSWER with specific insights, facts, conclusions, or recommendations.
3. FINALLY wrap that answer in UI primitives.
4. NEVER output placeholder text like "Description here" or "Your text here" or "Lorem ipsum".
5. EVERY BodyText and Heading must contain actual synthesized insight.
6. For verify: give a real verdict ("Unverified", "Likely True", "False") with reasoning.
7. For understand: actually explain the concept using the page text.
8. For respond: draft actual reply text the user could copy.
9. Output ONLY valid JSON. No markdown, no explanations outside the JSON.`;

  const user = `${formatPageContext(page)}

User request: "${intent.prompt}"
Intent: ${classification.family}

Sources:
${searchSummary}

Available primitives:
${AVAILABLE_PRIMITIVES}

## CRITICAL INSTRUCTIONS
Your output must be a single JSON object. The UI must contain REAL ANSWERS, not placeholder text.

## JSON Format
- Root: {"type":"Panel","props":{"tone":"info"},"children":[...]}
- Text nodes: {"type":"BodyText","props":{"children":"ACTUAL INSIGHT TEXT HERE"}}
- Headings: {"type":"Heading","props":{"level":2,"children":"Actual Title"}}
- Buttons: {"type":"Button","props":{"label":"Actual Label","variant":"primary"}}
- EvidenceSource: {"type":"EvidenceSource","props":{"title":"Real Source Title","publisher":"Site Name","url":"https://...","quality":"high"}}
- ProgressBar: {"type":"ProgressBar","props":{"value":65,"label":"Confidence"}}
- AlertList: {"type":"AlertList","props":{"items":[{"message":"Real contradiction or finding","tone":"warning"}]}}
- SegmentedControl: {"type":"SegmentedControl","props":{"value":"with","options":[{"label":"With","value":"with"},{"label":"Without","value":"without"}]}}
- Stepper: {"type":"Stepper","props":{"activeStep":1,"steps":[{"title":"Step 1","state":"done"},{"title":"Step 2","state":"active"}]}}

## Examples of GOOD vs BAD BodyText content
BAD: {"type":"BodyText","props":{"children":"Here's what we found."}}
GOOD: {"type":"BodyText","props":{"children":"I found 3 sources. LinkedIn confirms Raul is an incoming SWE intern, but no Amazon-specific announcement exists. The claim is plausible but not independently verified."}}

BAD: {"type":"Heading","props":{"level":3,"children":"Results"}}
GOOD: {"type":"Heading","props":{"level":3,"children":"Likely Unverified: No Amazon Source Found"}}

Generate the complete UI tree with real content now.`;

  const raw = await llmGenerate(system, user, false);
  const cleaned = extractJson(raw);
  const tree = safeJsonParse<ClickthroughNode>(cleaned);

  if (!tree || !tree.type) throw new Error("Invalid tree structure");
  return tree;
}

// ── Deterministic Fallback UIs ──

function deterministicFallbackUi(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): ClickthroughNode {
  const sources = toolResults.search?.sources?.slice(0, 3) || [];

  switch (classification.family) {
    case "verify":
      return buildVerifyUi(intent, page, sources);
    case "understand":
      return buildUnderstandUi(intent, page);
    case "respond":
      return buildRespondUi(intent, page);
    case "act":
      return buildActUi(intent, page);
    default:
      return buildGenericUi(intent, page);
  }
}

function buildVerifyUi(intent: UserIntentPacket, _page: PageContextPacket, sources: any[]): ClickthroughNode {
  return {
    type: "Panel",
    props: { tone: "info", chrome: "standard" },
    children: [
      { type: "Heading", props: { level: 3, children: "Claim Verification" } },
      { type: "BodyText", props: { children: `Checking: "${intent.selectedText || intent.prompt}"` } },
      { type: "Label", props: { children: "Evidence Sources", tone: "muted" } },
      ...(sources.length
        ? sources.map((s) => ({
            type: "EvidenceSource",
            props: { title: s.title, publisher: s.publisher || s.url, url: s.url, quality: s.quality || "medium" },
          }))
        : [{ type: "BodyText", props: { children: "No web sources found. Try a more specific query.", tone: "muted" } }]),
      { type: "ProgressBar", props: { value: sources.length ? 60 : 20, label: "Confidence", tone: "neutral" } },
      {
        type: "ConclusionCard",
        props: {
          verdict: sources.length ? "mixed" : "unverified",
          summary: sources.length
            ? `Found ${sources.length} source(s). Review the evidence above.`
            : "Could not find corroborating sources. The claim remains unverified.",
          confidence: sources.length ? 60 : 20,
        },
      },
      { type: "UncertaintyNote", props: { reason: "This is an automated check. Always verify primary sources yourself." } },
    ],
  };
}

function buildUnderstandUi(intent: UserIntentPacket, page: PageContextPacket): ClickthroughNode {
  return {
    type: "Panel",
    props: { tone: "info", chrome: "standard" },
    children: [
      { type: "Heading", props: { level: 3, children: "Explanation" } },
      { type: "InlineQuote", props: { quote: intent.selectedText?.slice(0, 300) || page.visibleText.slice(0, 300), source: page.title } },
      { type: "BodyText", props: { children: "Here's a breakdown of what's happening in the selected content." } },
      {
        type: "Stepper",
        props: {
          activeStep: 0,
          steps: [
            { title: "Context", state: "done" },
            { title: "Key Concept", state: "active" },
            { title: "Details", state: "pending" },
            { title: "Summary", state: "pending" },
          ],
        },
      },
      { type: "Callout", props: { title: "Tip", body: "Look for definitions and examples in the surrounding text.", tone: "info" } },
    ],
  };
}

function buildRespondUi(_intent: UserIntentPacket, _page: PageContextPacket): ClickthroughNode {
  return {
    type: "Panel",
    props: { tone: "info", chrome: "standard" },
    children: [
      { type: "Heading", props: { level: 3, children: "Response Assistant" } },
      { type: "BodyText", props: { children: "Here's some context to help you respond." } },
      { type: "Label", props: { children: "Draft Reply", tone: "muted" } },
      { type: "TextArea", props: { value: "", rows: 4, placeholder: "Your response will appear here..." } },
      {
        type: "SegmentedControl",
        props: {
          value: "friendly",
          options: [
            { label: "Friendly", value: "friendly" },
            { label: "Professional", value: "professional" },
            { label: "Concise", value: "concise" },
          ],
        },
      },
      { type: "Button", props: { label: "Copy Draft", variant: "primary" } },
    ],
  };
}

function buildActUi(_intent: UserIntentPacket, _page: PageContextPacket): ClickthroughNode {
  return {
    type: "Panel",
    props: { tone: "warning", chrome: "standard" },
    children: [
      { type: "Heading", props: { level: 3, children: "Action Guidance" } },
      { type: "BodyText", props: { children: "This page supports the following actions. Clickthrough can prepare guidance, but will not execute actions without your approval." } },
      { type: "RiskSummary", props: { riskLevel: "medium", items: [{ label: "Page mutation", level: "medium" }] } },
      { type: "StepList", props: { steps: [{ label: "Review the form" }, { label: "Prepare inputs" }, { label: "Confirm before submitting" }] } },
      { type: "Button", props: { label: "Prepare Action Plan", variant: "primary" } },
    ],
  };
}

function buildGenericUi(intent: UserIntentPacket, page: PageContextPacket): ClickthroughNode {
  return {
    type: "Panel",
    props: { tone: "neutral", chrome: "standard" },
    children: [
      { type: "Heading", props: { level: 3, children: "Clickthrough" } },
      { type: "BodyText", props: { children: `You asked: "${intent.prompt}"` } },
      { type: "BodyText", props: { children: `On page: ${page.title}`, tone: "muted" } },
      {
        type: "Stack",
        props: { direction: "horizontal", gap: "sm" },
        children: [
          { type: "Button", props: { label: "Verify", variant: "primary" } },
          { type: "Button", props: { label: "Explain", variant: "secondary" } },
          { type: "Button", props: { label: "Respond", variant: "secondary" } },
        ],
      },
    ],
  };
}

// ── Clarification Prompt ──

export async function generateClarificationPrompt(
  intent: UserIntentPacket,
  page: PageContextPacket
): Promise<ClickthroughNode> {
  return {
    type: "Panel",
    props: { tone: "info", chrome: "standard" },
    children: [
      {
        type: "Heading",
        props: { level: 3, children: "What would you like to do?" },
      },
      {
        type: "BodyText",
        props: {
          children: `You're on "${page.title}". Your request: "${intent.prompt}".`,
        },
      },
      {
        type: "Stack",
        props: { direction: "horizontal", gap: "sm" },
        children: [
          { type: "Button", props: { label: "Verify a claim", variant: "primary" } },
          { type: "Button", props: { label: "Explain this", variant: "secondary" } },
          { type: "Button", props: { label: "Help me respond", variant: "secondary" } },
        ],
      },
    ],
  };
}
