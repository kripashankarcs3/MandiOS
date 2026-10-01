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

/**
 * Token pacing. Free tiers cap tokens per minute and one negotiation needs more than a minute's quota,
 * so instead of hitting 429 and dropping to backup rules we wait for the bucket to refill.
 * Each API key (config.llmKeys) has its own bucket and every call goes to the key with the most quota left.
 * Pacing activates only when the provider reports its limit in response headers (Groq does).
 */
const NEED = 800; // rough tokens per call (measured average is ~610, plus headroom)
const buckets = new Map(config.llmKeys.map((k) => [k, { limit: 0, tokens: 0, at: Date.now() }]));

function refill(b) {
  const now = Date.now();
  if (b.limit) b.tokens = Math.min(b.limit, b.tokens + ((now - b.at) / 60000) * b.limit);
  b.at = now;
}

/** Waits until some key has quota, reserves it, and returns that key. */
async function gate(signal) {
  for (;;) {
    let best = null;
    let soonest = Infinity;
    for (const [key, b] of buckets) {
      if (!b.limit) { best = best ?? { key, b, unknown: true }; continue; } // not measured yet: send and learn
      refill(b);
      if (b.tokens >= NEED && (!best || best.unknown || b.tokens > best.b.tokens)) best = { key, b };
      soonest = Math.min(soonest, Math.ceil(((NEED - b.tokens) / b.limit) * 60000) + 50);
    }
    if (best) {
      if (!best.unknown) best.b.tokens -= NEED;
      return best.key;
    }
    if (signal?.aborted) return config.llmKeys[0];
    await sleep(Math.min(Number.isFinite(soonest) ? soonest : 500, 5000));
  }
}

function learn(key, res, used) {
  const b = buckets.get(key);
  const limit = Number(res.headers.get("x-ratelimit-limit-tokens"));
  const left = Number(res.headers.get("x-ratelimit-remaining-tokens"));
  if (!b || !Number.isFinite(limit) || limit <= 0 || !Number.isFinite(left)) return;
  refill(b);
  if (!b.limit) b.tokens = left;
  b.limit = limit;
  if (used != null) b.tokens += NEED - used; // refund the unused part of the reservation
  b.tokens = Math.min(b.tokens, left);
}

async function once({ key, model, system, messages, temperature, signal }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.llmTimeoutMs);
  const onAbort = () => ctrl.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    const res = await fetch(chatUrl(), {
      method: "POST",
      signal: ctrl.signal,
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, ...messages],
      }),
    });
    if (!res.ok) {
      learn(key, res, null);
      const body = await res.text().catch(() => "");
      const err = new LLMError(`LLM ${res.status}: ${body.slice(0, 160)}`);
      // 400 json_validate_failed = the model's JSON was cut off or malformed; a fresh attempt usually works.
      err.retryable = res.status === 429 || res.status >= 500 || (res.status === 400 && /json_validate_failed|Failed to generate JSON/i.test(body));
      // Free tiers have small tokens-per-minute limits; honour the server's hint (capped).
      const hint = Number(res.headers.get("retry-after"));
      err.retryAfterMs = Number.isFinite(hint) && hint > 0 ? Math.min(hint * 1000, 6000) : 800;
      throw err;
    }
    const data = await res.json();
    learn(key, res, data?.usage?.total_tokens);
    return parseJSON(data?.choices?.[0]?.message?.content);
  } catch (e) {
    if (e.name === "AbortError") {
      const err = new LLMError(signal?.aborted ? "Cancelled" : "Model timed out");
      err.timeout = !signal?.aborted;
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/**
 * One JSON completion. On a 429 / bad JSON / timeout we move on to the next configured model
 * (LLM_FALLBACK_MODELS, optional) before giving up. With a single model it retries that one once.
 */
export async function chatJSON({ system, messages, temperature = 0.4, signal }) {
  const models = [config.llmModel, ...config.llmFallbackModels];
  let lastErr;
  for (let i = 0; i < models.length; i++) {
    try {
      const key = await gate(signal);
      return await once({ key, model: models[i], system, messages, temperature, signal });
    } catch (e) {
      lastErr = e;
      if (signal?.aborted || !(e.retryable || e.timeout)) throw e;
      const more = i < models.length - 1;
      if (!more && e.retryable) {
        await sleep(e.retryAfterMs ?? 800);
        const key = await gate(signal);
        return once({ key, model: models[0], system, messages, temperature, signal });
      }
    }
  }
  throw lastErr;
}
