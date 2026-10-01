import { config, isLive } from "../config.js";
import { chatJSON } from "../llm.js";
import { runTool } from "../tools.js";
import { plannerSystem, plannerUser } from "./prompts.js";
import { computePlan, plannerScript } from "./fallback.js";
import { log } from "../logger.js";

const REQUIRED_TOOLS = ["get_mandi_prices", "check_buyer_profile", "estimate_transport_cost"];

function finalizePlan(aiPlan, ctx) {
  const base = computePlan(ctx);
  const best = base.best_market.price;
  const num = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : NaN);

  let target = num(aiPlan?.target_price);
  if (!(target >= ctx.floor && target <= best * 1.3)) target = base.target_price;
  let opening = num(aiPlan?.opening_ask);
  if (!(opening >= target * 1.03 && opening <= best * 1.4)) opening = Math.round(Math.max(target * 1.1, base.opening_ask));

  return {
    ...base,
    target_price: target,
    opening_ask: opening,
    sell_now: typeof aiPlan?.sell_now === "boolean" ? aiPlan.sell_now : base.sell_now,
    strategy: typeof aiPlan?.strategy === "string" && aiPlan.strategy.trim() ? aiPlan.strategy.trim().slice(0, 220) : base.strategy,
    source: "ai",
  };
}

async function scripted(ctx, emit, signal) {
  for (const step of plannerScript(ctx)) {
    if (signal.aborted) return null;
    await emit("thought", { text: step.thought });
    await emit("tool", { name: step.tool, args: step.args, result: runTool(step.tool, step.args) });
  }
  const plan = { ...computePlan(ctx), source: "rules" };
  await emit("thought", {
    text: `Best price is ₹${plan.best_market.price} at ${plan.best_market.mandi}. Target ₹${plan.target_price}, opening at ₹${plan.opening_ask}.`,
  });
  return plan;
}

/** ReAct-style loop: think → call a tool → observe → repeat → finish with a plan. */
export async function runPlanner(ctx, emit, signal) {
  if (!isLive()) return scripted(ctx, emit, signal);

  const observations = [];
  try {
    for (let step = 1; step <= config.maxPlannerSteps; step++) {
      if (signal.aborted) return null;
      const move = await chatJSON({
        system: plannerSystem(),
        messages: [{ role: "user", content: plannerUser(ctx, observations) }],
        temperature: 0.2,
        signal,
      });
      if (move?.thought) await emit("thought", { text: String(move.thought).slice(0, 240) });

      if (move?.action === "finish") {
        const used = new Set(observations.map((o) => o.tool));
        const missing = REQUIRED_TOOLS.filter((t) => !used.has(t));
        if (missing.length) {
          observations.push({ note: `Cannot finish yet. Still need: ${missing.join(", ")}.` });
          continue;
        }
        return finalizePlan(move.plan, ctx);
      }

      const args = move?.args && typeof move.args === "object" ? move.args : {};
      const result = runTool(move?.action, args);
      observations.push({ tool: move?.action, args, result });
      await emit("tool", { name: String(move?.action), args, result });
    }
    await emit("notice", { text: "Planner reached its step limit. Using the rule-based plan." });
    return { ...computePlan(ctx), source: "rules" };
  } catch (e) {
    if (signal.aborted) return null;
    log.warn("planner_fallback", { error: e.message });
    await emit("notice", { text: `AI planner unavailable (${e.message.slice(0, 60)}). Switched to the backup planner.` });
    return scripted(ctx, emit, signal);
  }
}
