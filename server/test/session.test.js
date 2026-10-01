import { test } from "node:test";
import assert from "node:assert/strict";

process.env.FORCE_OFFLINE = "1";
process.env.EVENT_DELAY_MS = "0";
const { runSession } = await import("../src/session.js");

async function run(ctx) {
  const events = [];
  const out = await runSession(ctx, async (type, data) => events.push({ type, ...data }), new AbortController().signal);
  return { out, events };
}

test("full offline session produces a ranked decision", async () => {
  const { out, events } = await run({ crop: "onion", quantity: 40, floor: 1700 });
  assert.ok(out.ranked.length >= 1);
  assert.ok(events.some((e) => e.type === "tool"));
  assert.ok(events.some((e) => e.type === "decision"));
});

test("no farmer move or deal ever goes below the minimum", async () => {
  for (const crop of ["onion", "tomato", "soybean", "wheat", "cotton"]) {
    for (const floorFactor of [0.8, 0.95, 1.0]) {
      const base = { onion: 1950, tomato: 1350, soybean: 4400, wheat: 2450, cotton: 7000 }[crop];
      const floor = Math.round(base * floorFactor);
      const { out, events } = await run({ crop, quantity: 40, floor });
      for (const e of events.filter((x) => x.type === "msg" && x.from === "farmer" && x.action !== "walk_away")) {
        assert.ok(e.price >= floor, `${crop}: farmer ${e.action} ₹${e.price} < floor ₹${floor}`);
      }
      for (const d of out.ranked) assert.ok(d.price >= floor, `${crop}: deal ₹${d.price} < floor ₹${floor}`);
    }
  }
});

test("exporter skips lots below its minimum quantity", async () => {
  const { out } = await run({ crop: "onion", quantity: 10, floor: 1700 });
  assert.equal(out.results.find((r) => r.buyerId === "exporter").status, "no_deal");
});
