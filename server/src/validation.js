import { CROPS } from "./data.js";

export function parseNegotiateQuery(q) {
  const crop = String(q.crop ?? "").toLowerCase().trim();
  if (!CROPS[crop]) return { error: `Choose a crop: ${Object.keys(CROPS).join(", ")}.` };

  const quantity = Number(q.quantity);
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 5000) {
    return { error: "Quantity must be between 1 and 5,000 quintal." };
  }
  const floor = Number(q.floor);
  if (!Number.isFinite(floor) || floor < 100 || floor > 50000) {
    return { error: "Minimum price must be between ₹100 and ₹50,000 per quintal." };
  }
  return { value: { crop, quantity: Math.round(quantity), floor: Math.round(floor) } };
}

const UUID = /^[0-9a-f-]{36}$/i;
export function parseApproveBody(body) {
  const sessionId = String(body?.sessionId ?? "");
  const buyerId = String(body?.buyerId ?? "");
  if (!UUID.test(sessionId)) return { error: "Missing or invalid session." };
  if (!buyerId) return { error: "Choose which deal to approve." };
  return { value: { sessionId, buyerId } };
}
