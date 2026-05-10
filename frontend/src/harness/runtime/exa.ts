import type {
  WebSearchInput,
  WebSearchOutput,
  WebFetchInput,
  WebFetchOutput,
  GroundedWebSource,
  WebMediaAsset,
} from "./contracts";
import { providerFetch } from "./providerFetch";

const EXA_BASE = "https://api.exa.ai";

function getApiKey(): string {
  const key = import.meta.env.VITE_EXA_API_KEY;
  if (!key) throw new Error("VITE_EXA_API_KEY is not set");
  return key;
}

function normalizeExaResult(raw: any, _query: string, provider: string): GroundedWebSource {
  const media: WebMediaAsset[] = [];

  if (raw.image) {
    media.push({
      kind: "representative",
      url: raw.image,
      sourceUrl: raw.url,
      provider: "exa",
    });
  }

  if (raw.favicon) {
    media.push({
      kind: "favicon",
      url: raw.favicon,
      sourceUrl: raw.url,
      provider: "exa",
    });
  }

  if (raw.contents?.extras?.imageLinks) {
    for (const url of raw.contents.extras.imageLinks) {
      media.push({
        kind: "page-image",
        url,
        sourceUrl: raw.url,
        provider: "exa",
      });
    }
  }

  return {
    id: raw.id || `${provider}-${Math.random().toString(36).slice(2)}`,
    url: raw.url,
    title: raw.title || "Untitled",
    publisher: raw.author || raw.domain || undefined,
    author: raw.author || undefined,
    publishedDate: raw.publishedDate || undefined,
    retrievedAt: new Date().toISOString(),
    snippet: raw.summary || raw.text?.slice(0, 300) || undefined,
    highlights: raw.highlights?.map((h: string) => ({ text: h, score: undefined })) || undefined,
    score: raw.score || undefined,
    quality: raw.score && raw.score > 0.7 ? "high" : raw.score && raw.score > 0.4 ? "medium" : "medium",
    imageUrl: raw.image || undefined,
    faviconUrl: raw.favicon || undefined,
    media: media.length > 0 ? media : undefined,
    provider: "exa",
    providerResultId: raw.id,
  };
}

export async function exaSearch(input: WebSearchInput): Promise<WebSearchOutput> {
  const key = getApiKey();

  const body: Record<string, unknown> = {
    query: input.query,
    numResults: input.count ?? 5,
    type: input.mode === "news" ? "news" : "auto",
    useAutoprompt: true,
    contents: {
      text: input.includeText !== false ? { maxCharacters: 2000 } : false,
      highlights: input.includeHighlights !== false ? { numSentences: 2, highlightsPerUrl: 2 } : false,
      summary: true,
      extras: {
        imageLinks: input.includeImages !== false ? 3 : 0,
      },
    },
  };

  if (input.includeDomains && input.includeDomains.length > 0) {
    body.includeDomains = input.includeDomains;
  }

  if (input.excludeDomains && input.excludeDomains.length > 0) {
    body.excludeDomains = input.excludeDomains;
  }

  const res = await providerFetch(`${EXA_BASE}/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Exa search failed (${res.status}): ${err}`);
  }

  const data = await res.json();

  return {
    query: input.query,
    provider: "exa",
    requestId: data.requestId,
    retrievedAt: new Date().toISOString(),
    cacheStatus: "miss",
    sources: (data.results || []).map((r: any) => normalizeExaResult(r, input.query, "exa")),
    warnings: data.autopromptString ? [`Autoprompt: ${data.autopromptString}`] : undefined,
  };
}

export async function exaFetch(input: WebFetchInput): Promise<WebFetchOutput> {
  const key = getApiKey();

  const body: Record<string, unknown> = {
    ids: [input.url],
    text: input.includeText !== false ? { maxCharacters: input.maxCharacters ?? 4000 } : false,
    highlights: input.includeHighlights !== false ? { numSentences: 2, highlightsPerUrl: 2 } : false,
    summary: true,
    extras: {
      imageLinks: input.includeImages !== false ? 3 : 0,
    },
  };

  if (input.query) {
    body.query = input.query;
  }

  const res = await providerFetch(`${EXA_BASE}/contents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return {
      status: "error",
      provider: "exa",
      retrievedAt: new Date().toISOString(),
      url: input.url,
      error: {
        code: `exa_${res.status}`,
        message: err,
        retryable: res.status >= 500,
      },
    };
  }

  const data = await res.json();
  const result = (data.results || [])[0];

  if (!result) {
    return {
      status: "error",
      provider: "exa",
      retrievedAt: new Date().toISOString(),
      url: input.url,
      error: {
        code: "exa_no_result",
        message: "No content returned for URL",
        retryable: false,
      },
    };
  }

  return {
    status: "ok",
    provider: "exa",
    requestId: data.requestId,
    retrievedAt: new Date().toISOString(),
    source: normalizeExaResult(result, input.url, "exa"),
    text: result.text || undefined,
    summary: result.summary || undefined,
  };
}
