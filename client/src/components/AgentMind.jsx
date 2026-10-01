import { useEffect, useRef } from "react";
import { TOOL_LABELS } from "../lib/format.js";
import Icon from "./Icon.jsx";

const ICON = { status: "arrow", thought: "brain", tool: "tool", guardrail: "shield", notice: "alert" };

const argText = (args) => Object.values(args || {}).join(", ");

// Server notices can carry a raw provider error (e.g. a 429 JSON body). Keep the message, drop the noise.
const cleanNotice = (text) => String(text || "").replace(/\s*\((?:LLM|Groq)[^)]*\)/g, "");

export default function AgentMind({ trace, running }) {
  const listRef = useRef(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [trace.length]);

  const tools = trace.filter((t) => t.kind === "tool").length;
  const blocks = trace.filter((t) => t.kind === "guardrail").length;

  return (
    <section className="mind" aria-label="Agent reasoning">
      <div className="mind-head">
        <h2><span className={`live-dot ${running ? "on" : ""}`} /> Agent's reasoning</h2>
        <div className="mind-stats">
          <span><b>{tools}</b> tool calls</span>
          <span><b>{blocks}</b> unsafe moves blocked</span>
        </div>
      </div>
      {trace.length === 0 ? (
        <p className="mind-empty">Each step the agent takes shows up here: what it thinks, which tool it calls, and what it finds.</p>
      ) : (
        <ol className="trace" ref={listRef}>
          {trace.map((t) => (
            <li key={t.id} className={`trace-${t.kind}`}>
              <span className="trace-icon"><Icon name={ICON[t.kind]} size={15} /></span>
              {t.kind === "tool" ? (
                <details>
                  <summary>
                    {TOOL_LABELS[t.name] || t.name}
                    {argText(t.args) && <span className="args"> {argText(t.args)}</span>}
                  </summary>
                  <pre>{JSON.stringify(t.result, null, 2)}</pre>
                </details>
              ) : (
                <span>{t.kind === "notice" ? cleanNotice(t.text) : t.text}</span>
              )}
            </li>
          ))}
          {running && <li className="trace-pending" aria-hidden="true"><span className="dots" /></li>}
        </ol>
      )}
    </section>
  );
}
