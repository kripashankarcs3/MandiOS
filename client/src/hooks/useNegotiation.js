import { useCallback, useEffect, useReducer, useRef } from "react";
import { API_BASE } from "../lib/format.js";

const initial = {
  status: "idle", // idle | running | done | error
  phase: null,
  sessionId: null,
  live: null,
  ctx: null,
  buyers: [],
  trace: [],
  plan: null,
  chats: {},
  results: {},
  decision: null,
  error: null,
};

let seq = 0;
const item = (fields) => ({ id: ++seq, ...fields });

function applyEvent(s, e) {
  switch (e.type) {
    case "session":
      return { ...s, sessionId: e.sessionId, live: e.live, ctx: e.ctx, buyers: e.buyers,
        chats: Object.fromEntries(e.buyers.map((b) => [b.id, []])) };
    case "status":
      return { ...s, phase: e.phase, trace: [...s.trace, item({ kind: "status", text: e.text })] };
    case "thought":
      return { ...s, trace: [...s.trace, item({ kind: "thought", text: e.text })] };
    case "tool":
      return { ...s, trace: [...s.trace, item({ kind: "tool", name: e.name, args: e.args, result: e.result })] };
    case "notice":
      return { ...s, trace: [...s.trace, item({ kind: "notice", text: e.text })] };
    case "guardrail":
      return {
        ...s,
        trace: [...s.trace, item({ kind: "guardrail", text: e.text })],
        chats: { ...s.chats, [e.buyerId]: [...(s.chats[e.buyerId] || []), item({ kind: "guardrail", text: e.text })] },
      };
    case "plan":
      return { ...s, plan: e.plan };
    case "msg":
      return { ...s, chats: { ...s.chats, [e.buyerId]: [...(s.chats[e.buyerId] || []), item({ kind: "msg", ...e })] } };
    case "result":
      return { ...s, results: { ...s.results, [e.buyerId]: e } };
    case "decision":
      return { ...s, decision: e, phase: "decided" };
    case "error":
      return { ...s, status: "error", error: e.text };
    case "done":
      return s.status === "error" ? s : { ...s, status: "done" };
    default:
      return s;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "start": return { ...initial, status: "running", ctx: action.ctx };
    case "fail": return { ...state, status: "error", error: action.error };
    case "reset": return initial;
    case "event": return applyEvent(state, action.event);
    default: return state;
  }
}

export function useNegotiation() {
  const [state, dispatch] = useReducer(reducer, initial);
  const esRef = useRef(null);

  const stop = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  const start = useCallback((ctx) => {
    stop();
    dispatch({ type: "start", ctx });
    const qs = new URLSearchParams({ crop: ctx.crop, quantity: String(ctx.quantity), floor: String(ctx.floor) });
    const es = new EventSource(`${API_BASE}/api/negotiate?${qs}`);
    esRef.current = es;
    let finished = false;

    es.onmessage = (m) => {
      let e;
      try { e = JSON.parse(m.data); } catch { return; }
      if (e.type === "done") { finished = true; es.close(); esRef.current = null; }
      dispatch({ type: "event", event: e });
    };
    es.onerror = () => {
      es.close();
      esRef.current = null;
      if (!finished) {
        dispatch({ type: "fail", error: "Lost connection to the server. Check that it is running, then press Find buyers again." });
      }
    };
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    dispatch({ type: "reset" });
  }, [stop]);

  useEffect(() => stop, [stop]);

  return { state, start, reset };
}
