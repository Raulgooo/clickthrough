import type {
  DomElementSummary,
  PageCapabilitySummary,
  StructuredPageContext,
  PageType,
} from "@/harness/runtime";

export type DomScanResult = {
  visibleText: string;
  selectedText?: string;
  elements: DomElementSummary[];
  capabilities: PageCapabilitySummary[];
  pageType: PageType;
  pageTypeConfidence: number;
  structured: StructuredPageContext;
};

const INTERACTIVE_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "[role='button']",
  "[role='link']",
  "[role='menuitem']",
  "[contenteditable='true']",
].join(",");

export function scanDom(root: ParentNode = document): DomScanResult {
  const elements = Array.from(root.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR))
    .filter(isVisible)
    .slice(0, 120)
    .map(toElementSummary);

  const pageType = classifyPageType(document, window.location.href);
  const structured = extractStructuredContext(document, window.location.href, pageType.type, pageType.confidence);

  return {
    visibleText: summarizeVisibleText(document.body?.innerText ?? ""),
    selectedText: window.getSelection()?.toString() || undefined,
    elements,
    capabilities: elements.map(toCapability),
    pageType: pageType.type,
    pageTypeConfidence: pageType.confidence,
    structured,
  };
}

// ── Page Type Classification ──

function classifyPageType(doc: Document, url: string): { type: PageType; confidence: number } {
  const host = new URL(url).hostname.toLowerCase();
  const title = doc.title.toLowerCase();
  const bodyText = doc.body?.innerText?.toLowerCase() ?? "";

  // Twitter / X
  if (host.includes("twitter.com") || host.includes("x.com")) {
    const hasTweet = doc.querySelector('[data-testid="tweet"], article[role="article"]') !== null;
    return { type: "twitter", confidence: hasTweet ? 0.95 : 0.7 };
  }

  // Chat platforms
  if (
    host.includes("slack.com") ||
    host.includes("discord.com") ||
    host.includes("whatsapp.com") ||
    host.includes("messenger.com") ||
    host.includes("teams.microsoft")
  ) {
    const hasMessages = doc.querySelectorAll('[role="listitem"], .message, .chat-message, [data-testid="message"]').length > 3;
    return { type: "chat", confidence: hasMessages ? 0.9 : 0.6 };
  }

  // PDF
  if (url.endsWith(".pdf") || title.includes("pdf") || doc.querySelector("embed[type='application/pdf']") !== null) {
    return { type: "pdf", confidence: 0.9 };
  }

  // Dashboard / Admin
  const hasManyInputs = doc.querySelectorAll("input, select, textarea").length > 8;
  const hasTables = doc.querySelectorAll("table").length > 2;
  const hasCharts = doc.querySelectorAll("canvas, svg, [class*='chart'], [class*='graph']").length > 1;
  if ((hasManyInputs && hasTables) || hasCharts || bodyText.includes("dashboard") || bodyText.includes("admin")) {
    return { type: "dashboard", confidence: 0.75 };
  }

  // E-commerce
  if (
    host.includes("amazon") ||
    host.includes("shop") ||
    host.includes("store") ||
    doc.querySelectorAll("[class*='price'], [class*='product'], [class*='cart']").length > 3
  ) {
    return { type: "ecommerce", confidence: 0.7 };
  }

  // Article / Blog
  const hasArticle = doc.querySelector("article, [role='article'], .post, .entry") !== null;
  const hasHeadings = doc.querySelectorAll("h1, h2, h3").length > 2;
  if (hasArticle || hasHeadings) {
    return { type: "article", confidence: 0.7 };
  }

  return { type: "generic", confidence: 0.5 };
}

// ── Structured Context Extraction ──

function extractStructuredContext(doc: Document, url: string, pageType: PageType, confidence: number): StructuredPageContext {
  const title = doc.title || "Untitled page";
  const summary = extractPageSummary(doc);

  const base: StructuredPageContext = {
    pageType,
    url,
    title,
    summary,
    selectedText: window.getSelection()?.toString() || undefined,
  };

  if (pageType === "twitter" && confidence > 0.6) {
    const tweet = extractTweet(doc);
    if (tweet) base.tweet = tweet;
  }

  if (pageType === "article" && confidence > 0.6) {
    const article = extractArticle(doc);
    if (article) base.article = article;
  }

  if (pageType === "chat" && confidence > 0.6) {
    const chat = extractChat(doc);
    if (chat) base.chat = chat;
  }

  if (pageType === "dashboard" && confidence > 0.6) {
    const dashboard = extractDashboard(doc);
    if (dashboard) base.dashboard = dashboard;
  }

  return base;
}

function extractTweet(doc: Document): { authorName: string; authorHandle: string; text: string; timestamp?: string } | undefined {
  const tweetEl = doc.querySelector('[data-testid="tweet"], article[role="article"]');
  if (!tweetEl) return undefined;

  const authorNameEl = tweetEl.querySelector('[data-testid="User-Name"] a, a[role="link"]');
  const authorHandleEl = tweetEl.querySelector('a[href^="/"]');
  const textEl = tweetEl.querySelector('[data-testid="tweetText"], div[lang]');
  const timeEl = tweetEl.querySelector('time');

  const text = textEl?.textContent?.trim() || "";
  if (!text) return undefined;

  return {
    authorName: authorNameEl?.textContent?.trim() || "Unknown",
    authorHandle: authorHandleEl?.getAttribute("href")?.replace("/", "@") || "@unknown",
    text,
    timestamp: timeEl?.textContent?.trim() || timeEl?.getAttribute("datetime") || undefined,
  };
}

