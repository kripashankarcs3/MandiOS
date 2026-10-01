import { useEffect, useRef, useState } from "react";
import { BUYER_IMG, FALLBACK_BUYERS, FALLBACK_CROPS, inr, paymentText } from "../lib/format.js";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";
import InputPanel from "./InputPanel.jsx";

const HOW = [
  { icon: "search", title: "Research", text: "Checks prices in three mandis, the 7-day trend, every buyer's record and the transport cost to reach them.", tags: ["Mandi prices", "7-day forecast", "Buyer profiles", "Transport cost"] },
  { icon: "target", title: "Plan", text: "Sets a target price and an opening ask, and tells you honestly whether waiting a week would pay more.", tags: ["Target price", "Sell now or wait"] },
  { icon: "chat", title: "Bargain", text: "Negotiates with all three buyers at the same time, in Hindi, for up to six rounds. Never below your minimum.", tags: ["3 buyers in parallel", "Hindi"] },
  { icon: "tap", title: "Approve", text: "Ranks every deal by the money that reaches your hand, not the headline rate. One tap confirms. Nothing is final before that.", tags: ["Net earnings", "Your approval"] },
];

const RULES = [
  { icon: "shield", title: "Your floor is law", text: "Every move the agent makes is checked in code. It cannot offer or accept anything below your minimum price." },
  { icon: "scale", title: "Buyers stay realistic", text: "Buyer agents can never go past their own hidden limit, so there are no made-up deals to get excited about." },
  { icon: "clock", title: "No endless haggling", text: "A hard limit of six rounds per buyer. The agent either closes the deal or walks away." },
  { icon: "tap", title: "You press the button", text: "The agent recommends. You approve. Only then do you get a receipt and a WhatsApp message to send." },
];

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}


