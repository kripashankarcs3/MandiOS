/**
 * Rule-based agents. Used when there is no API key, or when an LLM call fails.
 * They follow the same contract and the same guardrails as the AI agents.
 */
import { config } from "../config.js";
import { MANDIS, TREND, BUYERS, MANDI_HI } from "../data.js";

const pick = (list, i) => list[Math.min(i, list.length - 1)];

const BUYER_LINES = {
  trader: [
    (p) => `₹${p}, that's it. Market is weak today.`,
    (p) => `Okay ₹${p}. Cash in your hand right now.`,
    (p) => `₹${p}. Nobody else will pick up today.`,
    (p) => `Last price ₹${p}. Decide fast.`,
  ],
  fpo: [
    (p) => `We can offer ₹${p} per quintal.`,
    (p) => `Let us move to ₹${p}. Fair for both sides.`,
    (p) => `₹${p}, with payment within 7 days.`,
    (p) => `₹${p} is the best we can do.`,
  ],
  exporter: [
    (p) => `For export-grade stock, ₹${p} per quintal.`,
    (p) => `We can go to ₹${p} if the quality is consistent.`,
    (p) => `₹${p}. Payment in 15 days after quality check.`,
    (p) => `₹${p} is our ceiling for this lot.`,
  ],
};

const BUYER_ACCEPT = {
  trader: (p) => `Fine, ₹${p}. Load the truck.`,
  fpo: (p) => `Agreed at ₹${p}. Thank you.`,
  exporter: (p) => `Deal at ₹${p}. Our quality team will come tomorrow.`,
};

export function mockBuyer({ buyer, buyerMax, farmerAsk, prevOffer, round }) {
  const raw = prevOffer == null
    ? buyerMax * buyer.openFactor
    : prevOffer + (buyerMax - prevOffer) * buyer.concession;
  const offer = Math.min(Math.round(raw), buyerMax);

  const closeEnough = farmerAsk <= buyerMax && (
    farmerAsk <= offer * 1.01 || (round >= 3 && farmerAsk - offer <= buyerMax * 0.03)
  );
  if (closeEnough) return { action: "accept", price: farmerAsk, message: BUYER_ACCEPT[buyer.id](farmerAsk) };
  if (round >= config.maxRounds && farmerAsk > buyerMax) {
    return { action: "walk_away", price: offer, message: "That's above what we can pay. We'll pass." };
  }
  return { action: "offer", price: offer, message: pick(BUYER_LINES[buyer.id], round - 1)(offer) };
}

export function mockFarmer({ ctx, target, buyerOffer, lastAsk, round }) {
  const best = MANDIS[ctx.crop].reduce((a, b) => (b.price > a.price ? b : a));
  const accept = (why) => ({
    action: "accept", price: buyerOffer, message: `ठीक है, ₹${buyerOffer} पर सौदा पक्का।`, reasoning: why,
  });

  if (buyerOffer >= target) return accept("Offer meets the target for this buyer.");
  if (round >= config.maxRounds - 1 && buyerOffer >= Math.max(ctx.floor, Math.round(target * 0.97))) {
    return accept("Late round and offer is within 3% of target.");
  }
  if (round >= config.maxRounds) {
    return buyerOffer >= ctx.floor
      ? accept("Final round, offer is above the farmer's minimum.")
      : { action: "walk_away", price: lastAsk, message: "इस भाव पर नहीं बेचेंगे। धन्यवाद।", reasoning: "Buyer never reached the minimum." };
  }

  const next = Math.max(ctx.floor, Math.round(lastAsk - (lastAsk - buyerOffer) * 0.3));
  if (next <= buyerOffer) return accept("Buyer's offer already meets my next ask.");

  const lines = [
    `${MANDI_HI[best.mandi] ?? best.mandi} मंडी में आज भाव ₹${best.price} है। ₹${next} से कम नहीं।`,
    `माल अच्छी क्वालिटी का है। ₹${next} दीजिए।`,
    `थोड़ा और बढ़ाइए, ₹${next} पर बात बन सकती है।`,
    `₹${next} आख़िरी भाव समझिए।`,
  ];
  const reasons = [
    `Buyer opened low at ₹${buyerOffer}. Anchoring on ${best.mandi}'s ₹${best.price}, small step down to ₹${next}.`,
    `Gap is ₹${lastAsk - buyerOffer}. Conceding 30% of it; target with this buyer is ₹${target}.`,
    `Buyer is moving. Holding near target ₹${target}, asking ₹${next}.`,
    `Running out of rounds. Signalling a final price of ₹${next}.`,
  ];
  return { action: "offer", price: next, message: pick(lines, round - 1), reasoning: pick(reasons, round - 1) };
}

/** Deterministic plan from market data. Also used to sanity-check the AI planner. */
export function computePlan(ctx) {
  const markets = MANDIS[ctx.crop];
  const avg = markets.reduce((s, m) => s + m.price, 0) / markets.length;
  const best = markets.reduce((a, b) => (b.price > a.price ? b : a));
  const trend = TREND[ctx.crop] ?? 0;
  const target = Math.round(Math.max(ctx.floor * 1.05, avg));
  const opening = Math.round(Math.max(target * 1.1, best.price * 1.05));
  return {
    target_price: target,
    opening_ask: opening,
    sell_now: trend < 4,
    trend_pct_7d: trend,
    best_market: best,
    strategy: `Anchor on ${best.mandi}'s ₹${best.price}, ask far buyers to cover transport, concede slowly.`,
  };
}

/** The steps the scripted planner walks through, mirroring what the AI planner does. */
export function plannerScript(ctx) {
  return [
    { thought: `Checking today's ${ctx.crop} prices in nearby mandis.`, tool: "get_mandi_prices", args: { crop: ctx.crop } },
    { thought: "Checking whether prices will rise or fall this week.", tool: "get_price_forecast", args: { crop: ctx.crop } },
    ...BUYERS.flatMap((b) => [
      { thought: `Looking up ${b.name}: rating and payment terms.`, tool: "check_buyer_profile", args: { buyer_id: b.id } },
      { thought: `Estimating transport cost to ${b.mandi}.`, tool: "estimate_transport_cost", args: { mandi: b.mandi, quantity: ctx.quantity } },
    ]),
  ];
}
