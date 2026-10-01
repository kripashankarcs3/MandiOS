import { getBuyer } from "./data.js";
import { transportFor } from "./tools.js";

/** Cost of waiting for payment: ~12% a year, about 0.04% a day. */
export const DAILY_INTEREST = 0.0004;

export function netForDeal({ price, buyer, quantity }) {
  const transport = transportFor(buyer.mandi).perQuintal;
  const delayCost = Math.round(price * DAILY_INTEREST * buyer.paymentDays);
  const netPerQuintal = price - transport - delayCost;
  return {
    price,
    transport,
    delayCost,
    netPerQuintal,
    gross: price * quantity,
    totalNet: netPerQuintal * quantity,
  };
}

export function rankDeals(results, quantity) {
  return results
    .filter((r) => r.status === "deal")
    .map((r) => {
      const buyer = getBuyer(r.buyerId);
      return {
        buyerId: buyer.id,
        buyerName: buyer.name,
        mandi: buyer.mandi,
        paymentDays: buyer.paymentDays,
        ...netForDeal({ price: r.price, buyer, quantity }),
      };
    })
    .sort((a, b) => b.totalNet - a.totalNet);
}
