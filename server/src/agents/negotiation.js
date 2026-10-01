import { config, isLive } from "../config.js";
import { chatJSON } from "../llm.js";
import { CROPS, marketPrice } from "../data.js";
import { transportFor } from "../tools.js";
import { checkBuyerMove, checkFarmerMove } from "../guardrails.js";
import { mockBuyer, mockFarmer } from "./fallback.js";
import { buyerSystem, farmerSystem, turnPrompt } from "./prompts.js";
import { log } from "../logger.js";

/**
 * One farmer-agent vs buyer-agent negotiation.
 * Every move passes through guardrails before it is shown or acted on.
 */
export async function negotiate({ buyer, plan, ctx, emit, signal }) {
  const buyerMax = Math.round(marketPrice(ctx.crop, buyer.mandi) * buyer.maxFactor);
  const transport = transportFor(buyer.mandi).perQuintal;
  const target = plan.target_price + transport; // far buyers must cover the extra transport
  const history = [];
  let fellBack = false;

  const result = (status, extra = {}) => ({ buyerId: buyer.id, status, rounds: history.length, ...extra });

  const useAI = async (label, live, rules) => {
    if (!isLive() || fellBack) return rules();
    try {
      return await live();
    } catch (e) {
      if (signal.aborted) throw e;
      fellBack = true;
      log.warn("negotiation_fallback", { buyer: buyer.id, label, error: e.message });
      await emit("notice", { buyerId: buyer.id, text: `${buyer.name}: AI step failed (${e.message.slice(0, 60)}). Backup rules took over.` });
      return rules();
    }
  };

  if (ctx.quantity < buyer.minQty) {
    await emit("msg", {
      buyerId: buyer.id, from: "buyer", round: 1, action: "walk_away", price: 0,
      message: `We only buy lots of ${buyer.minQty} quintal or more. Sorry.`,
    });
    return result("no_deal", { reason: `Needs at least ${buyer.minQty} quintal` });
  }

  // Farmer agent opens.
  let farmerAsk = plan.opening_ask + transport;
  const opener = {
    from: "farmer", action: "offer", price: farmerAsk,
    message: `नमस्ते। ${ctx.quantity} क्विंटल अच्छी क्वालिटी का ${CROPS[ctx.crop].hi} है। भाव ₹${farmerAsk} प्रति क्विंटल।`,
    reasoning: `Opening above target (₹${target}) to leave room to concede.`,
  };
  history.push(opener);
  await emit("msg", { buyerId: buyer.id, round: 0, ...opener });

  let prevOffer = null;

  for (let round = 1; round <= config.maxRounds; round++) {
    if (signal.aborted) return result("cancelled");

    // ---- Buyer's turn
    const rawBuyer = await useAI(
      "buyer",
      () => chatJSON({
        system: buyerSystem({ ctx, buyer, buyerMax }),
        messages: [{ role: "user", content: turnPrompt({ history, round, lines: [
          `Farmer's latest ask: ₹${farmerAsk}.`,
          `Your previous offer: ${prevOffer == null ? "none" : `₹${prevOffer}`}.`,
        ] }) }],
        temperature: 0.6,
        signal,
      }),
      () => mockBuyer({ buyer, buyerMax, farmerAsk, prevOffer, round }),
    );
    const b = checkBuyerMove(rawBuyer, { buyerMax, farmerAsk, prevOffer });
    history.push({ from: "buyer", ...b });
    await emit("msg", { buyerId: buyer.id, from: "buyer", round, ...b });

    if (b.action === "walk_away") return result("no_deal", { reason: "Buyer walked away" });
    if (b.action === "accept") return result("deal", { price: b.price });
    prevOffer = b.price;

    // ---- Farmer agent's turn
    const rawFarmer = await useAI(
      "farmer",
      () => chatJSON({
        system: farmerSystem({ ctx, buyer, plan, target, transport }),
        messages: [{ role: "user", content: turnPrompt({ history, round, lines: [
          `Buyer's latest offer: ₹${b.price}.`,
          `Your last ask: ₹${farmerAsk}.`,
        ] }) }],
        temperature: 0.5,
        signal,
      }),
      () => mockFarmer({ ctx, target, buyerOffer: b.price, lastAsk: farmerAsk, round }),
    );
    const { move: f, violations } = checkFarmerMove(rawFarmer, { floor: ctx.floor, buyerOffer: b.price, lastAsk: farmerAsk });
    for (const text of violations) await emit("guardrail", { buyerId: buyer.id, round, text });

    history.push({ from: "farmer", ...f });
    await emit("msg", { buyerId: buyer.id, from: "farmer", round, ...f });

    if (f.action === "accept") return result("deal", { price: f.price });
    if (f.action === "walk_away") return result("no_deal", { reason: "Farmer agent walked away" });
    farmerAsk = f.price;
  }

  return result("no_deal", { reason: `No agreement in ${config.maxRounds} rounds` });
}
