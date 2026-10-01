import { STEPS, inr } from "../lib/format.js";
import Logo from "./Logo.jsx";
import Icon from "./Icon.jsx";
import CropIcon from "./CropIcon.jsx";
import AgentMind from "./AgentMind.jsx";
import PlanStrip from "./PlanStrip.jsx";
import BuyerColumn from "./BuyerColumn.jsx";
import DealPanel from "./DealPanel.jsx";

function currentStep(state, receipt) {
  const phase = state.phase;
  const done = [
    Boolean(state.plan),
    ["negotiate", "decide", "decided"].includes(phase),
    ["decide", "decided"].includes(phase),
    Boolean(state.decision),
    Boolean(receipt),
  ];
  const idx = done.findIndex((d) => !d);
  return idx === -1 ? STEPS.length : idx;
}

function Stepper({ current, failed }) {
  return (
    <ol className="stepper" aria-label="Progress">
      {STEPS.map((label, i) => {
        const status = i < current ? "done" : i === current ? (failed ? "failed" : "now") : "todo";
        return (
          <li key={label} className={`st st-${status}`} aria-current={status === "now" ? "step" : undefined}>
            <span className="st-dot">{status === "done" ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="st-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export default function Workspace({ state, meta, receipt, onApproved, onReset }) {
  const running = state.status === "running";
  const ctx = state.ctx;
  const crop = meta?.crops?.find((c) => c.id === ctx?.crop);
  const step = currentStep(state, receipt);

  return (
    <div className="work">
      <header className="work-top">
        <Logo light />
        <div className="work-top-end">
          {(state.live ?? meta?.live) != null && (
            <span className={`pill ${(state.live ?? meta?.live) ? "pill-live" : "pill-off"}`}
              title={(state.live ?? meta?.live) ? "Agents are powered by an LLM" : "Rule-based agents, no API key set"}>
              <i /> {(state.live ?? meta?.live) ? "Live AI" : "Offline demo"}
            </span>
          )}
          <button type="button" className="btn btn-ghost-light btn-sm" onClick={onReset}>
            <Icon name="back" size={16} /> New sale
          </button>
        </div>
      </header>

      <section className="work-banner">
        <div className="work-banner-bg" aria-hidden="true" />
        <div className="work-banner-inner">
          {ctx && (
            <div className="req">
              <span className="req-icon"><CropIcon crop={ctx.crop} size={44} /></span>
              <div>
                <p className="req-kicker">Selling</p>
                <h1>
                  {ctx.quantity} quintal {crop?.label || ctx.crop}
                  {crop?.hi && <span lang="hi"> · {crop.hi}</span>}
                </h1>
                <p className="req-meta">
                  Minimum {inr(ctx.floor)} per quintal
                  {meta?.location && <> · <Icon name="pin" size={14} /> {meta.location}</>}
                </p>
              </div>
            </div>
          )}
          <Stepper current={step} failed={state.status === "error"} />
        </div>
      </section>

      <div className="work-grid">
        <aside className="work-side">
          <AgentMind trace={state.trace} running={running} />
        </aside>

        <main className="work-main" aria-live="polite">
          {state.error && <div className="alert" role="alert"><Icon name="alert" size={20} /> {state.error}</div>}
          <PlanStrip plan={state.plan} phase={state.phase} running={running} />
          <section className="buyers" aria-label="Negotiations">
            {state.buyers.map((b) => (
              <BuyerColumn
                key={b.id}
                buyer={b}
                plan={state.plan}
                ctx={ctx}
                chat={state.chats[b.id] || []}
                result={state.results[b.id]}
                isBest={state.decision?.bestBuyerId === b.id}
              />
            ))}
          </section>
          {state.decision && (
            <DealPanel
              decision={state.decision}
              results={state.results}
              buyers={state.buyers}
              sessionId={state.sessionId}
              receipt={receipt}
              onApproved={onApproved}
            />
          )}
        </main>
      </div>

      <footer className="site-foot site-foot-light">
        <p>Market prices, buyers and distances are sample data for this demo. Built during Bharat Agentic 2026.</p>
      </footer>
    </div>
  );
}
