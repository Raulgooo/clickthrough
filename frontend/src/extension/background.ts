type JsonFetchMessage = {
  type: "CT_JSON_FETCH";
  url: string;
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  };
};

declare const chrome: any;

type JsonFetchResponse =
  | { ok: true; status: number; statusText: string; body: string }
  | { ok: false; status?: number; statusText?: string; body?: string; error: string };

const ALLOWED_HOSTS = new Set(["api.exa.ai", "openrouter.ai"]);

chrome.runtime.onMessage.addListener((message: JsonFetchMessage, _sender: unknown, sendResponse: (response: JsonFetchResponse) => void) => {
  if (!message || message.type !== "CT_JSON_FETCH") return false;

  void handleJsonFetch(message).then(sendResponse);
  return true;
});

async function handleJsonFetch(message: JsonFetchMessage): Promise<JsonFetchResponse> {
  try {
    const url = new URL(message.url);
    if (!ALLOWED_HOSTS.has(url.hostname)) {
      return { ok: false, error: `Blocked provider host: ${url.hostname}` };
    }

    const response = await fetch(url.toString(), {
      method: message.init?.method || "GET",
      headers: message.init?.headers,
      body: message.init?.body,
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: await response.text(),
      error: response.ok ? "" : `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Provider request failed",
    };
  }
}
