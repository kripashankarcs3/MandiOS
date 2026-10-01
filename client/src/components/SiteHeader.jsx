import { useEffect, useState } from "react";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";

export const NAV = [
  ["home", "Home"],
  ["how", "How it works"],
  ["features", "Features"],
  ["crops", "Crops"],
  ["buyers", "For Buyers"],
  ["about", "About"],
];

/**
 * The one header used on every screen (landing and negotiation workspace), so height, spacing and
 * behaviour never differ between screens. `onLink(id)` jumps to a landing section.
 */
export default function SiteHeader({ live, active, onBrand, onLink, action }) {
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
        <Logo onClick={onBrand} />
        <div className="lp-links">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "on" : ""}
              onClick={(e) => { e.preventDefault(); onLink(id); }}>{label}</a>
          ))}
        </div>
        <div className="lp-nav-end">
          {live != null && (
            <span className={`pill ${live ? "pill-live" : "pill-off"}`} title={live ? "Agents are powered by an LLM" : "Rule-based agents, no API key set"}>
              <i /> {live ? "Live AI" : "Offline demo"}
            </span>
          )}
          {action && (
            <button type="button" className="btn btn-dark" onClick={action.onClick}>
              {action.label} <Icon name={action.icon || "arrow"} size={18} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
