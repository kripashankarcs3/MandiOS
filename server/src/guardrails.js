/**
 * Safety rules enforced in CODE after every agent move.
 * The LLM cannot talk its way past these.
 *
 * Rule 1: the farmer's side never offers or accepts below the farmer's minimum.
 * Rule 2: a buyer never pays more than its hidden maximum (keeps the simulation honest).
 * Rule 3: every negotiation stops after config.maxRounds (enforced in negotiation.js).
 */

const ACTIONS = new Set(["offer", "accept", "walk_away"]);

function clean(move) {
  const action = ACTIONS.has(move?.action) ? move.action : "offer";
  const price = Math.round(Number(move?.price));
  const message = typeof move?.message === "string" ? move.message.trim().slice(0, 280) : "";
  const reasoning = typeof move?.reasoning === "string" ? move.reasoning.trim().slice(0, 200) : "";
  return { action, price: Number.isFinite(price) && price > 0 ? price : NaN, message, reasoning };
}

export function checkFarmerMove(raw, { floor, buyerOffer, lastAsk }) {
  const violations = [];
  let m = clean(raw);

  if (m.action === "accept") {
    if (buyerOffer < floor) {
      violations.push(`Agent tried to accept ₹${buyerOffer}, below the farmer's minimum of ₹${floor}. Blocked.`);
      const hold = Math.max(floor, lastAsk);
      m = { ...m, action: "offer", price: hold, message: `₹${hold} से कम में यह सौदा नहीं होगा।` };
    } else {
      m.price = buyerOffer;
    }
  }

  if (m.action === "offer") {
    if (!Number.isFinite(m.price)) {
      violations.push("Agent sent an invalid price. Held the last asking price.");
      m.price = Math.max(floor, lastAsk);
    } else if (m.price < floor) {
      violations.push(`Agent offered ₹${m.price}, below the farmer's minimum of ₹${floor}. Raised to ₹${floor}.`);
      m.price = floor;
      m.message = `₹${floor} से कम नहीं हो पाएगा।`;
    }
    // Asking for less than the buyer already offered makes no sense: take the offer.
    if (m.price <= buyerOffer) m = { ...m, action: "accept", price: buyerOffer };
  }

  if (m.action === "walk_away") m.price = lastAsk;

  if (!m.message) {
    m.message = m.action === "accept" ? `ठीक है, ₹${m.price} पर सौदा पक्का।`
      : m.action === "walk_away" ? "इस भाव पर नहीं बेचेंगे। धन्यवाद।"
      : `₹${m.price} प्रति क्विंटल दीजिए।`;
  }
  return { move: m, violations };
}

export function checkBuyerMove(raw, { buyerMax, farmerAsk, prevOffer }) {
  let m = clean(raw);

  if (m.action === "accept") {
    if (farmerAsk <= buyerMax) m.price = farmerAsk;
    else m = { ...m, action: "offer", price: buyerMax, message: "" };
  }

  if (m.action === "offer") {
    if (!Number.isFinite(m.price)) m.price = prevOffer ?? Math.round(buyerMax * 0.85);
    m.price = Math.min(m.price, buyerMax);
    if (prevOffer != null) m.price = Math.max(m.price, prevOffer);
    if (m.price >= farmerAsk) m = { ...m, action: "accept", price: farmerAsk };
  }

  if (m.action === "walk_away") m.price = prevOffer ?? 0;

  if (!m.message) {
    m.message = m.action === "accept" ? `Agreed at ₹${m.price}.`
      : m.action === "walk_away" ? "That's too high for us. We'll pass."
      : `We can offer ₹${m.price} per quintal.`;
  }
  return m;
}
