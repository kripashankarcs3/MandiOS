import Logo from "./Logo.jsx";

/** The one footer used on every screen. `onNavigate(id)` goes to the sell page or a landing section. */
export default function SiteFooter({ crops, onNavigate }) {
  const link = (id) => (e) => { e.preventDefault(); onNavigate(id); };
  return (
    <footer className="lp-foot">
      <div className="lp-wrap">
        <div className="lp-foot-grid">
          <div className="lp-foot-brand">
            <Logo light onClick={() => onNavigate("home")} />
            <p>The AI agent layer for India's mandis. The Bargaining Agent researches, negotiates with buyers and closes the best deal for the farmer.</p>
          </div>
          <nav aria-label="Product">
            <h3>Product</h3>
            <a href="#sell" onClick={link("sell")}>Sell a crop</a>
            <a href="#market" onClick={link("market")}>Price forecast</a>
            <a href="#how" onClick={link("how")}>How it works</a>
            <a href="#features" onClick={link("features")}>Features</a>
            <a href="#crops" onClick={link("crops")}>Crops</a>
            <a href="#buyers" onClick={link("buyers")}>For Buyers</a>
            <a href="#about" onClick={link("about")}>About</a>
          </nav>
          <div className="lp-foot-col">
            <h3>Crops</h3>
            {crops.map((c) => <span key={c.id}>{c.label}</span>)}
          </div>
          <div className="lp-foot-col">
            <h3>Project</h3>
            <span>Built for Bharat Agentic 2026</span>
            <span>Farmer agent speaks Hindi</span>
            <span>Guardrails enforced in code</span>
          </div>
        </div>
        <p className="lp-foot-note">
          Market prices, buyers and distances are sample data for this demo. Photos from{" "}
          <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>.
        </p>
      </div>
    </footer>
  );
}
