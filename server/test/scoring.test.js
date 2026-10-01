import { test } from "node:test";
import assert from "node:assert/strict";
import { rankDeals } from "../src/scoring.js";

test("ranks by net earnings, not by headline price", () => {
  const ranked = rankDeals([
    { buyerId: "exporter", status: "deal", price: 2168 },
    { buyerId: "fpo", status: "deal", price: 1993 },
    { buyerId: "trader", status: "deal", price: 1732 },
    { buyerId: "x", status: "no_deal" },
  ], 40);
  assert.equal(ranked.length, 3);
  assert.equal(ranked[0].buyerId, "fpo");
  assert.ok(ranked[0].totalNet > ranked[1].totalNet);
});
