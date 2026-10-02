import { useEffect, useState } from "react";
import "../landing.css";
import { API_BASE, FALLBACK_CROPS, inr } from "../lib/format.js";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import PriceChart from "./PriceChart.jsx";
import CropIcon from "./CropIcon.jsx";
import Icon from "./Icon.jsx";

const VERDICT = {
  wait: { label: "Wait a few days", tone: "up" },
  sell_now: { label: "Sell soon", tone: "down" },
  either: { label: "No rush", tone: "flat" },
};
const sign = (n) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n)}`;

/** Market outlook: where prices have been, where they are likely going, and what waiting is worth. */
export default function MarketPage({ crops, live, initialCrop, onNavigate, onOpenSell }) {
  const list = crops?.length ? crops : FALLBACK_CROPS;
  const [crop, setCrop] = useState(initialCrop || "onion");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [qty, setQty] = useState("40");

  useEffect(() => { window.scrollTo({ top: 0 }); }, []);
  useEffect(() => {
    let off = false;
    setData(null);
    setError("");
    fetch(`${API_BASE}/api/outlook?crop=${crop}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((d) => { if (!off) setData(d); })
      .catch(() => { if (!off) setError("Could not load the market outlook. Check that the server is running."); });
    return () => { off = true; };
  }, [crop]);

  const q = Math.max(0, Math.min(5000, Number(qty) || 0));
  const last = data?.forecast.at(-1);
  const v = data && VERDICT[data.verdict.action];
  const maxPrice = data ? Math.max(...data.mandis.map((m) => m.price)) : 1;
  const bestNet = data ? Math.max(...data.mandis.map((m) => m.net)) : 0;

  return (
    <div className="landing lp marketpage">
      <SiteHeader live={live} active="market" onNavigate={onNavigate} />

      <section className="sp-head">
        <div className="lp-wrap">
          <p className="sp-crumbs">
            <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>Home</a>
            <Icon name="chevron" size={14} /><span>Market outlook</span>
          </p>
          <h1>Market outlook <span lang="hi" className="mk-hi">· अगले 7 दिन का भाव</span></h1>
          <p className="sp-lead">See where prices are headed before you sell. Pick a crop to see the last week, the next seven days, and what waiting could be worth.</p>
        </div>
      </section>

      <div className="lp-wrap mk-body">
        <div className="mk-tabs" role="tablist" aria-label="Crop">
          {list.map((c) => (
            <button key={c.id} type="button" role="tab" aria-selected={crop === c.id}
              className={crop === c.id ? "on" : ""} onClick={() => setCrop(c.id)}>
              <CropIcon crop={c.id} size={26} /> {c.label}
            </button>
          ))}
        </div>

        {error && <p className="field-error" role="alert">{error}</p>}
        {!data && !error && <p className="mk-loading">Loading prices…</p>}

        {data && (
          <>
            <section className="mk-hero">
              <div>
                <small>{data.label} · {data.referenceMandi} mandi today</small>
                <b className="mk-price">{inr(data.today)}<span> / quintal</span></b>
              </div>
              <div>
                <small>Expected in 7 days</small>
                <b className={`mk-trend ${v.tone}`}>{sign(data.trendPct)}%<span> ≈ {inr(last.price)}</span></b>
              </div>
              <div className="mk-verdict">
                <small>Our read</small>
                <b className={v.tone}>{v.label}</b>
                <span>{data.verdict.headline}.</span>
              </div>
            </section>

            <section className="mk-chart">
              <PriceChart history={data.history} forecast={data.forecast} />
              <ul className="mk-legend">
                <li><i className="hist" /> Recent price</li>
                <li><i className="fore" /> Forecast</li>
                <li><i className="band" /> Likely range</li>
              </ul>
            </section>

            <div className="mk-cols">
              <section className="mk-col">
                <h2>Which mandi pays you most?</h2>
                <p className="mk-note">Today's price, minus the cost of getting the crop there.</p>
                <ul className="mk-mandis">
                  {data.mandis.map((m) => (
                    <li key={m.mandi} className={m.net === bestNet ? "best" : ""}>
                      <div className="mk-mandi-top">
                        <b>{m.mandi}</b>
                        <span>{m.km} km</span>
                        {m.net === bestNet && <em><Icon name="check" size={13} /> Most in hand</em>}
                      </div>
                      <div className="mk-bar" role="img" aria-label={`${m.mandi}: ${inr(m.price)}, transport ${inr(m.transport)}, in hand ${inr(m.net)}`}>
                        <i className="net" style={{ width: `${(m.net / maxPrice) * 100}%` }} />
                        <i className="tr" style={{ width: `${(m.transport / maxPrice) * 100}%` }} />
                      </div>
                      <div className="mk-mandi-nums">
                        <span>Price <b>{inr(m.price)}</b></span>
                        <span>Transport <b>{inr(m.transport)}</b></span>
                        <span>In hand <b>{inr(m.net)}</b></span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mk-col">
                <h2>Sell today, or wait a week?</h2>
                <p className="mk-note">Based on the forecast above. Waiting is a bet, not a promise.</p>
                <div className="field">
                  <label htmlFor="mk-qty">How much do you have?</label>
                  <div className="input-wrap">
                    <input id="mk-qty" type="number" inputMode="numeric" min="1" max="5000" value={qty} onChange={(e) => setQty(e.target.value)} />
                    <span className="unit">quintal</span>
                  </div>
                </div>
                <div className="mk-compare">
                  <div>
                    <small>Sell today</small>
                    <b>{inr(q * data.today)}</b>
                  </div>
                  <div>
                    <small>Sell in 7 days (likely)</small>
                    <b>{inr(q * last.price)}</b>
                    <span className={data.verdict.gainPerQuintal >= 0 ? "up" : "down"}>
                      {data.verdict.gainPerQuintal >= 0 ? "+" : "−"}{inr(Math.abs(q * data.verdict.gainPerQuintal))} vs today
                    </span>
                  </div>
                </div>
                <p className="mk-range">Range after 7 days: {inr(q * last.low)} to {inr(q * last.high)}</p>
                <button type="button" className="btn btn-dark btn-block" onClick={() => onOpenSell(crop)}>
                  Sell {data.label.toLowerCase()} with the agent <Icon name="arrow" size={18} />
                </button>
              </section>
            </div>

            <p className="lp-sample mk-sample">Sample data and a demo forecast, not financial advice.</p>
          </>
        )}
      </div>

      <SiteFooter crops={list} onNavigate={onNavigate} />
    </div>
  );
}
