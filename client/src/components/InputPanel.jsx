import { useState } from "react";
import { DEFAULT_FLOOR, FALLBACK_BUYERS, inr } from "../lib/format.js";
import CropIcon from "./CropIcon.jsx";
import Icon from "./Icon.jsx";

const QTY_CHIPS = [10, 25, 40, 100, 250];
const FLOOR_STEP = { onion: 50, tomato: 50, soybean: 100, wheat: 50, cotton: 100 };
const short = (n) => n.split(" ").slice(0, 2).join(" ");

/** The sell form: crop, quantity, minimum price, with a live summary of what the floor protects. */
export default function InputPanel({ crops, buyers, location, running, onStart, initialCrop = "onion" }) {
  const [crop, setCrop] = useState(initialCrop);
  const [quantity, setQuantity] = useState("40");
  const [floor, setFloor] = useState(String(DEFAULT_FLOOR[initialCrop] ?? DEFAULT_FLOOR.onion));
  const [error, setError] = useState("");

  const suggested = DEFAULT_FLOOR[crop];
  const step = FLOOR_STEP[crop] || 50;
  const q = Number(quantity);
  const f = Number(floor);
  const qOk = q >= 1 && q <= 5000;
  const fOk = f >= 100 && f <= 50000;
  const minTotal = qOk && fOk ? Math.round(q) * Math.round(f) : null;
  const buyerList = buyers?.length ? buyers : FALLBACK_BUYERS;

  const changeCrop = (c) => { setCrop(c); setFloor(String(DEFAULT_FLOOR[c] ?? "")); setError(""); };
  const bump = (set, value, delta, lo, hi) => set(String(Math.min(hi, Math.max(lo, Math.round((Number(value) || 0) + delta)))));

  const submit = (e) => {
    e.preventDefault();
    if (!qOk) return setError("Enter a quantity between 1 and 5,000 quintal.");
    if (!fOk) return setError("Enter a minimum price between ₹100 and ₹50,000.");
    setError("");
    onStart({ crop, quantity: Math.round(q), floor: Math.round(f) });
  };

  return (
    <form className="sell" id="start" onSubmit={submit} noValidate aria-labelledby="sell-title">
      <div className="sell-head">
        <div>
          <h2 id="sell-title">Sell a crop <span lang="hi">· फसल बेचें</span></h2>
          <p className="sell-sub">Three quick answers. The agent does the rest.</p>
        </div>
        {location && <p className="sell-loc"><Icon name="pin" size={15} /> {location}</p>}
      </div>

      <fieldset className="crop-pick" disabled={running}>
        <legend><span className="sell-no">1</span> What are you selling?</legend>
        <div className="crop-grid" role="radiogroup" aria-label="Crop">
          {crops.map((c) => (
            <button key={c.id} type="button" role="radio" aria-checked={crop === c.id}
              className={`crop-chip ${crop === c.id ? "on" : ""}`} onClick={() => changeCrop(c.id)}>
              <CropIcon crop={c.id} size={34} />
              <span className="crop-name">{c.label}</span>
              <span className="crop-hi" lang="hi">{c.hi}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label htmlFor="qty"><span className="sell-no">2</span> How much do you have? <span lang="hi" className="lbl-hi">· कितनी मात्रा</span></label>
        <div className="input-wrap">
          <button type="button" className="step-btn" aria-label="Decrease quantity" disabled={running || q <= 1}
            onClick={() => bump(setQuantity, quantity, -(q > 50 ? 10 : 5), 1, 5000)}>−</button>
          <input id="qty" type="number" inputMode="numeric" min="1" max="5000" value={quantity}
            onChange={(e) => setQuantity(e.target.value)} disabled={running} />
          <span className="unit">quintal</span>
          <button type="button" className="step-btn" aria-label="Increase quantity" disabled={running || q >= 5000}
            onClick={() => bump(setQuantity, quantity, q >= 50 ? 10 : 5, 1, 5000)}>+</button>
        </div>
        <div className="quick" role="group" aria-label="Quick quantity">
          {QTY_CHIPS.map((n) => (
            <button key={n} type="button" disabled={running} className={q === n ? "on" : ""} onClick={() => setQuantity(String(n))}>{n} q</button>
          ))}
          {qOk && <span className="quick-note">= {(q / 10).toLocaleString("en-IN", { maximumFractionDigits: 1 })} tonne</span>}
        </div>
      </div>

      <div className="field">
        <label htmlFor="floor"><span className="sell-no">3</span> Lowest price you'll take <span lang="hi" className="lbl-hi">· न्यूनतम भाव</span></label>
        <div className="input-wrap">
          <button type="button" className="step-btn" aria-label="Decrease price" disabled={running || f <= 100}
            onClick={() => bump(setFloor, floor, -step, 100, 50000)}>−</button>
          <span className="unit pre">₹</span>
          <input id="floor" type="number" inputMode="numeric" min="100" max="50000" value={floor}
            onChange={(e) => setFloor(e.target.value)} disabled={running} aria-describedby="floor-hint" />
          <span className="unit">/ quintal</span>
          <button type="button" className="step-btn" aria-label="Increase price" disabled={running || f >= 50000}
            onClick={() => bump(setFloor, floor, step, 100, 50000)}>+</button>
        </div>
        {suggested && (
          <input type="range" className="floor-range" aria-label="Minimum price slider" disabled={running}
            min={Math.round(suggested * 0.6)} max={Math.round(suggested * 1.4)} step={step}
            value={Math.min(Math.max(f || suggested, Math.round(suggested * 0.6)), Math.round(suggested * 1.4))}
            onChange={(e) => setFloor(e.target.value)} />
        )}
        <div className="quick">
          {suggested && (
            <button type="button" disabled={running} className={f === suggested ? "on" : ""} onClick={() => setFloor(String(suggested))}>
              Suggested {inr(suggested)}
            </button>
          )}
          <span className="quick-note">Suggested price is sample data</span>
        </div>
      </div>
      <p id="floor-hint" className="hint"><Icon name="lock" size={14} /> The agent never offers or accepts less than this.</p>

      <div className="sell-sum" aria-live="polite">
        <div>
          <small>You will get at least</small>
          <b>{minTotal != null ? inr(minTotal) : "₹–"}</b>
        </div>
        <ul>
          {buyerList.map((b) => {
            const ok = !qOk || q >= (b.minQty || 0);
            return (
              <li key={b.id} className={ok ? "ok" : "no"} title={ok ? "Will bid" : `Needs at least ${b.minQty} quintal`}>
                <Icon name={ok ? "check" : "alert"} size={13} /> {short(b.name)}{!ok && <em> needs {b.minQty}+ q</em>}
              </li>
            );
          })}
        </ul>
      </div>

      {error && <p className="field-error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-gold btn-lg btn-block" disabled={running}>
        {running ? "Negotiating…" : <>Find me the best buyer <Icon name="arrow" size={20} /></>}
      </button>

      <ul className="sell-trust">
        <li><Icon name="shield" size={15} /> Minimum protected</li>
        <li><Icon name="clock" size={15} /> Up to 6 rounds</li>
        <li><Icon name="tap" size={15} /> You approve the deal</li>
      </ul>
    </form>
  );
}
