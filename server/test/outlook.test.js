import test from "node:test";
import assert from "node:assert/strict";
import { buildOutlook } from "../src/outlook.js";
import { CROPS } from "../src/data.js";

test("every crop gets 8 history points ending today and 7 forecast days", () => {
  for (const crop of Object.keys(CROPS)) {
    const o = buildOutlook(crop);
    assert.equal(o.history.length, 8);
    assert.equal(o.history.at(-1).price, o.today);
    assert.equal(o.forecast.length, 7);
    assert.deepEqual(o.forecast.map((p) => p.day), [1, 2, 3, 4, 5, 6, 7]);
  }
});

test("uncertainty band widens with the horizon and always brackets the price", () => {
  const { forecast } = buildOutlook("onion");
  for (const p of forecast) assert.ok(p.low < p.price && p.price < p.high);
  assert.ok(forecast[6].high - forecast[6].low > forecast[0].high - forecast[0].low);
});

test("verdict follows the trend: rising waits, falling sells now, flat is either", () => {
  assert.equal(buildOutlook("cotton").verdict.action, "wait");
  assert.equal(buildOutlook("tomato").verdict.action, "sell_now");
  assert.equal(buildOutlook("onion").verdict.action, "either");
});

test("mandi net is price minus transport", () => {
  for (const m of buildOutlook("wheat").mandis) assert.equal(m.net, m.price - m.transport);
});

test("unknown crops, including prototype keys, are rejected", () => {
  assert.equal(buildOutlook("rice"), null);
  assert.equal(buildOutlook("constructor"), null);
});

test("output is deterministic", () => {
  assert.deepEqual(buildOutlook("soybean"), buildOutlook("soybean"));
});
