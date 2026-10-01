import { useEffect, useRef, useState } from "react";
import "../landing.css";
import { BUYER_IMG, FALLBACK_BUYERS, FALLBACK_CROPS, inr, paymentText } from "../lib/format.js";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";
import CropIcon from "./CropIcon.jsx";
import InputPanel from "./InputPanel.jsx";

const LINKS = [
  ["home", "Home"],
  ["how", "How it works"],
  ["features", "Features"],
  ["crops", "Crops"],
  ["buyers", "For Buyers"],
  ["about", "About"],
];

// Page sections in order, with the nav link each one belongs to.
const SPY = [["home", "home"], ["features", "features"], ["start", "home"], ["how", "how"], ["trust", "features"], ["crops", "crops"], ["buyers", "buyers"], ["about", "about"]];

const STRIP = [
  { icon: "chart", tone: "g", title: "Live Mandi Prices", text: "Across nearby mandis" },
  { icon: "chat", tone: "y", title: "AI Negotiates for You", text: "With multiple buyers" },
  { icon: "shield", tone: "r", title: "Your Minimum Price", text: "Always protected" },
  { icon: "doc", tone: "b", title: "One-Tap Approval", text: "Get receipt & WhatsApp confirmation" },
];

const HOW = [
  { icon: "search", tone: "g", title: "Research", text: "Checks prices in three mandis, the 7-day trend, every buyer's record and the transport cost to reach them.", tags: ["Mandi prices", "7-day forecast", "Buyer profiles", "Transport"] },
  { icon: "target", tone: "y", title: "Plan", text: "Sets a target price and an opening ask, and tells you honestly whether waiting a week would pay more.", tags: ["Target price", "Sell now or wait"] },
  { icon: "chat", tone: "b", title: "Bargain", text: "Negotiates with all three buyers at the same time, in Hindi, for up to six rounds.", tags: ["3 buyers in parallel", "Hindi"] },
  { icon: "tap", tone: "r", title: "Approve", text: "Ranks every deal by the money that reaches your hand. One tap confirms. Nothing is final before that.", tags: ["Net earnings", "Your approval"] },
];

const RULES = [
  { icon: "shield", tone: "g", title: "Your floor is law", text: "Every move is checked in code. The agent cannot offer or accept anything below your minimum price." },
  { icon: "scale", tone: "y", title: "Buyers stay realistic", text: "Buyer agents can never go past their own hidden limit, so there are no made-up deals." },
  { icon: "clock", tone: "r", title: "No endless haggling", text: "A hard limit of six rounds per buyer. The agent closes the deal or walks away." },
  { icon: "tap", tone: "b", title: "You press the button", text: "The agent recommends and you approve. Only then do you get a receipt and a WhatsApp message." },
];

const FAQ = [
  { q: "Is this a real marketplace?", a: "Not yet. Prices, buyers and distances are sample data for this demo. The agents, the negotiation and the safety rules are real and run live." },
  { q: "Can the agent sell below my minimum price?", a: "No. Every move is checked in code before it is sent. The agent cannot offer or accept anything below the minimum you set." },
  { q: "Does it sell my crop without asking me?", a: "Never. The agent recommends the best deal and you approve it with one tap. Only then do you get a receipt and a WhatsApp message to send." },
  { q: "Which language does it bargain in?", a: "The farmer's agent speaks Hindi. The buyer agents answer in English, so you can follow the whole conversation." },
  { q: "What happens if the AI model fails?", a: "Rule-based backup agents take over that step, so a negotiation never stops half way. You will see a notice when this happens." },
];

const BUYER_ICON = { trader: "store", exporter: "building" };

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!("IntersectionObserver" in window)) { el.classList.add("in"); return undefined; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("in"); io.disconnect(); }
    }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}

function IndiaMap() {
  return (
    <svg width="46" height="52" viewBox="0 0 64 72" fill="currentColor" aria-hidden="true">
      <path d="M30 2l6 2 4 6 6 2 6 6 6 4-4 6 4 4-6 2-2 6-4-2-4 6-4 10-4 12-4 2-4-10-4-8-4-6-6-4-4-6 6-2-4-6 6-4 6 2 2-8 4-4-2-6z" />
    </svg>
  );
}

