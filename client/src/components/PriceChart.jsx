import { useRef, useState } from "react";
import { inr } from "../lib/format.js";

const W = 860;
const H = 340;
const PAD = { l: 64, r: 20, t: 22, b: 40 };
const dayLabel = (offset) =>
  offset === 0 ? "Today" : new Date(Date.now() + offset * 864e5).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Recent prices (solid), 7-day forecast (dashed) and its widening uncertainty band. Plain SVG, no chart library. */
export default function PriceChart({ history, forecast }) {
  const ref = useRef(null);
  const [hover, setHover] = useState(null);

  const points = [
    ...history.map((p) => ({ day: p.day, price: p.price, low: p.price, high: p.price, kind: "history" })),
    ...forecast.map((p) => ({ ...p, kind: "forecast" })),
  ];
  const lo = Math.min(...points.map((p) => p.low));
  const hi = Math.max(...points.map((p) => p.high));
  const span = Math.max(hi - lo, 1);
  const yMin = lo - span * 0.18;
  const yMax = hi + span * 0.18;
  const x = (day) => PAD.l + ((day + 7) / 14) * (W - PAD.l - PAD.r);
  const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const line = (list) => list.map((p, i) => `${i ? "L" : "M"}${x(p.day).toFixed(1)},${y(p.price).toFixed(1)}`).join(" ");

  const todayPt = points.find((p) => p.day === 0);
  const fLine = [todayPt, ...forecast];
  const band = [
    `M${x(0).toFixed(1)},${y(todayPt.price).toFixed(1)}`,
    ...forecast.map((p) => `L${x(p.day).toFixed(1)},${y(p.high).toFixed(1)}`),
    ...[...forecast].reverse().map((p) => `L${x(p.day).toFixed(1)},${y(p.low).toFixed(1)}`),
    "Z",
  ].join(" ");
  const grid = [0, 1, 2, 3].map((i) => yMin + ((yMax - yMin) * i) / 3);
  const ticks = [-7, -3, 0, 3, 7];

  const onMove = (e) => {
    const box = ref.current.getBoundingClientRect();
    const px = ((e.clientX - box.left) / box.width) * W;
    const day = Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * 14 - 7);
    setHover(points.find((p) => p.day === Math.max(-7, Math.min(7, day))) || null);
  };

  const tip = hover && {
    left: `${(x(hover.day) / W) * 100}%`,
    top: `${(y(hover.price) / H) * 100}%`,
  };

  return (
    <div className="pc">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Recent and forecast price per quintal"
        onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="pc-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#168a55" stopOpacity="0.22" />
            <stop offset="1" stopColor="#168a55" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {grid.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="pc-grid" />
            <text x={PAD.l - 10} y={y(v) + 4} textAnchor="end" className="pc-axis">{inr(v)}</text>
          </g>
        ))}
        {ticks.map((d) => (
          <text key={d} x={x(d)} y={H - 14} textAnchor="middle" className={`pc-axis ${d === 0 ? "pc-today" : ""}`}>{dayLabel(d)}</text>
        ))}

        <rect x={x(0)} y={PAD.t} width={W - PAD.r - x(0)} height={H - PAD.t - PAD.b} className="pc-future" />
        <text x={x(0) + 10} y={PAD.t + 14} className="pc-tag">FORECAST</text>
        <text x={x(0) - 10} y={PAD.t + 14} textAnchor="end" className="pc-tag">LAST 7 DAYS</text>

        <path d={band} fill="url(#pc-band)" />
        <path d={line(history)} className="pc-line pc-hist" fill="none" />
        <path d={line(fLine)} className="pc-line pc-fore" fill="none" />
        <line x1={x(0)} x2={x(0)} y1={PAD.t} y2={H - PAD.b} className="pc-now" />
        <circle cx={x(0)} cy={y(todayPt.price)} r="5" className="pc-dot" />
        <circle cx={x(7)} cy={y(forecast[6].price)} r="5" className="pc-dot pc-dot-end" />

        {hover && (
          <g>
            <line x1={x(hover.day)} x2={x(hover.day)} y1={PAD.t} y2={H - PAD.b} className="pc-cursor" />
            <circle cx={x(hover.day)} cy={y(hover.price)} r="5" className="pc-dot pc-dot-hover" />
          </g>
        )}
      </svg>

      {hover && (
        <div className="pc-tip" style={tip}>
          <b>{inr(hover.price)}</b>
          <span>{dayLabel(hover.day)}{hover.kind === "forecast" ? ` · ${inr(hover.low)} to ${inr(hover.high)}` : ""}</span>
        </div>
      )}
    </div>
  );
}
