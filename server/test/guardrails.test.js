import { test } from "node:test";
import assert from "node:assert/strict";
import { checkFarmerMove, checkBuyerMove } from "../src/guardrails.js";

test("blocks accepting an offer below the farmer's minimum", () => {
  const { move, violations } = checkFarmerMove(
    { action: "accept", price: 1600, message: "ok" },
    { floor: 1700, buyerOffer: 1600, lastAsk: 1800 },
  );
  assert.equal(move.action, "offer");
  assert.ok(move.price >= 1700);
  assert.equal(violations.length, 1);
});

test("raises an offer below the minimum up to the minimum", () => {
  const { move, violations } = checkFarmerMove(
    { action: "offer", price: 1500 },
    { floor: 1700, buyerOffer: 1400, lastAsk: 1800 },
  );
  assert.equal(move.price, 1700);
  assert.equal(violations.length, 1);
});

test("asking less than the buyer offers becomes an accept", () => {
  const { move } = checkFarmerMove({ action: "offer", price: 1750 }, { floor: 1700, buyerOffer: 1800, lastAsk: 1900 });
  assert.equal(move.action, "accept");
  assert.equal(move.price, 1800);
});

test("invalid model output is made safe", () => {
  const { move } = checkFarmerMove({ action: "dance", price: "abc" }, { floor: 1700, buyerOffer: 1500, lastAsk: 1900 });
  assert.equal(move.action, "offer");
  assert.ok(move.price >= 1700);
});

test("buyer can never exceed its hidden maximum", () => {
  const m = checkBuyerMove({ action: "offer", price: 9999 }, { buyerMax: 2000, farmerAsk: 2200, prevOffer: 1800 });
  assert.equal(m.price, 2000);
});

test("buyer accept above its maximum becomes a capped offer", () => {
  const m = checkBuyerMove({ action: "accept" }, { buyerMax: 2000, farmerAsk: 2200, prevOffer: 1800 });
  assert.equal(m.action, "offer");
  assert.equal(m.price, 2000);
});