function extractArticle(doc: Document): { title: string; author?: string; publishDate?: string; headings: Array<{ level: number; text: string }>; mainContent: string } | undefined {
  const title = doc.querySelector("h1, [class*='title'], [class*='headline']")?.textContent?.trim() || doc.title;
  const author = doc.querySelector('[class*="author"], [class*="byline"], [rel="author"]')?.textContent?.trim() || undefined;
  const dateEl = doc.querySelector("time, [class*='date'], [class*='published']");
  const publishDate = dateEl?.getAttribute("datetime") || dateEl?.textContent?.trim() || undefined;

  const headings = Array.from(doc.querySelectorAll("h1, h2, h3")).map((h) => ({
    level: parseInt(h.tagName[1]),
    text: h.textContent?.trim() || "",
  }));

  const articleEl = doc.querySelector("article, [role='article'], .post, .entry, main");
  const mainContent = articleEl?.textContent?.trim().slice(0, 2000) || doc.body?.innerText?.trim().slice(0, 2000) || "";

  return {
    title,
    author,
    publishDate,
    headings: headings.slice(0, 10),
    mainContent,
  };
}

function extractChat(doc: Document): { messages: Array<{ sender: string; text: string; timestamp?: string }> } | undefined {
  const messageEls = doc.querySelectorAll('[role="listitem"], .message, .chat-message, [data-testid="message"], [class*="message"]');
  if (messageEls.length < 2) return undefined;

  const messages = Array.from(messageEls).slice(-10).map((el) => ({
    sender: el.querySelector('[class*="sender"], [class*="author"], [class*="name"]')?.textContent?.trim() || "Unknown",
    text: el.textContent?.trim().slice(0, 300) || "",
    timestamp: el.querySelector("time")?.textContent?.trim() || undefined,
  }));

  return { messages };
}

function extractDashboard(doc: Document): { widgets: Array<{ type: string; label: string }>; forms: Array<{ name: string; fields: string[]; submitLabel?: string }>; tables: Array<{ name: string; headers: string[]; rowCount: number }> } | undefined {
  const forms = Array.from(doc.querySelectorAll("form")).map((form) => ({
    name: form.getAttribute("aria-label") || form.getAttribute("name") || "Form",
    fields: Array.from(form.querySelectorAll("input, select, textarea")).map((f) => {
      const el = f as HTMLElement;
      return (
        el.getAttribute("aria-label") ||
        el.getAttribute("placeholder") ||
        el.getAttribute("name") ||
        el.tagName.toLowerCase()
      );
    }),
    submitLabel: form.querySelector("button[type='submit'], input[type='submit']")?.textContent?.trim() || undefined,
  }));

  const tables = Array.from(doc.querySelectorAll("table")).map((table) => ({
    name: table.getAttribute("aria-label") || "Table",
    headers: Array.from(table.querySelectorAll("th")).map((th) => th.textContent?.trim() || ""),
    rowCount: table.querySelectorAll("tr").length,
  }));

  const widgets = Array.from(doc.querySelectorAll("[class*='card'], [class*='widget'], [class*='panel'], [class*='stat']")).map((w) => ({
    type: "widget",
    label: w.getAttribute("aria-label") || w.textContent?.trim().slice(0, 50) || "Widget",
  }));

  return { widgets, forms, tables };
}

function extractPageSummary(doc: Document): string {
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute("content");
  if (metaDesc) return metaDesc.slice(0, 300);

  const firstParagraph = doc.querySelector("p")?.textContent?.trim();
  if (firstParagraph) return firstParagraph.slice(0, 300);

  return doc.body?.innerText?.trim().slice(0, 300) || "";
}

// ── Element Summary ──

function toElementSummary(element: HTMLElement, index: number): DomElementSummary {
  const id = element.dataset.ctElementId || `ct-el-${index}`;
  element.dataset.ctElementId = id;
  const rect = element.getBoundingClientRect();

  return {
    id,
    tagName: element.tagName.toLowerCase(),
    role: element.getAttribute("role") ?? undefined,
    label: getAccessibleLabel(element),
    text: element.innerText?.trim() || undefined,
    type: element.getAttribute("type") ?? undefined,
    href: element instanceof HTMLAnchorElement ? element.href : undefined,
    value: element instanceof HTMLInputElement ? element.value : undefined,
    visible: true,
    disabled: "disabled" in element && Boolean(element.getAttribute("disabled")),
    bounds: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
  };
}

function toCapability(element: DomElementSummary): PageCapabilitySummary {
  return {
    id: `cap-${element.id}`,
    label: element.label || element.text || element.tagName,
    kind: inferKind(element),
    elementIds: [element.id],
    confidence: element.label ? 0.85 : 0.55,
  };
}

function inferKind(element: DomElementSummary): PageCapabilitySummary["kind"] {
  if (element.tagName === "a") return "link";
  if (element.tagName === "button" || element.role === "button") return "button";
  if (element.tagName === "select") return "select";
  if (["input", "textarea"].includes(element.tagName)) return "input";
  return "unknown";
}

function getAccessibleLabel(element: HTMLElement): string {
  return (
    element.getAttribute("aria-label") ||
    element.getAttribute("title") ||
    element.innerText ||
    element.getAttribute("placeholder") ||
    element.getAttribute("name") ||
    ""
  ).trim();
}

function isVisible(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function summarizeVisibleText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 4000);
}