const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Landing({ crops, buyers, location, live, onStart }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const list = buyers?.length ? buyers : FALLBACK_BUYERS;
  const focusForm = () => {
    go("start");
    setTimeout(() => document.getElementById("qty")?.focus({ preventScroll: true }), 500);
  };
  const link = (id) => (e) => { e.preventDefault(); go(id); };

  return (
    <div className="landing">
      <nav className={`nav ${scrolled ? "nav-solid" : ""}`} aria-label="Main">
        <Logo light={!scrolled} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
        <div className="nav-links">
          <a href="#how" onClick={link("how")}>How it works</a>
          <a href="#buyers" onClick={link("buyers")}>Buyers</a>
          <a href="#trust" onClick={link("trust")}>Safety</a>
        </div>
        <div className="nav-end">
          {live != null && (
            <span className={`pill ${live ? "pill-live" : "pill-off"}`} title={live ? "Agents are powered by an LLM" : "Rule-based agents, no API key set"}>
              <i /> {live ? "Live AI" : "Offline demo"}
            </span>
          )}
          <button type="button" className="btn btn-gold btn-sm" onClick={focusForm}>Start selling</button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <div className="hero-inner">
          <div className="hero-copy">
            <p className="eyebrow"><span /> First agent: the Bargaining Agent</p>
            <h1>
              <span className="hi" lang="hi">फसल आपकी,<br />दाम भी आपका।</span>
              <span className="en">Your crop. Your price.</span>
            </h1>
            <p className="lead">
              MandiOS is the AI agent layer for India's mandis. The Bargaining Agent researches, negotiates with
              buyers, and closes the best deal for the farmer.
            </p>
            <ul className="proof">
              <li><strong>3</strong><span>buyers bargained<br />at the same time</span></li>
              <li><strong>₹0</strong><span>ever sold below<br />your minimum</span></li>
              <li><strong>1 tap</strong><span>to approve and<br />get your receipt</span></li>
            </ul>
          </div>
          <InputPanel crops={crops?.length ? crops : FALLBACK_CROPS} location={location} running={false} onStart={onStart} />
        </div>
        <button type="button" className="scroll-cue" onClick={() => go("how")} aria-label="See how it works">
          <Icon name="down" size={18} />
        </button>
      </header>


      <section className="sec how" id="how">
        <Reveal className="how-photo">
          <img src="/img/onion-hand.jpg" alt="A farmer's gloved hand planting a young onion seedling in the soil" loading="lazy" />
          <p><Icon name="pin" size={15} /> Built around a Nashik onion grower, in one of India's biggest onion belts</p>
        </Reveal>
        <div className="how-body">
          <Reveal className="sec-head">
            <p className="kicker">How it works</p>
            <h2>A whole day of mandi running, done in a minute.</h2>
          </Reveal>
          <ol className="how-steps">
            {HOW.map((s, i) => (
              <Reveal as="li" key={s.title} className="how-step" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="how-num">{i + 1}</span>
                <div>
                  <h3><Icon name={s.icon} size={20} /> {s.title}</h3>
                  <p>{s.text}</p>
                  <ul className="tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="sec buyers-sec" id="buyers">
        <Reveal className="sec-head center">
          <p className="kicker">The people across the table</p>
          <h2>Three very different buyers. One best deal.</h2>
          <p className="sub">Each buyer has its own style, its own payment terms and its own distance from your farm. The agent has to weigh all of it.</p>
        </Reveal>
        <div className="buyer-cards">
          {list.map((b, i) => (
            <Reveal as="article" key={b.id} className="bcard" style={{ transitionDelay: `${i * 90}ms` }}>
              <div className="bcard-img" style={{ backgroundImage: `url(${BUYER_IMG[b.id] || "/img/market-veg.jpg"})` }}>
                <span className="rating"><Icon name="star" size={13} /> {b.rating}</span>
              </div>
              <div className="bcard-body">
                <h3>{b.name}</h3>
                <p className="muted">{b.kind} · {b.mandi}</p>
                <ul className="bfacts">
                  <li><Icon name="clock" size={16} /> {paymentText(b.paymentDays)}</li>
                  <li><Icon name="truck" size={16} /> {inr(b.transportPerQuintal)} per quintal to reach</li>
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="insight-band">
          <div className="insight-copy">
            <p className="kicker kicker-light">The twist</p>
            <h2>The highest offer is not always the best deal.</h2>
            <p>
              Far-away buyers pay more per quintal, but transport and slow payment eat the difference. MandiOS ranks
              deals by the money that actually reaches your hand.
            </p>
            <button type="button" className="btn btn-gold" onClick={focusForm}>Try it with your crop <Icon name="arrow" size={18} /></button>
          </div>
          <figure className="compare" aria-label="Example: headline price versus money in hand">
            <figcaption>40 quintal of onion, from a sample run</figcaption>
            <div className="cmp-block">
              <p className="cmp-title">What the buyer says</p>
              <div className="cmp-row"><span>GreenLeaf Exports</span><div className="bar"><i style={{ width: "100%" }} className="bar-ex" /></div><b>₹2,168</b></div>
              <div className="cmp-row"><span>Sahyadri FPO</span><div className="bar"><i style={{ width: "92%" }} className="bar-fpo-lite" /></div><b>₹1,993</b></div>
            </div>
            <div className="cmp-block">
              <p className="cmp-title">What reaches your hand</p>
              <div className="cmp-row"><span>GreenLeaf Exports</span><div className="bar"><i style={{ width: "97.8%" }} className="bar-ex" /></div><b>₹76,120</b></div>
              <div className="cmp-row win"><span>Sahyadri FPO</span><div className="bar"><i style={{ width: "100%" }} className="bar-fpo" /></div><b>₹77,800</b></div>
            </div>
            <p className="cmp-note"><Icon name="check" size={16} /> The agent picks the FPO: ₹1,680 more in hand.</p>
          </figure>
        </Reveal>
      </section>

      <section className="sec trust" id="trust">
        <div className="trust-bg" aria-hidden="true" />
        <div className="trust-inner">
          <Reveal className="sec-head">
            <p className="kicker kicker-light">Built to be trusted</p>
            <h2>An AI that bargains for you should never be able to hurt you.</h2>
            <p className="sub">These rules are enforced in code on every single move, not just requested in a prompt.</p>
          </Reveal>
          <ul className="rules">
            {RULES.map((r, i) => (
              <Reveal as="li" key={r.title} className="rule" style={{ transitionDelay: `${i * 70}ms` }}>
                <span className="rule-ic"><Icon name={r.icon} size={22} /></span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="cta">
        <div className="cta-bg" aria-hidden="true" />
        <Reveal className="cta-inner">
          <h2 lang="hi" className="hi">अब मंडी में खड़े रहने की ज़रूरत नहीं।</h2>
          <p>No more waiting in the mandi for a fair price. Let the agent do the haggling while you do the farming.</p>
          <button type="button" className="btn btn-gold btn-lg" onClick={focusForm}>Sell my crop <Icon name="arrow" size={20} /></button>
        </Reveal>
      </section>

      <footer className="site-foot">
        <Logo light />
        <p>
          Market prices, buyers and distances are sample data for this demo. Built during Bharat Agentic 2026.
          Photos from <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>.
        </p>
      </footer>
    </div>
  );
}
