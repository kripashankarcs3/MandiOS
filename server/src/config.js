import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(here, "../.env") });
dotenv.config({ path: path.resolve(here, "../../.env") });

const num = (value, fallback) => {
  const n = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(n) ? n : fallback;
};

export const config = Object.freeze({
  port: num(process.env.PORT, 3001),
  nodeEnv: process.env.NODE_ENV || "development",
  // Any OpenAI-compatible provider works (Groq default, OpenCode Zen, etc.).
  llmBaseUrl: process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1",
  llmKey: process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "",
  // Extra keys (comma-separated LLM_API_KEYS / GROQ_API_KEYS) share the load; each has its own rate-limit bucket.
  llmKeys: [...new Set([
    process.env.LLM_API_KEY || process.env.GROQ_API_KEY || "",
    ...(process.env.LLM_API_KEYS || process.env.GROQ_API_KEYS || "").split(","),
  ].map((k) => k.trim()).filter(Boolean))],
  // With a custom base URL (e.g. OpenCode Zen) the Groq model names don't apply; default to its free model.
  llmModel: process.env.LLM_MODEL
    || (process.env.LLM_BASE_URL ? "big-pickle" : process.env.GROQ_MODEL || "qwen/qwen3.8-27b"),
  // Optional, comma-separated. Tried in order when the main model is rate-limited, times out or returns bad JSON.
  // Off by default: on Groq's free tier the token quota is shared across models, so switching does not help.
  llmFallbackModels: (process.env.LLM_FALLBACK_MODELS || "")
    .split(",").map((m) => m.trim()).filter(Boolean),
  llmTimeoutMs: num(process.env.LLM_TIMEOUT_MS, 15000),
  eventDelayMs: num(process.env.EVENT_DELAY_MS, 550),
  forceOffline: process.env.FORCE_OFFLINE === "1",
  corsOrigin: process.env.CORS_ORIGIN || "",
  maxRounds: 6,
  maxPlannerSteps: 10,
});

/** Live mode = real LLM agents. Offline mode = rule-based agents (demo never breaks). */
export function isLive() {
  return Boolean(config.llmKey) && !config.forceOffline;
}
