import { useEffect, useRef } from "react";
import { BUYER_IMG, inr, paymentText } from "../lib/format.js";
import PriceTrack from "./PriceTrack.jsx";
import Icon from "./Icon.jsx";

const lastPrice = (chat, from) => {
  for (let i = chat.length - 1; i >= 0; i--) {
    const m = chat[i];
    if (m.kind === "msg" && m.from === from && m.action !== "walk_away" && m.price > 0) return m.price;
  }
  return null;
};

const ACTION_TAG = { accept: "Accepted", walk_away: "Walked away" };

export default function BuyerColumn({ buyer, plan, ctx, chat, result, isBest }) {
  const listRef = useRef(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [chat.length]);

  const rounds = chat.filter((m) => m.kind === "msg" && m.from === "buyer").length;
  const transport = buyer.transportPerQuintal;
  const dealPrice = result?.status === "deal" ? result.price : null;

  return (
    <article className={`buyer ${isBest ? "buyer-best" : ""} ${result?.status === "no_deal" ? "buyer-off" : ""}`}>
      <header className="buyer-head" style={{ backgroundImage: `url(${BUYER_IMG[buyer.id] || "/img/market-veg.jpg"})` }}>
        {isBest && <span className="best-flag"><Icon name="check" size={14} /> Best in hand</span>}
        <div className="buyer-title">
          <h3>{buyer.name}</h3>
          <p>{buyer.kind} · {buyer.mandi}</p>
        </div>
      </header>

      <ul className="facts">
        <li><Icon name="star" size={13} /> {buyer.rating}</li>
        <li><Icon name="clock" size={14} /> {paymentText(buyer.paymentDays)}</li>
        <li><Icon name="truck" size={14} /> {inr(transport)}/qtl</li>
      </ul>

      {plan && ctx && (
        <PriceTrack
          floor={ctx.floor}
          target={plan.target_price + transport}
          opening={plan.opening_ask + transport}
          ask={lastPrice(chat, "farmer")}
          offer={lastPrice(chat, "buyer")}
          dealPrice={dealPrice}
        />
      )}

      <ol className="chat" ref={listRef}>
        {chat.length === 0 && <li className="chat-empty">Waiting for the plan…</li>}
        {chat.map((m) =>
          m.kind === "guardrail" ? (
            <li key={m.id} className="guard" role="note"><Icon name="shield" size={16} /> <span>Blocked by safety rule. {m.text}</span></li>
          ) : (
            <li key={m.id} className={`bubble ${m.from === "farmer" ? "ours" : "theirs"} act-${m.action}`}>
              <div className="bubble-top">
                <span className="who">{m.from === "farmer" ? "Our agent" : buyer.name.split(" ")[0]}</span>
                {m.price > 0 && <span className="price">{inr(m.price)}</span>}
                {ACTION_TAG[m.action] && <span className="tag">{ACTION_TAG[m.action]}</span>}
              </div>
              <p lang={m.from === "farmer" ? "hi" : "en"}>{m.message}</p>
              {m.reasoning && <p className="why">{m.reasoning}</p>}
            </li>
          ),
        )}
      </ol>

      <footer className={`buyer-foot ${result ? `foot-${result.status}` : ""}`}>
        {!result && (chat.length ? <><span className="spinner sm" aria-hidden="true" /> Round {rounds}, bargaining…</> : "Not started")}
        {result?.status === "deal" && <>Deal at <strong>{inr(result.price)}</strong>/qtl</>}
        {result?.status === "no_deal" && <>No deal. {result.reason}.</>}
        {result?.status === "cancelled" && "Stopped."}
      </footer>
    </article>
  );
}
