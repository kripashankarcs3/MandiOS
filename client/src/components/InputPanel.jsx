import { useState } from "react";
import { DEFAULT_FLOOR } from "../lib/format.js";
import CropIcon from "./CropIcon.jsx";
import Icon from "./Icon.jsx";

/** The sell form that lives in the hero. */
export default function InputPanel({ crops, location, running, onStart }) {
  const [crop, setCrop] = useState("onion");
  const [quantity, setQuantity] = useState("40");
  const [floor, setFloor] = useState(String(DEFAULT_FLOOR.onion));
  const [error, setError] = useState("");

  const changeCrop = (c) => { setCrop(c); setFloor(String(DEFAULT_FLOOR[c] ?? "")); };

  const submit = (e) => {
    e.preventDefault();
    const q = Number(quantity);
    const f = Number(floor);
    if (!(q >= 1 && q <= 5000)) return setError("Enter a quantity between 1 and 5,000 quintal.");
    if (!(f >= 100 && f <= 50000)) return setError("Enter a minimum price between ₹100 and ₹50,000.");
    setError("");
    onStart({ crop, quantity: Math.round(q), floor: Math.round(f) });
  };

  return (
    <form className="sell" id="start" onSubmit={submit} noValidate aria-labelledby="sell-title">
      <div className="sell-head">
        <h2 id="sell-title">Sell a crop</h2>
        {location && <p><Icon name="pin" size={15} /> {location}</p>}
      </div>

      <fieldset className="crop-pick" disabled={running}>
        <legend>What are you selling?</legend>
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

      <div className="sell-fields">
        <div className="field">
          <label htmlFor="qty">How much?</label>
          <div className="input-wrap">
            <input id="qty" type="number" inputMode="numeric" min="1" max="5000" value={quantity}
              onChange={(e) => setQuantity(e.target.value)} disabled={running} />
            <span className="unit">quintal</span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="floor">Lowest price you'll take</label>
          <div className="input-wrap">
            <span className="unit pre">₹</span>
            <input id="floor" type="number" inputMode="numeric" min="100" max="50000" value={floor}
              onChange={(e) => setFloor(e.target.value)} disabled={running} aria-describedby="floor-hint" />
            <span className="unit">/ quintal</span>
          </div>
        </div>
      </div>
      <p id="floor-hint" className="hint"><Icon name="lock" size={14} /> The agent never offers or accepts less than this.</p>

      {error && <p className="field-error" role="alert">{error}</p>}

      <button type="submit" className="btn btn-gold btn-lg btn-block" disabled={running}>
        {running ? "Negotiating…" : <>Find me the best buyer <Icon name="arrow" size={20} /></>}
      </button>
    </form>
  );
}
