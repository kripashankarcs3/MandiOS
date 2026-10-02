import "../workspace.css";
import { FALLBACK_CROPS, STEPS, inr } from "../lib/format.js";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
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

function StatusBadge({ state, receipt }) {
  if (state.status === "error") return <span className="ws-status ws-status-error"><Icon name="alert" size={15} /> Stopped</span>;
  if (receipt) return <span className="ws-status ws-status-done"><Icon name="check" size={15} /> Deal approved</span>;
  if (state.decision) return <span className="ws-status ws-status-ready"><Icon name="tap" size={15} /> Ready for approval</span>;
  return <span className="ws-status ws-status-run"><i /> Agents working</span>;
}

export default function Workspace({ state, meta, receipt, onApproved, onReset, onNavigate }) {
  const running = state.status === "running";
  const ctx = state.ctx;
  const crop = meta?.crops?.find((c) => c.id === ctx?.crop);
  const step = currentStep(state, receipt);
  const live = state.live ?? meta?.live;

  return (
    <div className="lp ws">
      <SiteHeader live={live} active="sell" onNavigate={onNavigate} />

      <section className="ws-head">
        <div className="ws-wrap">
          <p className="ws-crumbs">
            <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}>Home</a>
            <Icon name="chevron" size={14} />
            <span>Negotiation</span>
          </p>
          {ctx && (
            <div className="ws-title-row">
              <div className="ws-title">
                <span className="ws-crop"><CropIcon crop={ctx.crop} size={38} /></span>
                <div>
                  <h1>
                    {ctx.quantity} quintal {crop?.label || ctx.crop}
                    {crop?.hi && <span lang="hi"> · {crop.hi}</span>}
                  </h1>
                  <p className="ws-meta">
                    <span><Icon name="shield" size={15} /> Minimum {inr(ctx.floor)} per quintal, protected</span>
                    {meta?.location && <span><Icon name="pin" size={15} /> {meta.location}</span>}
                  </p>
                </div>
              </div>
              <StatusBadge state={state} receipt={receipt} />
            </div>
          )}
          <Stepper current={step} failed={state.status === "error"} />
        </div>
      </section>

      <div className="ws-wrap ws-body">
        {state.error && <div className="alert" role="alert"><Icon name="alert" size={20} /> {state.error}</div>}

        <div className="ws-grid">
          <aside className="ws-left">
            <PlanStrip plan={state.plan} phase={state.phase} running={running} />
            <AgentMind trace={state.trace} running={running} />
          </aside>

          <main className="ws-center" aria-live="polite">
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
          </main>
        </div>

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
      </div>

      <SiteFooter crops={meta?.crops || FALLBACK_CROPS} onNavigate={onNavigate} />
    </div>
  );
}
