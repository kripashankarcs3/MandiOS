import { CROPS, MANDIS, TREND, DISTANCE_KM, COST_PER_QUINTAL_PER_KM } from "./data.js";

/**
 * SAMPLE market outlook for one crop: a week of recent prices, a 7-day forecast with a widening
 * uncertainty band, and today's prices net of transport per mandi. Everything is derived from the
 * sample MANDIS and TREND tables, deterministically, so the same crop always gives the same chart.
 * Swap this for real eNAM / Agmarknet history and a real model without touching the client.
 */
const REF_MANDI = "Nashik";
const wobble = (i, seed) => Math.sin(i * 1.7 + seed) * 0.004;
const round = (n) => Math.round(n);

export function isCrop(crop) {
  return Object.hasOwn(CROPS, crop);
}

export function buildOutlook(crop) {
  if (!isCrop(crop)) return null;
  const markets = MANDIS[crop];
  const today = markets.find((m) => m.mandi === REF_MANDI)?.price ?? round(markets.reduce((s, m) => s + m.price, 0) / markets.length);
  const trendPct = TREND[crop];
  const seed = crop.length;

  // Recent week: drifts gently into today's price.
  const history = [];
  for (let d = -7; d <= 0; d += 1) {
    const drift = -trendPct * 0.01 * 0.35 * (-d / 7);
    history.push({ day: d, price: round(today * (1 + drift + (d === 0 ? 0 : wobble(d, seed)))) });
  }

  // Next week: moves toward the expected trend, band widens with the horizon.
  const forecast = [];
  for (let d = 1; d <= 7; d += 1) {
    const eased = 1 - (1 - d / 7) ** 1.6;
    const price = today * (1 + (trendPct / 100) * eased + wobble(d + 9, seed) * 0.6);
    const band = today * (0.008 + d * 0.0035);
    forecast.push({ day: d, price: round(price), low: round(price - band), high: round(price + band) });
  }

  const endPrice = forecast[forecast.length - 1].price;
  const gainPerQuintal = endPrice - today;
  const peak = forecast.reduce((best, p) => (p.price > best.price ? p : best), forecast[0]);
  let action = "either";
  let headline = "Prices look stable this week";
  if (trendPct >= 4) { action = "wait"; headline = "Prices are rising, waiting a few days may pay more"; }
  else if (trendPct <= -3) { action = "sell_now"; headline = "Prices are falling, selling soon is safer"; }

  const byMandi = markets.map((m) => {
    const km = DISTANCE_KM[m.mandi] ?? 100;
    const transport = round(km * COST_PER_QUINTAL_PER_KM);
    return { mandi: m.mandi, price: m.price, km, transport, net: m.price - transport };
  });

  return {
    crop,
    label: CROPS[crop].label,
    hi: CROPS[crop].hi,
    unit: "₹/quintal",
    referenceMandi: REF_MANDI,
    today,
    trendPct,
    history,
    forecast,
    verdict: { action, headline, endPrice, gainPerQuintal, peakDay: peak.day },
    mandis: byMandi,
    sample: true,
  };
}
