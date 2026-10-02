import { useEffect, useState } from "react";
import Logo from "./Logo.jsx";

export const NAV = [
  ["home", "Home"],
  ["sell", "Sell a crop"],
  ["market", "Price forecast"],
  ["how", "How it works"],
  ["features", "Features"],
  ["crops", "Crops"],
  ["buyers", "For Buyers"],
  ["about", "About"],
];

/**
 * The one header used on every screen (landing, sell page, negotiation workspace): same links, same
 * action, same height. `onNavigate(id)` goes to the sell page or a landing section.
 */
export default function SiteHeader({ live, active, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
      <div className="lp-nav-in">
        <Logo onClick={() => onNavigate("home")} />
        <div className="lp-links">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}
              onClick={(e) => { e.preventDefault(); onNavigate(id); }}>{label}</a>
          ))}
        </div>
        <div className="lp-nav-end">
          {live != null && (
            <span className={`pill ${live ? "pill-live" : "pill-off"}`} title={live ? "Agents are powered by an LLM" : "Rule-based agents, no API key set"}>
              <i /> {live ? "Live AI" : "Offline demo"}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
