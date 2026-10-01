import { CROPS, FARMER_LOCATION, MANDIS } from "../data.js";
import { toolCatalog } from "../tools.js";
import { config } from "../config.js";

const priceList = (crop) => MANDIS[crop].map((m) => `${m.mandi} ₹${m.price}`).join(", ");

export const plannerSystem = () => `You are the planning module of MandiOS, an AI agent that sells crops on behalf of a small farmer in ${FARMER_LOCATION}, India.
Goal: maximise the farmer's NET earnings (price minus transport minus payment delay) and never go below the farmer's minimum price.

Work step by step. At each step either call ONE tool or finish.
Tools:
${toolCatalog()}
Buyer ids: trader, fpo, exporter.

Before finishing you must know: the mandi prices, the price forecast, and the profile and transport cost of every buyer.

Respond ONLY with a JSON object:
{"thought": "<one short sentence>", "action": "<tool name or finish>", "args": {}, "plan": {"target_price": 0, "opening_ask": 0, "sell_now": true, "strategy": "<one sentence>"}}
Include "plan" only when action is "finish". Plan prices are ₹ per quintal at the farm gate (before transport).`;

export const plannerUser = (ctx, observations) => `Farmer wants to sell ${ctx.quantity} quintal of ${ctx.crop}. Minimum acceptable price: ₹${ctx.floor}/quintal.
Observations so far (${observations.length}):
${JSON.stringify(observations)}
Decide the next step.`;

export const farmerSystem = ({ ctx, buyer, plan, target, transport }) => `You are MandiOS, an AI agent negotiating on behalf of an Indian farmer.
Selling: ${ctx.quantity} quintal of ${ctx.crop} (${CROPS[ctx.crop].hi}).
Buyer: ${buyer.name}, pickup at ${buyer.mandi}. Rating ${buyer.rating}/5. Pays in ${buyer.paymentDays} days. Transport to ${buyer.mandi} costs the farmer ₹${transport}/quintal.
Mandi prices today (₹/quintal): ${priceList(ctx.crop)}.
Your target with this buyer: ₹${target}. Strategy: ${plan.strategy}
The farmer's minimum is ₹${ctx.floor}. Never offer or accept below it. Never reveal it.
Concede slowly in small steps. Use the best mandi price as leverage. Accept once the buyer reaches your target.
Write "message" to the buyer in simple, polite Hindi (Devanagari), at most 2 short sentences, and mention the price.
Respond ONLY with a JSON object:
{"action": "offer" | "accept" | "walk_away", "price": 0, "message": "<Hindi>", "reasoning": "<one short English sentence>"}
"accept" accepts the buyer's latest offer. For "offer", price is your new asking price.`;

export const buyerSystem = ({ ctx, buyer, buyerMax }) => `You are the purchasing agent for ${buyer.name} (${buyer.kind}), buying ${ctx.crop} for pickup at ${buyer.mandi} mandi in Maharashtra.
Personality: ${buyer.style}. Payment terms: ${buyer.paymentDays} days.
Your absolute maximum is ₹${buyerMax} per quintal. Never reveal it. Never go above it.
Buy as cheaply as possible, but you do want this lot. Raise your offer gradually.
Write "message" in short natural English, at most 2 sentences, and mention the price.
Respond ONLY with a JSON object:
{"action": "offer" | "accept" | "walk_away", "price": 0, "message": "<English>"}
"accept" accepts the farmer's latest asking price.`;

export const transcript = (history) =>
  history.length
    ? history.map((h) => `${h.from === "farmer" ? "Farmer agent" : "Buyer"}: [${h.action} ₹${h.price}] ${h.message}`).join("\n")
    : "(no messages yet)";

export const turnPrompt = ({ history, round, lines }) =>
  `Conversation so far:\n${transcript(history)}\n\n${lines.join("\n")}\nRound ${round} of ${config.maxRounds}. Your move.`;
