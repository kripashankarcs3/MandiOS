/**
 * SAMPLE DATA for the hackathon demo.
 * Shapes match what a real eNAM / Agmarknet integration would return,
 * so swapping in live data only changes tools.js.
 */

export const FARMER_LOCATION = "Niphad, Nashik (Maharashtra)";

export const CROPS = {
  onion: { label: "Onion", hi: "प्याज" },
  tomato: { label: "Tomato", hi: "टमाटर" },
  soybean: { label: "Soybean", hi: "सोयाबीन" },
  wheat: { label: "Wheat", hi: "गेहूं" },
  cotton: { label: "Cotton", hi: "कपास" },
};

// Modal price, ₹ per quintal
export const MANDIS = {
  onion: [
    { mandi: "Lasalgaon", price: 1850 },
    { mandi: "Nashik", price: 1950 },
    { mandi: "Pune", price: 2050 },
  ],
  tomato: [
    { mandi: "Lasalgaon", price: 1200 },
    { mandi: "Nashik", price: 1350 },
    { mandi: "Pune", price: 1500 },
  ],
  soybean: [
    { mandi: "Lasalgaon", price: 4300 },
    { mandi: "Nashik", price: 4400 },
    { mandi: "Pune", price: 4550 },
  ],
  wheat: [
    { mandi: "Lasalgaon", price: 2400 },
    { mandi: "Nashik", price: 2450 },
    { mandi: "Pune", price: 2600 },
  ],
  cotton: [
    { mandi: "Lasalgaon", price: 6900 },
    { mandi: "Nashik", price: 7000 },
    { mandi: "Pune", price: 7200 },
  ],
};

// Expected % change over the next 7 days
export const TREND = { onion: 2, tomato: -6, soybean: 1, wheat: 0.5, cotton: 5 };

export const MANDI_HI = { Lasalgaon: "लासलगांव", Nashik: "नासिक", Pune: "पुणे" };

// Distance from the farmer's village (km)
export const DISTANCE_KM = { Lasalgaon: 12, Nashik: 35, Pune: 210 };
export const COST_PER_QUINTAL_PER_KM = 1.2;

/**
 * maxFactor, openFactor and concession are SECRET to each buyer agent.
 * They are never returned by any tool and never shown to the farmer agent.
 */
export const BUYERS = [
  {
    id: "trader",
    name: "Ramesh Traders",
    kind: "Local commission agent",
    mandi: "Lasalgaon",
    rating: 3.6,
    paymentDays: 0,
    minQty: 0,
    style: "aggressive lowballer who pressures the farmer and pays cash today",
    maxFactor: 0.98,
    openFactor: 0.8,
    concession: 0.25,
  },
  {
    id: "fpo",
    name: "Sahyadri FPO Collective",
    kind: "Farmer producer organisation",
    mandi: "Nashik",
    rating: 4.5,
    paymentDays: 7,
    minQty: 0,
    style: "fair and polite, moves slowly, values long-term relationships",
    maxFactor: 1.04,
    openFactor: 0.88,
    concession: 0.4,
  },
  {
    id: "exporter",
    name: "GreenLeaf Exports",
    kind: "Exporter",
    mandi: "Pune",
    rating: 4.1,
    paymentDays: 15,
    minQty: 30,
    style: "professional, pays a premium for bulk export-grade produce",
    maxFactor: 1.1,
    openFactor: 0.85,
    concession: 0.35,
  },
];

export const getBuyer = (id) => BUYERS.find((b) => b.id === id) || null;

export const publicBuyer = ({ maxFactor, openFactor, concession, style, ...pub }) => pub;

export const marketPrice = (crop, mandi) =>
  MANDIS[crop]?.find((m) => m.mandi === mandi)?.price ?? null;
