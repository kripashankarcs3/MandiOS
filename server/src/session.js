import { BUYERS } from "./data.js";
import { runPlanner } from "./agents/planner.js";
import { negotiate } from "./agents/negotiation.js";
import { rankDeals } from "./scoring.js";

/** Full agent run: research → plan → parallel negotiations → net ranking. */
export async function runSession(ctx, emit, signal) {
  await emit("status", { phase: "research", text: "Researching the market" });
  const plan = await runPlanner(ctx, emit, signal);
  if (!plan || signal.aborted) return null;
  await emit("plan", { plan });

  await emit("status", { phase: "negotiate", text: `Negotiating with ${BUYERS.length} buyers at once` });
  const results = await Promise.all(BUYERS.map((buyer) => negotiate({ buyer, plan, ctx, emit, signal })));
  if (signal.aborted) return null;
  for (const r of results) await emit("result", r);

  await emit("status", { phase: "decide", text: "Comparing net earnings" });
  const ranked = rankDeals(results, ctx.quantity);
  const best = ranked[0] ?? null;
  const highestPrice = ranked.reduce((a, d) => (!a || d.price > a.price ? d : a), null);
  await emit("decision", {
    ranked,
    bestBuyerId: best?.buyerId ?? null,
    highestPriceBuyerId: highestPrice?.buyerId ?? null,
  });
  return { plan, results, ranked };
}
