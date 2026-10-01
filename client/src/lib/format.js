export const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

export const inr = (n) =>
  Number.isFinite(Number(n)) ? `₹${Math.round(Number(n)).toLocaleString("en-IN")}` : "₹–";

export const paymentText = (days) => (days === 0 ? "Pays cash today" : `Pays in ${days} days`);

export const FALLBACK_CROPS = [
  { id: "onion", label: "Onion", hi: "प्याज" },
  { id: "tomato", label: "Tomato", hi: "टमाटर" },
  { id: "soybean", label: "Soybean", hi: "सोयाबीन" },
  { id: "wheat", label: "Wheat", hi: "गेहूं" },
  { id: "cotton", label: "Cotton", hi: "कपास" },
];

export const DEFAULT_FLOOR = { onion: 1700, tomato: 1150, soybean: 4100, wheat: 2300, cotton: 6600 };

export const TOOL_LABELS = {
  get_mandi_prices: "Checked mandi prices",
  get_price_forecast: "Checked 7-day price trend",
  check_buyer_profile: "Checked buyer profile",
  estimate_transport_cost: "Estimated transport cost",
};

export const BUYER_IMG = {
  trader: "/img/market-stall.jpg",
  fpo: "/img/collective.jpg",
  exporter: "/img/port.jpg",
};

// Used only when /api/meta is unreachable, so the landing page never looks empty. Sample data.
export const FALLBACK_BUYERS = [
  { id: "trader", name: "Ramesh Traders", kind: "Local commission agent", mandi: "Lasalgaon", rating: 3.6, paymentDays: 0, transportPerQuintal: 14 },
  { id: "fpo", name: "Sahyadri FPO Collective", kind: "Farmer producer organisation", mandi: "Nashik", rating: 4.5, paymentDays: 7, transportPerQuintal: 42 },
  { id: "exporter", name: "GreenLeaf Exports", kind: "Exporter", mandi: "Pune", rating: 4.1, paymentDays: 15, transportPerQuintal: 252 },
];

export const STEPS = ["Research", "Plan", "Bargain", "Compare", "Approve"];