const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function Landing({ crops, buyers, location, live, onStart }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");

  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 8);
      let cur = "home";
      for (const [id, owner] of SPY) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 260) cur = owner;
      }
      setActive(cur);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const list = buyers?.length ? buyers : FALLBACK_BUYERS;
  const cropList = crops?.length ? crops : FALLBACK_CROPS;
  const link = (id) => (e) => { e.preventDefault(); go(id); };
  const getStarted = () => {
    go("start");
    setTimeout(() => document.getElementById("qty")?.focus({ preventScroll: true }), 500);
  };
  const watchDemo = () => onStart({ crop: "onion", quantity: 40, floor: 1700 });
  const short = (n) => n.split(" ").slice(0, 2).join(" ");

  return (
    <div className="landing lp">
      <nav className={`lp-nav ${scrolled ? "scrolled" : ""}`} aria-label="Main">
        <div className="lp-nav-in">
          <Logo onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <div className="lp-links">
            {LINKS.map(([id, label]) => (
              <a key={id} href={`#${id}`} className={active === id ? "on" : ""} onClick={link(id)}>{label}</a>
            ))}
          </div>
          <div className="lp-nav-end">
            {live != null && (
              <span className={`pill ${live ? "pill-live" : "pill-off"}`} title={live ? "Agents are powered by an LLM" : "Rule-based agents, no API key set"}>
                <i /> {live ? "Live AI" : "Offline demo"}
              </span>
            )}
            <button type="button" className="btn btn-dark" onClick={getStarted}>Get Started <Icon name="arrow" size={18} /></button>
          </div>
        </div>
      </nav>

      <header className="lp-hero" id="home">
        <div className="lp-hero-photo" role="img" aria-label="A smiling farmer talking on his phone" />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-badge"><Icon name="tap" size={18} /> Bharat Agentic 2026 <span aria-hidden="true">·</span> AgriTech + Bharat Languages</p>
            <h1>A smarter deal<br /> for every kisaan</h1>
            <p className="lp-lead">
              MandiOS is the AI agent layer for India's mandis. The Bargaining Agent researches mandi prices,
              negotiates with multiple buyers, and brings you the best deal for one-tap approval.
            </p>
            <div className="lp-cta">
              <button type="button" className="btn btn-dark btn-xl" onClick={getStarted}>Get Started <Icon name="arrow" size={20} /></button>
              <button type="button" className="btn btn-line btn-xl" onClick={watchDemo}><Icon name="play" size={22} /> Watch Demo</button>
            </div>
          </div>

          <aside className="lp-cards" aria-label="Sample negotiation">
            <div className="lp-card lp-price">
              <CropIcon crop="onion" size={56} />
              <div>
                <small>Onion (Nashik)</small>
                <b>₹1,950</b>
                <span>+2% next 7 days <Icon name="trend" size={15} /></span>
              </div>
            </div>
            <div className="lp-card lp-buyers">
              <h3>{list.length} Buyers Negotiating</h3>
              <div className="lp-avatars">
                {list.map((b, i) => (
                  <div key={b.id} className={`lp-av ${"abc"[i % 3]}`}>
                    <i>{b.id === "fpo" ? <b>M</b> : <Icon name={BUYER_ICON[b.id] || "store"} size={22} />}</i>
                    {short(b.name)}
                  </div>
                ))}
              </div>
            </div>
            <div className="lp-card lp-best">
              <i><Icon name="check" size={22} /></i>
              <div><b>Best deal found!</b><span>₹77,800 in hand · Sahyadri FPO</span></div>
              <Icon name="chevron" size={18} />
            </div>
            <p className="lp-sample">Sample data</p>
          </aside>
        </div>
      </header>

      <section className="lp-strip" id="features" aria-label="What MandiOS does">
        <div className="lp-wrap lp-strip-grid">
          {STRIP.map((f) => (
            <div key={f.title} className="lp-feat">
              <span className={`lp-ic ${f.tone}`}><Icon name={f.icon} size={28} /></span>
              <div><h3>{f.title}</h3><p>{f.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-stats" aria-label="MandiOS in numbers">
        <div className="lp-wrap lp-stats-grid">
          <div className="lp-stat"><b>{list.length}</b><span>Buyer Agents</span></div>
          <div className="lp-stat"><b>{cropList.length}</b><span>Crops Supported</span></div>
          <div className="lp-stat"><b>100%</b><span>Farmer's Minimum Protected</span></div>
          <div className="lp-stat map"><IndiaMap /><div><b>Bharat Focused</b><span>Built for Indian farmers</span></div></div>
        </div>
      </section>

      <section className="lp-sec" id="start">
        <div className="lp-wrap lp-start">
          <Reveal className="lp-start-copy">
            <p className="lp-eyebrow">Start selling</p>
            <h2>Tell MandiOS what you grow.</h2>
            <p>Enter your crop, how much you have and the lowest price you will take. The agent does the rest.</p>
            <ul className="lp-points">
              <li><span className="lp-ic g"><Icon name="lock" size={20} /></span><div><b>Your minimum is protected</b><span>The agent never offers or accepts less.</span></div></li>
              <li><span className="lp-ic y"><Icon name="chat" size={20} /></span><div><b>Three buyers at once</b><span>A trader, a farmer collective and an exporter.</span></div></li>
              <li><span className="lp-ic b"><Icon name="doc" size={20} /></span><div><b>One deal to approve</b><span>You get a receipt and a Hindi WhatsApp message.</span></div></li>
            </ul>
          </Reveal>
          <Reveal><InputPanel crops={cropList} location={location} running={false} onStart={onStart} /></Reveal>
        </div>
      </section>

      <section className="lp-sec soft" id="how">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <p className="lp-eyebrow">How it works</p>
            <h2>A whole day of mandi running, done in a minute.</h2>
          </Reveal>
          <div className="lp-steps">
            {HOW.map((s, i) => (
              <Reveal key={s.title} className="lp-step" style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="lp-step-top"><span className={`lp-ic ${s.tone}`}><Icon name={s.icon} size={24} /></span><b>0{i + 1}</b></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="lp-tags">{s.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-sec" id="trust">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <p className="lp-eyebrow">Built to be trusted</p>
            <h2>An AI that bargains for you should never be able to hurt you.</h2>
            <p>These rules are enforced in code on every single move, not just requested in a prompt.</p>
          </Reveal>
          <div className="lp-rules">
            {RULES.map((r, i) => (
              <Reveal key={r.title} className="lp-rule" style={{ transitionDelay: `${i * 60}ms` }}>
                <span className={`lp-ic ${r.tone}`}><Icon name={r.icon} size={24} /></span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-sec soft" id="crops">
        <div className="lp-wrap">
          <Reveal className="lp-head center">
            <p className="lp-eyebrow">Crops</p>
            <h2>Five crops, ready to sell.</h2>
            <p>Pick one and the agent starts with sensible defaults for price and quantity.</p>
          </Reveal>
          <div className="lp-crops">
            {cropList.map((c) => (
              <Reveal as="a" key={c.id} className="lp-crop" href="#start" onClick={link("start")}>
                <CropIcon crop={c.id} size={64} />
                <div><b>{c.label}</b><span lang="hi">{c.hi}</span></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="lp-sec" id="buyers">
        <div className="lp-wrap">
          <Reveal className="lp-head">
            <p className="lp-eyebrow">For buyers</p>
            <h2>Three very different buyers. One best deal.</h2>
            <p>Each buyer has its own style, payment terms and distance from your farm. The agent weighs all of it.</p>
          </Reveal>
          <div className="lp-bcards">
            {list.map((b, i) => (
              <Reveal key={b.id} className="lp-bcard" style={{ transitionDelay: `${i * 70}ms` }}>
                <div className="lp-bimg" style={{ backgroundImage: `url(${BUYER_IMG[b.id] || "/img/market-veg.jpg"})` }}>
                  <span className="lp-rate"><Icon name="star" size={13} /> {b.rating}</span>
                </div>
                <div className="lp-bbody">
                  <h3>{b.name}</h3>
                  <p>{b.kind} · {b.mandi}</p>
                  <ul className="lp-bfacts">
                    <li><Icon name="clock" size={16} /> {paymentText(b.paymentDays)}</li>
                    <li><Icon name="truck" size={16} /> {inr(b.transportPerQuintal)} per quintal to reach</li>
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal className="lp-twist">
            <div>
              <p className="lp-eyebrow">The twist</p>
              <h2>The highest offer is not always the best deal.</h2>
              <p>Far-away buyers pay more per quintal, but transport and slow payment eat the difference. MandiOS ranks deals by the money that actually reaches your hand.</p>
              <button type="button" className="btn btn-dark" onClick={getStarted}>Try it with your crop <Icon name="arrow" size={18} /></button>
            </div>
            <figure className="lp-compare" aria-label="Example: headline price versus money in hand">
              <figcaption>40 quintal of onion, from a sample run</figcaption>
              <div>
                <p className="lp-cmp-title">What the buyer says</p>
                <div className="lp-cmp"><span>GreenLeaf Exports</span><div className="lp-bar"><i className="ex" style={{ width: "100%" }} /></div><b>₹2,168</b></div>
                <div className="lp-cmp"><span>Sahyadri FPO</span><div className="lp-bar"><i className="fl" style={{ width: "92%" }} /></div><b>₹1,993</b></div>
              </div>
              <div>
                <p className="lp-cmp-title">What reaches your hand</p>
                <div className="lp-cmp"><span>GreenLeaf Exports</span><div className="lp-bar"><i className="ex" style={{ width: "97.8%" }} /></div><b>₹76,120</b></div>
                <div className="lp-cmp win"><span>Sahyadri FPO</span><div className="lp-bar"><i className="fp" style={{ width: "100%" }} /></div><b>₹77,800</b></div>
              </div>
              <p className="lp-note"><Icon name="check" size={16} /> The agent picks the FPO: ₹1,680 more in hand.</p>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="lp-sec soft" id="about">
        <div className="lp-wrap lp-about">
          <Reveal className="lp-about-copy">
            <p className="lp-eyebrow">About</p>
            <h2>The AI agent layer for India's mandis.</h2>
            <p>MandiOS starts with one agent: the Bargaining Agent. It researches prices, negotiates with buyers and closes the best deal for the farmer, while safety rules in code keep the farmer in control.</p>
            <p>Built during Bharat Agentic 2026 (AgriTech + Bharat Languages). All market data in this demo is sample data.</p>
            <img className="lp-about-img" src="/img/farmer-paddy.jpg" alt="A farmer ploughing a flooded paddy field with a tractor and a pair of oxen" loading="lazy" />
          </Reveal>
          <Reveal className="lp-faq">
            {FAQ.map((f) => (
              <details key={f.q} className="lp-q">
                <summary>{f.q}<Icon name="plus" size={18} /></summary>
                <p>{f.a}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <footer className="lp-foot">
        <div className="lp-wrap">
          <div className="lp-foot-grid">
            <div className="lp-foot-brand">
              <Logo light />
              <p>The AI agent layer for India's mandis. The Bargaining Agent researches, negotiates with buyers and closes the best deal for the farmer.</p>
            </div>
            <nav aria-label="Product">
              <h3>Product</h3>
              <a href="#how" onClick={link("how")}>How it works</a>
              <a href="#features" onClick={link("features")}>Features</a>
              <a href="#crops" onClick={link("crops")}>Crops</a>
              <a href="#buyers" onClick={link("buyers")}>For Buyers</a>
            </nav>
            <div className="lp-foot-col">
              <h3>Crops</h3>
              {cropList.map((c) => <span key={c.id}>{c.label}</span>)}
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
    </div>
  );
}
