import type { ClickthroughNode } from "@/types/primitives";
import type { IntentClassification, IntentFamily } from "@/types/harness";
import type { UserIntentPacket, PageContextPacket, WebSearchOutput } from "./contracts";
import { validateGeneratedUi } from "./validateUi";
import { providerFetch } from "./providerFetch";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const DEFAULT_MODEL = "nousresearch/hermes-3-llama-3.1-405b:free";

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!key) throw new Error("VITE_OPENROUTER_API_KEY is not set");
  return key;
}

function getModel(): string {
  return import.meta.env.VITE_OPENROUTER_MODEL || DEFAULT_MODEL;
}

async function llmGenerate(
  systemPrompt: string,
  userPrompt: string,
  jsonMode = true,
  imageDataUrl?: string
): Promise<string> {
  const key = getApiKey();
  const model = getModel();
  const url = `${OPENROUTER_BASE}/chat/completions`;

  // Build user message content — text only, or text + image multimodal
  const userContent = imageDataUrl && modelSupportsImages(model)
    ? [
        { type: "text", text: userPrompt },
        { type: "image_url", image_url: { url: imageDataUrl } },
      ]
    : userPrompt;

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    temperature: 0.2,
    max_tokens: 4096,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const fetchCompletion = (requestBody: Record<string, unknown>) => providerFetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
      "HTTP-Referer": window.location.origin,
      "X-Title": "Clickthrough",
    },
    body: JSON.stringify(requestBody),
  });

  let res = await fetchCompletion(body);

  if (!res.ok && jsonMode) {
    const firstError = await res.text();
    console.warn("[OpenRouter] JSON mode failed, retrying without response_format:", firstError);
    const retryBody = { ...body };
    delete retryBody.response_format;
    res = await fetchCompletion(retryBody);
  }

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter returned empty response");
  return text;
}

