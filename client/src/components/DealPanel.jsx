import { useState } from "react";
import { API_BASE, inr } from "../lib/format.js";
import Icon from "./Icon.jsx";

const possessive = (name) => (name.endsWith("s") ? `${name}'` : `${name}'s`);

export default function DealPanel({ decision, results, buyers, sessionId, receipt, onApproved }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { ranked, bestBuyerId, highestPriceBuyerId } = decision;

  if (!ranked.length) {
    return (
      <section className="deal deal-none">
        <Icon name="alert" size={28} />
        <h2>No buyer met your minimum price</h2>
        <p>Your crop was not sold below your price. Try again later, or lower the minimum if you are comfortable with it.</p>
      </section>
    );
  }

  const best = ranked[0];
  const highest = ranked.find((d) => d.buyerId === highestPriceBuyerId);
  const worst = ranked[ranked.length - 1];
  const noDeals = buyers.filter((b) => results[b.id]?.status === "no_deal");
  const maxPrice = Math.max(...ranked.map((d) => d.price));
  const seg = (v) => `${(Math.max(0, v) / maxPrice) * 100}%`;

  const approve = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, buyerId: bestBuyerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not approve the deal.");
      onApproved(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(receipt.message); setCopied(true); } catch { setCopied(false); }
  };

  return (
    <section className="deal" aria-label="Recommended deal">
      <div className="deal-hero">
        <div className="deal-hero-bg" aria-hidden="true" />
        <div className="deal-hero-inner">
          <p className="deal-kicker"><Icon name="check" size={16} /> Recommended deal</p>
          <h2>{best.buyerName}</h2>
          <p className="deal-total">{inr(best.totalNet)}</p>
          <p className="deal-sub">in your hand, after transport and payment delay</p>
          <div className="insights">
            {highest && highest.buyerId !== best.buyerId && (
              <p>
                <b>{highest.buyerName}</b> offered the highest price ({inr(highest.price)}), but transport to {highest.mandi} and
                {" "}{highest.paymentDays}-day payment leave you <b>{inr(best.totalNet - highest.totalNet)} less</b>.
              </p>
            )}
            {worst.buyerId !== best.buyerId && (
              <p>That is <b>{inr(best.totalNet - worst.totalNet)} more</b> than {possessive(worst.buyerName)} deal.</p>
            )}
          </div>
        </div>
      </div>

      <div className="deal-body">
        <h3 className="deal-h">Where each rupee goes</h3>
        <ul className="split" aria-label="Price breakdown per buyer">
          {ranked.map((d) => (
            <li key={d.buyerId} className={d.buyerId === bestBuyerId ? "split-best" : ""}>
              <div className="split-name">{d.buyerName}{d.buyerId === bestBuyerId && <span className="mini-flag">Best</span>}</div>
              <div className="split-bar" role="img"
                aria-label={`${d.buyerName}: price ${inr(d.price)}, transport ${inr(d.transport)}, payment delay ${inr(d.delayCost)}, you keep ${inr(d.netPerQuintal)} per quintal`}>
                <i className="seg-net" style={{ width: seg(d.netPerQuintal) }} />
                <i className="seg-trans" style={{ width: seg(d.transport) }} />
                <i className="seg-delay" style={{ width: seg(d.delayCost) }} />
              </div>
              <div className="split-fig"><b>{inr(d.price)}</b><span>per quintal</span></div>
            </li>
          ))}
        </ul>
        <ul className="legend">
          <li><i className="seg-net" /> You keep</li>
          <li><i className="seg-trans" /> Transport</li>
          <li><i className="seg-delay" /> Payment delay</li>
        </ul>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th scope="col">Buyer</th>
                <th scope="col">Price/qtl</th>
                <th scope="col">Transport</th>
                <th scope="col">Payment delay</th>
                <th scope="col">Net/qtl</th>
                <th scope="col">Total in hand</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((d) => (
                <tr key={d.buyerId} className={d.buyerId === bestBuyerId ? "row-best" : ""}>
                  <th scope="row">{d.buyerName}</th>
                  <td>{inr(d.price)}</td>
                  <td>−{inr(d.transport)}</td>
                  <td>{d.delayCost > 0 ? `−${inr(d.delayCost)}` : "None"}</td>
                  <td>{inr(d.netPerQuintal)}</td>
                  <td><strong>{inr(d.totalNet)}</strong></td>
                </tr>
              ))}
              {noDeals.map((b) => (
                <tr key={b.id} className="row-off">
                  <th scope="row">{b.name}</th>
                  <td colSpan={5}>No deal. {results[b.id].reason}.</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!receipt ? (
          <div className="approve">
            <div>
              <p className="approve-title">Ready to close this deal?</p>
              <p className="muted">Nothing is final until you approve.</p>
              {error && <p className="field-error" role="alert">{error}</p>}
            </div>
            <button type="button" className="btn btn-leaf btn-lg" onClick={approve} disabled={busy}>
              {busy ? "Approving…" : <>Approve deal with {best.buyerName} <Icon name="arrow" size={20} /></>}
            </button>
          </div>
        ) : (
          <div className="receipt" role="status">
            <div className="receipt-slip">
              <p className="receipt-head"><Icon name="check" size={18} /> Deal approved <span>Receipt {receipt.id}</span></p>
              <pre lang="hi">{receipt.message}</pre>
            </div>
            <div className="receipt-actions">
              <a className="btn btn-wa" href={receipt.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={20} /> Send on WhatsApp
              </a>
              <button type="button" className="btn btn-outline" onClick={copy}>
                <Icon name={copied ? "check" : "copy"} size={18} /> {copied ? "Copied" : "Copy message"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
