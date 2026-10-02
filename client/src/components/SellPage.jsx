import { useEffect } from "react";
import "../landing.css";
import { BUYER_IMG, FALLBACK_BUYERS, inr, paymentText } from "../lib/format.js";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import Icon from "./Icon.jsx";
import InputPanel from "./InputPanel.jsx";

const AFTER = [
  { icon: "search", tone: "g", title: "Researches the market", text: "Mandi prices, 7-day trend, buyer records and transport cost." },
  { icon: "target", tone: "y", title: "Makes a plan", text: "Target price, opening ask, and whether waiting a week pays more." },
  { icon: "chat", tone: "b", title: "Bargains with all buyers", text: "In Hindi, up to six rounds each, all three at the same time." },
  { icon: "tap", tone: "r", title: "You approve one deal", text: "Ranked by money in hand. Nothing is final until you tap." },
];

/** Dedicated page for starting a sale ("Find me the best buyer"). */
export default function SellPage({ crops, buyers, location, live, initialCrop, onStart, onNavigate }) {
  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  const list = buyers?.length ? buyers : FALLBACK_BUYERS;

  return (
    <div className="landing lp sellpage">
      <SiteHeader live={live} active="sell" onNavigate={onNavigate} />

      <section className="sp-head">
        <div className="lp-wrap">
          <p className="sp-crumbs">
            <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>Home</a>
            <Icon name="chevron" size={14} /><span>Find the best buyer</span>
          </p>
          <h1>Find me the best buyer</h1>
          <p className="sp-lead">Tell the agent what you grow and the lowest price you will take. It negotiates with every buyer and brings you one deal to approve.</p>
        </div>
      </section>

      <section className="lp-sec sp-body">
        <div className="lp-wrap sp-grid">
          <div className="sp-form">
            <InputPanel crops={crops} buyers={list} location={location} running={false} onStart={onStart} initialCrop={initialCrop} />
            <p className="sp-safe"><Icon name="shield" size={16} /> Your minimum price is enforced in code on every move. Nothing is sold without your approval.</p>
          </div>

          <aside className="sp-side">
            <div className="sp-box">
              <h2>What happens next</h2>
              <ol className="sp-after">
                {AFTER.map((s, i) => (
                  <li key={s.title}>
                    <span className={`lp-ic ${s.tone}`}><Icon name={s.icon} size={20} /></span>
                    <div><b>{i + 1}. {s.title}</b><span>{s.text}</span></div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="sp-box">
              <h2>Buyers who will bid</h2>
              <ul className="sp-buyers">
                {list.map((b) => (
                  <li key={b.id}>
                    <i style={{ backgroundImage: `url(${BUYER_IMG[b.id] || "/img/market-veg.jpg"})` }} aria-hidden="true" />
                    <div>
                      <b>{b.name}</b>
                      <span>{b.kind} · {b.mandi}</span>
                      <span><Icon name="clock" size={13} /> {paymentText(b.paymentDays)} · <Icon name="truck" size={13} /> {inr(b.transportPerQuintal)}/q</span>
                    </div>
                    <em><Icon name="star" size={13} /> {b.rating}</em>
                  </li>
                ))}
              </ul>
            </div>
            <p className="lp-sample">Sample data</p>
          </aside>
        </div>
      </section>

      <SiteFooter crops={crops} onNavigate={onNavigate} />
    </div>
  );
}