export function modelSupportsImages(model: string): boolean {
  const normalized = model.toLowerCase();
  return (
    normalized.includes("gpt-4o") ||
    normalized.includes("gpt-4.1") ||
    normalized.includes("gemini") ||
    normalized.includes("claude-3") ||
    normalized.includes("vision")
  );
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
Page type: ${page.structured?.pageType || "generic"}
Summary: ${page.structured?.summary || ""}`;

  // Use structured context when available
  if (page.structured?.tweet) {
    const t = page.structured.tweet;
    ctx += `\n\nTweet by ${t.authorName} (${t.authorHandle}):
"${t.text}"
Timestamp: ${t.timestamp || "unknown"}`;
  }

  if (page.structured?.article) {
    const a = page.structured.article;
    ctx += `\n\nArticle: ${a.title}
Author: ${a.author || "unknown"}
Headings: ${a.headings.slice(0, 5).map((h) => h.text).join(" > ")}`;
  }

  if (page.structured?.chat) {
    const msgs = page.structured.chat.messages.slice(-3);
    ctx += `\n\nChat messages (${page.structured.chat.messages.length} total):\n${msgs.map((m) => `- ${m.sender}: "${m.text}"`).join("\n")}`;
  }

  if (page.structured?.dashboard) {
    const d = page.structured.dashboard;
    ctx += `\n\nDashboard detected:
- Forms: ${d.forms.length} (${d.forms.map((f) => f.name).join(", ")})
- Tables: ${d.tables.length}
- Widgets: ${d.widgets.length}`;
  }

  ctx += `\n\nVisible text: ${page.visibleText.slice(0, 800)}
Selected text: ${page.selectedText?.slice(0, 400) || "(none)"}
Interactive elements:
${elements || "(none found)"}`;

  if (page.cursorPosition) {
    ctx += `\nCursor position: (${page.cursorPosition.x}, ${page.cursorPosition.y})`;
  }

  return ctx;
}

function extractLikelyTargetText(intent: UserIntentPacket, page: PageContextPacket): string {
  const selected = intent.selectedText || page.selectedText;
  if (selected?.trim()) return selected.trim().slice(0, 500);

  // Use structured context when available
  if (page.structured?.tweet) {
    return page.structured.tweet.text.slice(0, 500);
  }
  if (page.structured?.article) {
    const article = page.structured.article;
    return `${article.title}. ${article.mainContent}`.slice(0, 500);
  }
  if (page.structured?.chat?.messages.length) {
    const lastMsg = page.structured.chat.messages[page.structured.chat.messages.length - 1];
    return `${lastMsg.sender}: ${lastMsg.text}`.slice(0, 500);
  }

  const titleTarget = cleanSearchText(page.title);
  const prompt = intent.prompt.toLowerCase();
  if (
    titleTarget &&
    !/^amazon(\.com)?$/i.test(titleTarget) &&
    (prompt.includes("this") || prompt.includes("compare") || prompt.includes("or "))
  ) {
    return titleTarget.slice(0, 300);
  }

  const visible = cleanSearchText(page.visibleText);
  const socialClaim = visible.match(/(?:I['’]m|I am|We are|We're|We['’]re).{20,180}(?:intern|joining|launching|hiring|acquired|raised|released|available)[^.!?]*/i);
  if (socialClaim) return socialClaim[0].slice(0, 500);

  const sentence = visible.match(/[^.!?]{24,220}[.!?]/);
  return (sentence?.[0] || titleTarget || visible || intent.prompt).slice(0, 500);
}

function cleanSearchText(text: string): string {
  return text
    .replace(/\bshift\s*\+\s*alt\s*\+\s*[a-z]\b/gi, " ")
    .replace(/\b(inicio|pedidos|agregar al carrito|mostrar\/ocultar|m[oó]todos abreviados)\b/gi, " ")
    .replace(/para moverte entre elementos[^.]+[.]/gi, " ")
    .replace(/usa las flechas arriba o abajo del teclado[.]?/gi, " ")
    .replace(/\b(skip to main content|keyboard shortcuts|accessibility help)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSearchQuery(intent: UserIntentPacket, page: PageContextPacket, classification?: IntentClassification): string {
  const target = extractLikelyTargetText(intent, page);
  const prompt = cleanSearchText(intent.prompt);

  if (classification?.family === "navigate" || classification?.family === "summarize") {
    return `${target} ${prompt}`.replace(/\s+/g, " ").slice(0, 220);
  }

  if (classification?.family === "verify") {
    return `${target} ${prompt}`.replace(/\s+/g, " ").slice(0, 260);
  }
  if (classification?.family === "respond" || classification?.family === "understand") {
    return target.slice(0, 220);
  }
  return `${target} ${prompt}`.replace(/\s+/g, " ").slice(0, 260);
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
  if (isComparisonIntent(intent.prompt)) {
    return { family: "summarize", confidence: 0.82, target: "page", needsWebSearch: true, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  }

  const system = `You are Clickthrough IntentClassifier, an expert classification module inside a browser-native agent.
Responsibilities:
1. Read the page context (URL, title, visible text, selected text, interactive elements, optional screenshot).
2. Resolve pronouns ("this", "it", "that") to the selected text or the dominant visible content.
3. Classify the user's request into exactly one intent family.

Constraints:
- Output ONLY a valid JSON object. No markdown. No prose.
- Never emit families outside the allowed list.
- Confidence must be a number between 0.0 and 1.0.
- riskLevel must be "low", "medium", or "high".

Communication style: terse, deterministic, no hedging.`;

  const user = `${formatPageContext(page)}

User request: "${intent.prompt}"

Allowed families: ${INTENT_FAMILIES.join(", ")}

Step-by-step reasoning:
1. Page type: Identify from URL and visible elements (e.g., twitter.com → social, pdf → document, chat → messaging).
2. Target resolution: If the user says "this" or "it", use selectedText or the dominant visible content.
3. Verb mapping: Match the user's goal to the closest family.
4. Flags: Set needsWebSearch if external facts are required. Set needsDomActions if page mutation is implied. Set needsApproval if the action is destructive or sensitive. Set riskLevel accordingly.
5. Self-verify: Before outputting, confirm family is in the allowed list, confidence is between 0.0–1.0, and riskLevel is valid.

Output exact JSON schema:
{
  "family": "<one of: verify, understand, act, respond, navigate, summarize, unknown>",
  "confidence": 0.0-1.0,
  "target": "claim|selection|message|workflow|page",
  "needsWebSearch": boolean,
  "needsDomActions": boolean,
  "needsApproval": boolean,
  "riskLevel": "low|medium|high"
}

Few-shot examples:
- Page: "X (formerly Twitter)" | User: "Is this true?" → {"family":"verify","confidence":0.95,"target":"claim","needsWebSearch":true,"needsDomActions":false,"needsApproval":false,"riskLevel":"low"}
- Page: "Raul R. Gonzalez (@raulgcc1) / X" | User: "investigate who is this guy?" → {"family":"understand","confidence":0.9,"target":"page","needsWebSearch":true,"needsDomActions":false,"needsApproval":false,"riskLevel":"low"}
- Page: "OAuth 2.0 and PKCE - IETF" | User: "Explain this visually" → {"family":"understand","confidence":0.96,"target":"selection","needsWebSearch":false,"needsDomActions":false,"needsApproval":false,"riskLevel":"low"}
- Page: "Messages" | User: "What do I say?" → {"family":"respond","confidence":0.94,"target":"message","needsWebSearch":false,"needsDomActions":false,"needsApproval":false,"riskLevel":"medium"}
- Page: "AWS Console" | User: "Create an API key" → {"family":"act","confidence":0.88,"target":"workflow","needsWebSearch":false,"needsDomActions":true,"needsApproval":true,"riskLevel":"high"}
- Page: "Google Docs" | User: "Help me handle this page" → {"family":"navigate","confidence":0.82,"target":"page","needsWebSearch":false,"needsDomActions":false,"needsApproval":false,"riskLevel":"low"}

If uncertain (confidence < 0.5), set family to "unknown" and riskLevel to "low".
Output JSON only.`;

  try {
    // Use vision if screenshot is available (Gemini 2.0 Flash supports multimodal)
    const raw = await llmGenerate(system, user, true, page.screenshot);
    const parsed = safeJsonParse<Record<string, any>>(raw);

    const parsedClassification: IntentClassification = {
      family: INTENT_FAMILIES.includes(parsed.family) ? parsed.family : "unknown",
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
      target: parsed.target || undefined,
      needsWebSearch: !!parsed.needsWebSearch,
      needsDomActions: !!parsed.needsDomActions,
      needsApproval: !!parsed.needsApproval,
      riskLevel: ["low", "medium", "high"].includes(parsed.riskLevel) ? parsed.riskLevel : "low",
    };

    const heuristic = heuristicClassify(intent.prompt, page);
    if (
      parsedClassification.family === "unknown" ||
      parsedClassification.confidence < 0.45 ||
      (heuristic.confidence > parsedClassification.confidence + 0.2 && heuristic.family !== "unknown")
    ) {
      return heuristic;
    }

    return parsedClassification;
  } catch (err) {
    console.warn("[classifyIntent] failed, using heuristic fallback:", err);
    return heuristicClassify(intent.prompt, page);
  }
}

export function heuristicClassify(prompt: string, page?: PageContextPacket): IntentClassification {
  const p = prompt.toLowerCase();
  const selectedOrVisible = `${page?.selectedText || ""} ${page?.visibleText || ""}`.toLowerCase();
  if (isComparisonIntent(prompt))
    return { family: "summarize", confidence: 0.82, target: "page", needsWebSearch: true, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (isIdentityInvestigationIntent(prompt, page))
    return { family: "understand", confidence: 0.76, target: "page", needsWebSearch: true, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("true") || p.includes("verify") || p.includes("fake") || p.includes("real") || p.includes("source"))
    return { family: "verify", confidence: 0.7, target: "claim", needsWebSearch: true, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("reply") || p.includes("say") || p.includes("respond") || p.includes("draft") || p.includes("what do i say"))
    return { family: "respond", confidence: 0.7, target: "message", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "medium" };
  if (p.includes("explain") || p.includes("visual") || p.includes("what") || p.includes("how") || p.includes("mean") || selectedOrVisible.includes("pkce"))
    return { family: "understand", confidence: 0.7, target: "selection", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("help") || p.includes("handle") || p.includes("assist") || p.includes("what can i do"))
    return { family: "navigate", confidence: 0.65, target: "page", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  if (p.includes("do") || p.includes("create") || p.includes("make") || p.includes("fill"))
    return { family: "act", confidence: 0.6, target: "workflow", needsWebSearch: false, needsDomActions: true, needsApproval: true, riskLevel: "medium" };
  if (p.includes("go to") || p.includes("find") || p.includes("open"))
    return { family: "navigate", confidence: 0.6, target: "page", needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
  return { family: "unknown", confidence: 0.3, needsWebSearch: false, needsDomActions: false, needsApproval: false, riskLevel: "low" };
}

function isComparisonIntent(prompt: string): boolean {
  const p = prompt.toLowerCase();
  return /\b(compare|versus|vs\.?|which|better|should i buy)\b/.test(p) || /\bthis\b.+\bor\b.+\?*$/.test(p);
}

function isIdentityInvestigationIntent(prompt: string, page?: PageContextPacket): boolean {
  const p = prompt.toLowerCase();
  const pageText = `${page?.title || ""} ${page?.url || ""} ${page?.visibleText || ""}`.toLowerCase();
  const asksAboutPerson =
    /\b(who is|who's|who are|who am i looking at|who is this (guy|person|account|profile|user))\b/.test(p) ||
    /\b(investigate|lookup|look up|research|background|profile)\b/.test(p);
  const socialContext =
    /\b(x\.com|twitter\.com|linkedin\.com|github\.com|instagram\.com|tiktok\.com|profile|@\w+)/.test(pageText);

  return asksAboutPerson && socialContext;
}

// ── UI Tree Generation ──

const AVAILABLE_PRIMITIVES = `
ONLY these exact primitive names can be used. Do NOT invent names. Do NOT use composite names from docs like VerificationDashboard or VisualExplainer.

Shell: OverlayRoot, PromptBar, CTMark, AnchorHighlight, PageDimmer, OverlayPositioner
Layout: Panel, Stack, Grid, Section, SplitPane, Rail, Spacer, Divider
Text: Heading, BodyText, StatusPill, Label, Callout, InlineQuote, CodeBlock, Metadata
Inputs: Button, IconButton, TextField, TextArea, Select, Toggle, SegmentedControl, CheckboxRow, RadioRow, Slider
Evidence: QuoteCard, IdentityCard, EvidenceSource, EvidenceStack, AlertList, ProgressBar, ConclusionCard, SourceTrail
Visual: Timeline, SequenceDiagram, Stepper, ComparisonTable, AnnotatedDiagram, FlowDiagram
Actions: StepList, ScopeMatrix, ApprovalGate, ExecutionLog, CopyField, VerificationResult
Safety: RiskSummary, UncertaintyNote, SourceQualityBadge, SensitiveContextGuard, PrivateModeBadge, AuditTrail
State: Skeleton, ProgressList, EmptyState, ErrorState, SuccessState, LoadingSpinner
Trust: SecurityBoundary, TrustIndicator, PermissionBadge, DataStream, ScanLine, FloatingIndicator
Agent: AgentStateIndicator, ToolProgressCard, BudgetBar, MemoryChip, ClarificationPrompt, IntentConfirmation, FollowUpBar, InterruptControl
Navigation: Accordion, Tabs, Breadcrumb, Tooltip, Badge, Tag
Frames: ImageFrame, MediaFrame, DiagramFrame, ScreenshotFrame, CarouselFrame, CodeFrame, MapFrame, ChartFrame
`;

const VALID_ACTION_IDS = `
If you emit Button or IconButton, you MUST include an actionId from this closed list:
- "action:copy" — copies the adjacent value or draft to clipboard
- "action:refresh" — refreshes the current investigation or search
- "action:expand" — expands a collapsed section or source
- "action:collapse" — collapses a section
- "action:dismiss" — dismisses the overlay
- "action:approve" — user approves a planned action (only inside ApprovalGate)
- "action:cancel" — user cancels a planned action
- "action:continue" — user acknowledges a guard and wants to continue (only inside SensitiveContextGuard)
- "action:retry" — retry a failed tool or generation

NEVER emit Button without actionId.
NEVER invent actionIds outside this list.
If there is no actionable next step, do NOT emit a Button. Use BodyText or Callout instead.
`;

const INTENT_ASSEMBLIES = `
You are a UI architect. For each intent, choose the RIGHT layout primitive and compose microcomponents dynamically.

Layout primitives:
- Stack (vertical/horizontal) — for sequential content, toolbars, action rows
- Grid — for comparable items, source cards, metric comparisons
- SplitPane — for diagram + text, form + risk summary, verdict + source trail
- Section — for collapsible groups of related content
- Panel — root container only, never nest panels

Microcomponent patterns (compose these, don't use as monolithic names):
- Claim display: InlineQuote + Label + Metadata
- Evidence card: EvidenceSource + SourceQualityBadge + optional image
- Verdict: ConclusionCard + ProgressBar + UncertaintyNote
- Action plan: StepList + RiskSummary + ApprovalGate
- Reply assistant: TextArea + SegmentedControl + CopyField
- Visual explainer: SequenceDiagram/Timeline + Stepper + SegmentedControl + Callout

Composition rules:
- Use Stack vertical for reading flow (top to bottom)
- Use Stack horizontal for actions, filters, toggles
- Use Grid when showing 2+ comparable evidence sources
- Use SplitPane when showing a diagram/explanation side-by-side with controls
- Use Section to group related content with optional collapse
- NEVER nest Panel inside Panel
- Root is always Panel, everything else goes inside
`;

const RENDERER_RULES = `
Hard rules:
1. Output ONE valid JSON object. No markdown. No prose outside JSON.
2. Use ONLY primitive names from the manifest above. Do not invent names.
3. Do not use raw HTML, markdown, scripts, CSS, or composite names.
4. Every visible text field must contain SPECIFIC synthesized content from the page, user request, or sources. Never output placeholders.
5. Never display the word "unknown" as a tag, bullet, badge, freshness, quality, verdict, title, or label.
6. If freshness is unknown, OMIT the freshness prop entirely.
7. If source quality is uncertain, use "medium" or "low" and add an UncertaintyNote.
8. NEVER emit Button without a valid actionId from the closed list.
9. Do not emit a generic chat transcript as the primary UI.
10. Do not nest Panels inside Panels.
11. Root should usually be Panel.
12. Every interactive primitive must have a keyboard path and accessible labels.
13. Enum discipline:
    - ConclusionCard.verdict ∈ {"true","false","mixed","unverified"}
    - RiskSummary.riskLevel ∈ {"low","medium","high"}
    - ProgressBar.value is a number 0-100
    - SourceQualityBadge.quality ∈ {"high","medium","low"}
14. For comparison intents, ComparisonTable must have at least 2 columns and 1+ populated rows.
15. For act intents, ApprovalGate MUST appear before any button that suggests mutation.

Layout composition rules:
16. You are generating a UI tree, not filling a template. The structure should vary based on the content.
17. Do not copy the example layouts verbatim. Use them as inspiration for composition.
18. If there is only one piece of evidence, use Stack vertical, not Grid.
19. If there is a diagram and explanation, use SplitPane.
20. If there are 3+ steps, use Stepper. If there are 2 options, use SegmentedControl.
`;

const JSON_EXAMPLES = `
JSON Format:
- Root: {"type":"Panel","props":{"tone":"info","title":"Claim Verification"},"children":[...]}
- Text: {"type":"BodyText","props":{"children":"ACTUAL INSIGHT TEXT HERE"}}
- Headings: {"type":"Heading","props":{"level":2,"children":"Actual Title"}}
- Working Button: {"type":"Button","props":{"label":"Copy draft","variant":"primary","actionId":"action:copy"}}
- Dead Button (FORBIDDEN): {"type":"Button","props":{"label":"Send"}} ← missing actionId
- EvidenceSource: {"type":"EvidenceSource","props":{"title":"Real Source Title","publisher":"Site Name","url":"https://...","quality":"high"}}
- ProgressBar: {"type":"ProgressBar","props":{"value":65,"label":"Confidence"}}
- AlertList: {"type":"AlertList","props":{"items":[{"message":"Real contradiction or finding","tone":"warning"}]}}
- SegmentedControl: {"type":"SegmentedControl","props":{"value":"with","options":[{"label":"With","value":"with"},{"label":"Without","value":"without"}]}}
- Stepper: {"type":"Stepper","props":{"activeStep":1,"steps":[{"title":"Step 1","state":"done"},{"title":"Step 2","state":"active"}]}}
- ApprovalGate: {"type":"ApprovalGate","props":{"title":"Approve API key creation?","summary":"This will create a credential.","approveLabel":"Approve","cancelLabel":"Cancel","approvalActionId":"action:approve"}}
- SensitiveContextGuard: {"type":"SensitiveContextGuard","props":{"category":"health","message":"This is social context, not a diagnosis.","continueActionId":"action:continue"}}

Compositional examples:

// Example: Simple claim + single source (vertical stack)
{"type":"Panel","props":{"tone":"info"},"children":[
  {"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":[
    {"type":"InlineQuote","props":{"quote":"...","source":"..."}},
    {"type":"EvidenceSource","props":{"title":"...","url":"...","stance":"neutral"}},
    {"type":"ConclusionCard","props":{"verdict":"unverified","headline":"..."}}
  ]}
]}

// Example: Evidence dashboard (grid for sources + stack for verdict)
{"type":"Panel","props":{"tone":"info"},"children":[
  {"type":"InlineQuote","props":{"quote":"..."}},
  {"type":"Grid","props":{"columns":2,"gap":"sm"},"children":[
    {"type":"EvidenceSource","props":{"title":"...","url":"..."}},
    {"type":"EvidenceSource","props":{"title":"...","url":"..."}}
  ]},
  {"type":"ConclusionCard","props":{"verdict":"mixed","headline":"..."}},
  {"type":"ProgressBar","props":{"value":45,"label":"Confidence"}}
]}

// Example: Visual explainer (split pane)
{"type":"Panel","props":{"tone":"info"},"children":[
  {"type":"SplitPane","props":{"ratio":"2:1"},"children":[
    {"type":"SequenceDiagram","props":{"actors":["A","B"],"messages":[{"from":"A","to":"B","label":"..."}]}},
    {"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":[
      {"type":"Stepper","props":{"activeStep":1,"steps":[{"title":"Step 1","state":"done"}]}},
      {"type":"SegmentedControl","props":{"value":"with","options":[{"label":"With","value":"with"}]}}
    ]}
  ]},
  {"type":"Callout","props":{"title":"Key insight","body":"...","tone":"info"}}
]}

Examples of GOOD vs BAD BodyText content:
BAD: {"type":"BodyText","props":{"children":"Here's what we found."}}
GOOD: {"type":"BodyText","props":{"children":"I found 3 sources. LinkedIn confirms Raul is an incoming SWE intern, but no Amazon-specific announcement exists. The claim is plausible but not independently verified."}}

BAD: {"type":"Heading","props":{"level":3,"children":"Results"}}
GOOD: {"type":"Heading","props":{"level":3,"children":"Likely Unverified: No Amazon Source Found"}}

BAD: {"type":"ConclusionCard","props":{"verdict":"unknown"}}
GOOD: {"type":"ConclusionCard","props":{"verdict":"unverified","headline":"Cannot verify from current signals","summary":"No primary source found.","confidence":25}}

BAD: {"type":"ComparisonTable","props":{"columns":[],"rows":[]}}
GOOD: {"type":"ComparisonTable","props":{"columns":[{"key":"factor","label":"Factor"},{"key":"a","label":"Product A"},{"key":"b","label":"Product B"}],"rows":[{"factor":"Price","a":"$299","b":"$349"}]}}
`;

export async function generateUiTree(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): Promise<ClickthroughNode> {
  try {
    const tree = normalizeGeneratedUiTree(await modelGenerateUiTree(intent, page, classification, toolResults));
    const validation = validateGeneratedUi(tree);
    const quality = assessGeneratedUiQuality(tree, classification, intent);
    if (validation.valid && quality.valid) return tree;

    const repairReasons = [...(!validation.valid ? validation.errors : []), ...(!quality.valid ? quality.errors : [])];
    console.warn("[generateUiTree] Model output needs repair:", repairReasons);
    const repairedTree = normalizeGeneratedUiTree(await repairGeneratedUiTree(tree, repairReasons, intent, page, classification, toolResults));
    const repairedValidation = validateGeneratedUi(repairedTree);
    const repairedQuality = assessGeneratedUiQuality(repairedTree, classification, intent);
    if (repairedValidation.valid && repairedQuality.valid) return repairedTree;

    console.warn("[generateUiTree] Repair failed, using deterministic fallback:", [
      ...(!repairedValidation.valid ? repairedValidation.errors : []),
      ...(!repairedQuality.valid ? repairedQuality.errors : []),
    ]);
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

  const system = `You are Clickthrough UIGenerator, an expert interface-generation module inside a browser-native agent.
You are NOT a chatbot. You do NOT output prose. You generate exactly one JSON object: a tree of allowed UI primitives.

Responsibilities:
1. Analyze the page context and optional screenshot to understand layout and content.
2. Select the correct primitive assembly for the classified intent.
3. Emit a valid, populated JSON UI tree with real synthesized content.
4. Ensure every interactive element has a valid actionId. No dead buttons.

${INTENT_ASSEMBLIES}

${AVAILABLE_PRIMITIVES}

${VALID_ACTION_IDS}

${RENDERER_RULES}

${JSON_EXAMPLES}

Chain-of-thought (think before generating):
1. Intent match: Which intent family is this?
2. Content extraction: What is the actual claim, selection, message, or page topic?
3. Layout choice: Based on content shape, choose Stack, Grid, SplitPane, or Section.
4. Primitive selection: Pick ONLY primitives from the manifest. Compose them dynamically based on evidence.
5. Content synthesis: Fill every text field with specific, real content. Never use placeholders.
6. Action audit: Every Button/IconButton must have an actionId from the closed list. Remove buttons with no action.
7. Structure validation: Root is usually Panel. No Panel inside Panel. Arrays must contain items.

Composition guidelines:
- Generate a UNIQUE layout for this specific content. Do not reuse the same structure as previous examples.
- The layout should match the content shape: few items → Stack, many comparable items → Grid, diagram + text → SplitPane.
- Choose primitives based on what the evidence actually contains, not based on a fixed recipe.
- If there is only one piece of evidence, use Stack vertical, not Grid.
- If there is a diagram and explanation, use SplitPane.
- If there are 3+ steps, use Stepper. If there are 2 options, use SegmentedControl.

Self-verification checklist (confirm before output):
- [ ] Root is a valid JSON object with "type", "props", and optional "children".
- [ ] All "type" values are from the primitive manifest.
- [ ] No visible text contains the word "unknown".
- [ ] Every Button/IconButton has a valid actionId.
- [ ] ConclusionCard verdict is one of: true, false, mixed, unverified.
- [ ] ComparisonTable has ≥2 columns and ≥1 row with real data.
- [ ] ApprovalGate appears before any mutation-suggesting button for act intents.
- [ ] If content is missing, omit the prop or use "Unverified"/"Needs review", never "unknown".

If you cannot generate a valid tree, output a minimal valid object:
{"type":"Panel","props":{"tone":"error","title":"Generation failed"},"children":[{"type":"ErrorState","props":{"message":"Unable to generate UI for this intent.","actionId":"action:retry"}}]}

Return one valid JSON object only. No markdown. No prose outside JSON.`;

  const user = `${formatPageContext(page)}

User request: "${intent.prompt}"
Intent family: ${classification.family}
Target text: "${extractLikelyTargetText(intent, page)}"

Sources:
${searchSummary}

Generate the complete UI tree now. Follow the chain-of-thought and self-verification checklist above. Output JSON only.`;

  // Use vision for UI generation when screenshot is available — helps model understand page visually
  const raw = await llmGenerate(system, user, false, page.screenshot);
  const cleaned = extractJson(raw);
  const tree = safeJsonParse<ClickthroughNode>(cleaned);

  if (!tree || !tree.type) throw new Error("Invalid tree structure");
  return tree;
}

async function repairGeneratedUiTree(
  tree: ClickthroughNode,
  errors: string[],
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): Promise<ClickthroughNode> {
  const system = `You are Clickthrough UIRepair, an expert repair module inside a browser-native agent.
You receive a broken UI tree and a list of validation errors. You return exactly one valid repaired JSON object.

Repair protocol:
1. Read the errors and the original tree.
2. Identify invalid primitives and replace them with the nearest valid primitive from the manifest.
3. Remove or replace any visible text containing the word "unknown".
4. Add missing essential primitives based on the content and intent family.
5. Give every Button/IconButton a valid actionId from the closed list, or remove the button.
6. Ensure ConclusionCard verdict is valid. Ensure ComparisonTable has ≥2 columns and ≥1 row.
7. Ensure ApprovalGate precedes any mutation suggestion for act intents.

${INTENT_ASSEMBLIES}

${AVAILABLE_PRIMITIVES}

${VALID_ACTION_IDS}

${RENDERER_RULES}

${JSON_EXAMPLES}

Self-verification checklist before output:
- [ ] All errors from the repair list are addressed.
- [ ] No primitive names outside the manifest remain.
- [ ] No visible text says "unknown".
- [ ] Every interactive element has a valid actionId or was removed.
- [ ] The tree is a single valid JSON object.

If repair is impossible, output a minimal fallback:
{"type":"Panel","props":{"tone":"error","title":"Repair failed"},"children":[{"type":"ErrorState","props":{"message":"Unable to repair UI tree.","actionId":"action:retry"}}]}

Return one valid JSON object only. No markdown. No prose outside JSON.`;

  const sources = toolResults.search?.sources?.slice(0, 4).map((source) => ({
    title: source.title,
    url: source.url,
    publisher: source.publisher,
    snippet: source.snippet,
    quality: source.quality === "unknown" ? "medium" : source.quality,
  }));

  const user = `Intent: ${classification.family}
User request: "${intent.prompt}"
Page: ${page.title}
Target text: "${extractLikelyTargetText(intent, page)}"
Sources: ${JSON.stringify(sources || [])}

Validation errors to fix:
${errors.map((error, i) => `${i + 1}. ${error}`).join("\n")}

Repair the tree below. Follow the repair protocol and self-verification checklist.
Before/after examples:
- Bad type: {"type":"ClaimCard"} → Good: {"type":"InlineQuote"}
- Bad text: {"type":"BodyText","props":{"children":"unknown"}} → Good: {"type":"BodyText","props":{"children":"Needs review"}}
- Dead button: {"type":"Button","props":{"label":"Send"}} → Good: remove the Button or add "actionId":"action:copy"
- Missing verdict: add {"type":"ConclusionCard","props":{"verdict":"unverified",...}}
- Missing columns: ensure ComparisonTable has at least 2 columns with real labels.

Invalid tree:
${JSON.stringify(tree)}`;

  const raw = await llmGenerate(system, user, false);
  const cleaned = extractJson(raw);
  const repaired = safeJsonParse<ClickthroughNode>(cleaned);
  if (!repaired || !repaired.type) throw new Error("Invalid repaired tree structure");
  return repaired;
}

function normalizeGeneratedUiTree(node: ClickthroughNode): ClickthroughNode {
  const mappedType = mapUnsupportedPrimitive(node.type);
  const props = sanitizeUnknownValue({ ...(node.props || {}) }) as Record<string, unknown>;
  const visibleTextKeys = ["children", "label", "title", "headline", "summary", "body", "message", "reason"];

  for (const key of visibleTextKeys) {
    if (String(props[key] || "").trim().toLowerCase() === "unknown") {
      props[key] = key === "children" || key === "title" || key === "headline" ? "Unverified" : "Needs review";
    }
  }

  for (const key of ["freshness", "date"]) {
    if (String(props[key] || "").toLowerCase() === "unknown") {
      delete props[key];
    }
  }

  if (String(props.quality || "").toLowerCase() === "unknown") {
    props.quality = "medium";
  }

  if (String(props.verdict || "").toLowerCase() === "unknown") {
    props.verdict = "unverified";
  }

  if (mappedType === "Tag" && String(props.label || "").trim().toLowerCase() === "unknown") {
    props.label = "needs review";
  }

  if (mappedType === "SourceQualityBadge" && String(props.quality || "").toLowerCase() === "unknown") {
    props.quality = "medium";
    props.reason = props.reason || "Source quality is not fully established.";
  }

  if (Array.isArray(props.items)) {
    props.items = props.items.map((item) => {
      if (!item || typeof item !== "object") return item;
      const next = { ...(item as Record<string, unknown>) };
      if (String(next.label || "").trim().toLowerCase() === "unknown") {
        next.label = "Needs review";
      }
      if (String(next.freshness || "").toLowerCase() === "unknown") {
        delete next.freshness;
      }
      if (String(next.quality || "").toLowerCase() === "unknown") {
        next.quality = "medium";
      }
      return next;
    });
  }

  if (mappedType === "AlertList" && !Array.isArray(props.items)) props.items = [];
  if (mappedType === "EvidenceStack" && !Array.isArray(props.sources)) props.sources = [];
  if (mappedType === "ComparisonTable") {
    if (!Array.isArray(props.columns)) props.columns = [];
    if (!Array.isArray(props.rows)) props.rows = [];
  }
  if (mappedType === "ScopeMatrix") {
    if (!Array.isArray(props.scopes)) props.scopes = [];
    if (!Array.isArray(props.selectedScopes)) props.selectedScopes = [];
  }
  if (mappedType === "StepList" && !Array.isArray(props.steps)) props.steps = [];
  if (mappedType === "SourceTrail" && !Array.isArray(props.steps)) props.steps = [];
  if (mappedType === "Timeline" && !Array.isArray(props.items)) props.items = [];
  if (mappedType === "Metadata" && !Array.isArray(props.items)) props.items = [];
  if (mappedType === "ProgressBar" && typeof props.value !== "number") props.value = 0;

  if (node.type === "ClaimCard" && typeof props.claim === "string") {
    props.quote = props.claim;
    delete props.claim;
  }

  if (node.type === "ConfidenceMeter") {
    props.value = typeof props.value === "number" ? Math.round(Number(props.value) * (Number(props.value) <= 1 ? 100 : 1)) : 0;
    props.label = props.label || "Confidence";
  }

  if (node.type === "ContradictionList" && Array.isArray(props.items)) {
    props.items = props.items.map((item) =>
      typeof item === "string" ? { message: item, tone: "warning" } : item
    );
  }

  return {
    ...node,
    type: mappedType,
    props,
    children: node.children
      ?.map((child) =>
        typeof child === "string"
          ? ({ type: "BodyText", props: { children: child } } satisfies ClickthroughNode)
          : normalizeGeneratedUiTree(child)
      ),
  };
}

function mapUnsupportedPrimitive(type: string): string {
  const aliases: Record<string, string> = {
    ClaimCard: "InlineQuote",
    VerdictCard: "ConclusionCard",
    ConfidenceMeter: "ProgressBar",
    ContradictionList: "AlertList",
    SourceStack: "EvidenceStack",
    ActionPlan: "StepList",
    GeneratedForm: "ScopeMatrix",
    ReplyDraft: "TextArea",
    ToneSlider: "Slider",
  };
  return aliases[type] || type;
}

function sanitizeUnknownValue(value: unknown): unknown {
  if (typeof value === "string") {
    return value.trim().toLowerCase() === "unknown" ? "Needs review" : value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeUnknownValue);
  }

  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value)) {
      if ((key === "freshness" || key === "date") && String(child).toLowerCase() === "unknown") {
        continue;
      }
      if ((key === "quality" || key === "verdict") && String(child).toLowerCase() === "unknown") {
        result[key] = key === "quality" ? "medium" : "unverified";
        continue;
      }
      result[key] = sanitizeUnknownValue(child);
    }
    return result;
  }

  return value;
}

function assessGeneratedUiQuality(
  root: ClickthroughNode,
  classification: IntentClassification,
  intent: UserIntentPacket
): { valid: true } | { valid: false; errors: string[] } {
  const types = collectNodeTypes(root);
  const text = collectVisibleText(root).join(" ").toLowerCase();
  const errors: string[] = [];

  if (/\bunknown\b/.test(text)) {
    errors.push("Visible UI text still contains the word 'unknown'. Use 'Unverified', 'Needs more evidence', or a specific finding.");
  }

  // Check for dead buttons
  const deadButtons = findDeadButtons(root);
  for (const btn of deadButtons) {
    errors.push(`Button "${btn.label}" is missing a valid actionId. Remove it or assign a valid action.`);
  }

  if (classification.family === "verify") {
    requireType(types, "InlineQuote", "Verify UI must show the extracted claim in InlineQuote.", errors);
    requireType(types, "ConclusionCard", "Verify UI must include a ConclusionCard verdict.", errors);
    requireAnyType(types, ["EvidenceSource", "SourceTrail"], "Verify UI must include source evidence or a source trail.", errors);
    requireAnyType(types, ["AlertList", "UncertaintyNote"], "Verify UI must include concrete findings and uncertainty.", errors);
    requireType(types, "ProgressBar", "Verify UI must include a confidence or credibility meter.", errors);

    if (types.size < 3) {
      errors.push("Verify UI is too sparse; include at least claim, evidence, and verdict.");
    }
  }

  if (isComparisonIntent(intent.prompt)) {
    requireAnyType(types, ["ComparisonTable", "SplitPane"], "Comparison UI must include a populated ComparisonTable or SplitPane.", errors);
    requireAnyType(types, ["ConclusionCard", "Callout"], "Comparison UI must end with a recommendation or decision summary.", errors);
  }

  validateDataBearingNodes(root, errors);

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

function findDeadButtons(node: ClickthroughNode): Array<{ label: string }> {
  const dead: Array<{ label: string }> = [];
  if ((node.type === "Button" || node.type === "IconButton") && !node.props?.actionId) {
    dead.push({ label: String(node.props?.label || node.props?.icon || "unnamed") });
  }
  for (const child of node.children ?? []) {
    dead.push(...findDeadButtons(child));
  }
  return dead;
}

function validateDataBearingNodes(node: ClickthroughNode, errors: string[]): void {
  const props = node.props || {};

  if (node.type === "ComparisonTable") {
    if (!Array.isArray(props.columns) || props.columns.length < 2) {
      errors.push("ComparisonTable must include at least two populated columns.");
    }
    if (!Array.isArray(props.rows) || props.rows.length < 1) {
      errors.push("ComparisonTable must include populated rows with concrete values.");
    }
  }

  if (node.type === "AlertList" && (!Array.isArray(props.items) || props.items.length < 1)) {
    errors.push("AlertList must include at least one concrete finding.");
  }

  if (node.type === "EvidenceStack" && (!Array.isArray(props.sources) || props.sources.length < 1)) {
    errors.push("EvidenceStack must include at least one concrete source.");
  }

  if (node.type === "StepList" && (!Array.isArray(props.steps) || props.steps.length < 2)) {
    errors.push("StepList must include multiple concrete steps.");
  }

  if (node.type === "ScopeMatrix" && (!Array.isArray(props.scopes) || props.scopes.length < 1)) {
    errors.push("ScopeMatrix must include concrete rows from page capabilities or planned scope items.");
  }

  if (node.type === "SourceTrail" && (!Array.isArray(props.steps) || props.steps.length < 2)) {
    errors.push("SourceTrail must include multiple concrete investigation steps.");
  }

  if (node.type === "Timeline" && (!Array.isArray(props.items) || props.items.length < 2)) {
    errors.push("Timeline must include multiple concrete events or phases.");
  }

  for (const child of node.children ?? []) {
    validateDataBearingNodes(child, errors);
  }
}

function collectNodeTypes(node: ClickthroughNode, types = new Set<string>()): Set<string> {
  types.add(node.type);
  for (const child of node.children ?? []) {
    collectNodeTypes(child, types);
  }
  return types;
}

function collectVisibleText(node: ClickthroughNode, text: string[] = []): string[] {
  for (const key of ["children", "label", "title", "headline", "summary", "body", "message", "reason"]) {
    const value = node.props?.[key];
    if (typeof value === "string") text.push(value);
  }

  if (Array.isArray(node.props?.items)) {
    for (const item of node.props.items) {
      if (!item || typeof item !== "object") continue;
      for (const value of Object.values(item as Record<string, unknown>)) {
        if (typeof value === "string") text.push(value);
      }
    }
  }

  for (const child of node.children ?? []) {
    collectVisibleText(child, text);
  }
  return text;
}

function requireType(types: Set<string>, type: string, message: string, errors: string[]): void {
  if (!types.has(type)) errors.push(message);
}

function requireAnyType(types: Set<string>, required: string[], message: string, errors: string[]): void {
  if (!required.some((type) => types.has(type))) errors.push(message);
}

// ── Deterministic Fallback UIs ──

export function deterministicFallbackUi(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): ClickthroughNode {
  return buildMinimalFallback(intent, page, classification, toolResults);
}

function buildMinimalFallback(
  intent: UserIntentPacket,
  page: PageContextPacket,
  classification: IntentClassification,
  toolResults: { search?: WebSearchOutput; fetch?: any }
): ClickthroughNode {
  const sources = toolResults.search?.sources?.slice(0, 3) || [];
  const claim = extractLikelyTargetText(intent, page);
  const family = classification.family;

  const contentChildren: ClickthroughNode[] = [];

  switch (family) {
    case "verify": {
      contentChildren.push({ type: "InlineQuote", props: { quote: claim, source: page.title } });
      if (sources.length > 0) {
        contentChildren.push({
          type: sources.length > 1 ? "Grid" : "Stack",
          props: sources.length > 1 ? { columns: 2, gap: "sm" } : { direction: "vertical", gap: "md" },
          children: sources.map((s) => ({
            type: "EvidenceSource",
            props: {
              title: s.title,
              publisher: s.publisher || safeHostname(s.url),
              url: s.url,
              snippet: s.snippet,
              quality: s.quality || "medium",
            },
          })),
        });
      }
      contentChildren.push({
        type: "ConclusionCard",
        props: {
          verdict: sources.length ? "mixed" : "unverified",
          headline: sources.length ? "Some sources found" : "No sources found",
          confidence: sources.length ? 30 : 10,
        },
      });
      break;
    }
    case "understand": {
      contentChildren.push({ type: "InlineQuote", props: { quote: claim.slice(0, 420), source: page.title } });
      contentChildren.push({
        type: "Stepper",
        props: {
          activeStep: 1,
          steps: [
            { title: "Identify the concept", state: "done" },
            { title: "Break into steps", state: "active" },
            { title: "Summarize takeaway", state: "pending" },
          ],
        },
      });
      break;
    }
    case "respond": {
      contentChildren.push({ type: "InlineQuote", props: { quote: claim.slice(0, 300), source: page.title } });
      contentChildren.push({
        type: "TextArea",
        props: { label: "Draft reply", value: "Draft a reply based on the context above.", rows: 4 },
      });
      break;
    }
    case "act": {
      contentChildren.push({ type: "RiskSummary", props: { riskLevel: "medium", items: [{ label: "Page mutation", level: "medium" }] } });
      contentChildren.push({
        type: "ApprovalGate",
        props: {
          title: "Approve action preparation",
          summary: "Clickthrough will prepare a plan but will NOT execute it.",
          approveLabel: "Prepare plan",
          cancelLabel: "Cancel",
          approvalActionId: "action:approve",
        },
      });
      break;
    }
    case "navigate":
    case "summarize": {
      if (isComparisonIntent(intent.prompt)) {
        contentChildren.push({
          type: "ComparisonTable",
          props: {
            columns: [
              { key: "factor", label: "Factor" },
              { key: "current", label: claim.slice(0, 34) },
              { key: "alternative", label: "Alternative" },
            ],
            rows: [{ factor: "Current context", current: claim.slice(0, 60), alternative: "Search for details" }],
          },
        });
        contentChildren.push({
          type: "ConclusionCard",
          props: { verdict: "mixed", headline: "Comparison prepared", confidence: 35 },
        });
      } else {
        contentChildren.push({ type: "Heading", props: { level: 3, children: page.title } });
        contentChildren.push({ type: "BodyText", props: { children: `You asked: "${intent.prompt}"` } });
        contentChildren.push({
          type: "StepList",
          props: {
            steps: [
              { label: "Summarize what matters on this page" },
              { label: "Prepare the next move without clicking" },
            ],
          },
        });
      }
      break;
    }
    default: {
      contentChildren.push({ type: "BodyText", props: { children: `You asked: "${intent.prompt}"` } });
      contentChildren.push({ type: "BodyText", props: { children: `On page: ${page.title}`, tone: "muted" } });
    }
  }

  return {
    type: "Panel",
    props: { tone: family === "act" ? "warning" : "info", title: getFallbackTitle(family) },
    children: [
      {
        type: "Stack",
        props: { direction: "vertical", gap: "md" },
        children: contentChildren,
      },
    ],
  };
}

function getFallbackTitle(family: IntentFamily): string {
  switch (family) {
    case "verify": return "Verification";
    case "understand": return "Visual Explainer";
    case "respond": return "Response Assistant";
    case "act": return "Action Guidance";
    case "navigate": return "Page Copilot";
    case "summarize": return "Summary";
    default: return "Clickthrough";
  }
}

function safeHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// ── Clarification Prompt ──

export async function generateClarificationPrompt(
  intent: UserIntentPacket,
  page: PageContextPacket
): Promise<ClickthroughNode> {
  return {
    type: "Panel",
    props: { tone: "info", chrome: "standard", title: "What would you like to do?" },
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
        type: "Callout",
        props: {
          title: "Choose an intent",
          body: "Try: \"Verify this claim\", \"Explain this visually\", \"Help me respond\", or \"What can I do here?\"",
          tone: "info",
        },
      },
    ],
  };
}
