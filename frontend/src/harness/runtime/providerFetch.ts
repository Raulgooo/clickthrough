type ExtensionFetchResponse =
  | { ok: true; status: number; statusText: string; body: string }
  | { ok: false; status?: number; statusText?: string; body?: string; error: string };

type ProviderFetchInit = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export async function providerFetch(url: string, init: ProviderFetchInit): Promise<Response> {
  const runtime = (globalThis as any).chrome?.runtime;
  const extensionId = runtime?.id;

  if (runtime?.sendMessage && extensionId) {
    const response = await new Promise<ExtensionFetchResponse>((resolve, reject) => {
      runtime.sendMessage(
        {
          type: "CT_JSON_FETCH",
          url,
          init,
        },
        (result: ExtensionFetchResponse) => {
          const lastError = runtime.lastError;
          if (lastError) {
            reject(new Error(lastError.message));
            return;
          }
          resolve(result);
        }
      );
    });

    const error = response.ok ? "" : response.error;

    return new Response(response.body || "", {
      status: response.status || (response.ok ? 200 : 502),
      statusText: response.statusText || error || "Provider fetch failed",
      headers: { "Content-Type": "application/json" },
    });
  }

  return fetch(url, init);
}
