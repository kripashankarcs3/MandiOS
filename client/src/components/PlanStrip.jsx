import { inr } from "../lib/format.js";
import Icon from "./Icon.jsx";

export default function PlanStrip({ plan, phase, running }) {
  if (!plan) {
    return (
      <section className="plan plan-pending">
        <span className="spinner" aria-hidden="true" />
        <p>{running ? "Researching mandi prices, the weekly trend and each buyer before making a plan…" : "No plan yet."}</p>
      </section>
    );
  }
  const trend = plan.trend_pct_7d ?? 0;
  return (
    <section className="plan" aria-label="Selling plan">
      <div className="plan-figures">
        <div><span className="plan-label">Target price</span><strong>{inr(plan.target_price)}</strong></div>
        <div><span className="plan-label">Opening ask</span><strong>{inr(plan.opening_ask)}</strong></div>
        <div>
          <span className="plan-label">Next 7 days</span>
          <strong className={trend > 0 ? "up" : trend < 0 ? "down" : ""}>{trend > 0 ? "+" : ""}{trend}%</strong>
        </div>
      </div>
      <div className="plan-text">
        <p className={plan.sell_now ? "advice" : "advice advice-wait"}>
          <Icon name={plan.sell_now ? "check" : "clock"} size={18} />
          {plan.sell_now ? "Sell now: prices are not expected to rise much." : "Prices are rising. Consider waiting a week; showing today's best deals anyway."}
        </p>
        <p className="strategy">{plan.strategy}{phase === "negotiate" ? " Talking to all buyers at once." : ""}</p>
      </div>
    </section>
  );
}
