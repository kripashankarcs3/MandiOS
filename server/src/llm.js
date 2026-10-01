import { config } from "./config.js";

const chatUrl = () => `${config.llmBaseUrl.replace(/\/+$/, "")}/chat/completions`;

export class LLMError extends Error {}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function parseJSON(text) {
  const cleaned = String(text ?? "").replace(/```json|```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* fall through */ }
    }
    throw new LLMError("Model returned invalid JSON");
  }
}

async function once({ system, messages, temperature, signal }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.llmTimeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(chatUrl(), {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${config.llmKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: config.llmModel,
        temperature,
        max_tokens: 500,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const err = new LLMError(`LLM ${res.status}: ${body.slice(0, 160)}`);
      err.retryable = res.status === 429 || res.status >= 500;
      // Free tiers have small tokens-per-minute limits; honour the server's hint (capped).
      const hint = Number(res.headers.get("retry-after"));
      err.retryAfterMs = Number.isFinite(hint) && hint > 0 ? Math.min(hint * 1000, 6000) : 800;
      throw err;
    }
    const data = await res.json();
    return parseJSON(data?.choices?.[0]?.message?.content);
  } catch (e) {
    if (e.name === "AbortError") {
      throw new LLMError(signal?.aborted ? "Cancelled" : "Model timed out");
    }
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** One JSON completion, with a single retry on rate limits / server errors. */
export async function chatJSON({ system, messages, temperature = 0.4, signal }) {
  try {
    return await once({ system, messages, temperature, signal });
  } catch (e) {
    if (!e.retryable || signal?.aborted) throw e;
    await sleep(e.retryAfterMs ?? 800);
    return once({ system, messages, temperature, signal });
  }
}
