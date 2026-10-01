import {
  MANDIS, TREND, DISTANCE_KM, COST_PER_QUINTAL_PER_KM, FARMER_LOCATION, getBuyer, publicBuyer,
} from "./data.js";

const norm = (s) => String(s ?? "").toLowerCase().trim();
const findMandi = (name) => Object.keys(DISTANCE_KM).find((m) => norm(m) === norm(name));

export function transportFor(mandi) {
  const km = DISTANCE_KM[mandi] ?? 100;
  return { km, perQuintal: Math.round(km * COST_PER_QUINTAL_PER_KM) };
}

export const TOOLS = {
  get_mandi_prices: {
    params: '{"crop": string}',
    description: "Today's modal price (₹/quintal) for the crop in nearby mandis.",
    run: ({ crop }) => {
      const markets = MANDIS[norm(crop)];
      if (!markets) return { error: `Unknown crop "${crop}"` };
      return { crop: norm(crop), unit: "₹/quintal", markets };
    },
  },
  get_price_forecast: {
    params: '{"crop": string}',
    description: "Expected price change over the next 7 days.",
    run: ({ crop }) => {
      const c = norm(crop);
      if (!(c in TREND)) return { error: `Unknown crop "${crop}"` };
      const t = TREND[c];
      const note = t > 4 ? "Prices rising. Waiting a week may pay more."
        : t < -3 ? "Prices falling. Selling soon is safer."
        : "Prices stable this week.";
      return { crop: c, trend_pct_7d: t, note };
    },
  },
  check_buyer_profile: {
    params: '{"buyer_id": "trader" | "fpo" | "exporter"}',
    description: "Buyer's rating, payment terms, pickup mandi and minimum quantity.",
    run: ({ buyer_id }) => {
      const b = getBuyer(norm(buyer_id));
      return b ? publicBuyer(b) : { error: `Unknown buyer "${buyer_id}"` };
    },
  },
  estimate_transport_cost: {
    params: '{"mandi": string, "quantity": number}',
    description: "Cost to move the crop from the farmer's village to a mandi.",
    run: ({ mandi, quantity }) => {
      const m = findMandi(mandi);
      if (!m) return { error: `Unknown mandi "${mandi}"` };
      const q = Math.max(0, Number(quantity) || 0);
      const t = transportFor(m);
      return { from: FARMER_LOCATION, mandi: m, km: t.km, per_quintal: t.perQuintal, total: t.perQuintal * q };
    },
  },
};

export function runTool(name, args) {
  const tool = TOOLS[name];
  if (!tool) return { error: `Unknown tool "${name}"` };
  try {
    return tool.run(args && typeof args === "object" ? args : {});
  } catch (e) {
    return { error: e.message };
  }
}

export const toolCatalog = () =>
  Object.entries(TOOLS).map(([n, t]) => `- ${n}(${t.params}): ${t.description}`).join("\n");
