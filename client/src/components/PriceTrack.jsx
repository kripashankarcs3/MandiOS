import { inr } from "../lib/format.js";

/** The gap between the farmer agent's ask and the buyer's offer, closing in real time. */
export default function PriceTrack({ floor, target, opening, ask, offer, dealPrice }) {
  const lo = Math.min(floor, offer ?? floor) * 0.96;
  const hi = Math.max(opening, ask ?? opening) * 1.02;
  const pos = (v) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;

  return (
    <div className="track" role="img"
      aria-label={dealPrice ? `Deal at ${inr(dealPrice)}` : `Buyer offers ${inr(offer)}, agent asks ${inr(ask)}, minimum ${inr(floor)}`}>
      <div className="track-rail" />
      <div className="track-below" style={{ width: pos(floor) }} title="Below your minimum" />
      <div className="track-floor" style={{ left: pos(floor) }}><span>Min {inr(floor)}</span></div>
      <div className="track-target" style={{ left: pos(target) }} title={`Target ${inr(target)}`} />
      {dealPrice ? (
        <div className="track-dot dot-deal" style={{ left: pos(dealPrice) }} />
      ) : (
        <>
          {offer != null && ask != null && (
            <div className="track-gap" style={{ left: pos(offer), width: `calc(${pos(ask)} - ${pos(offer)})` }} />
          )}
          {offer != null && <div className="track-dot dot-buyer" style={{ left: pos(offer) }} />}
          {ask != null && <div className="track-dot dot-farmer" style={{ left: pos(ask) }} />}
        </>
      )}
    </div>
  );
}
