import { useEffect, useState } from "react";
import { useNegotiation } from "./hooks/useNegotiation.js";
import { API_BASE, FALLBACK_CROPS } from "./lib/format.js";
import Landing from "./components/Landing.jsx";
import Workspace from "./components/Workspace.jsx";

export default function App() {
  const [meta, setMeta] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const { state, start, reset } = useNegotiation();

  useEffect(() => {
    fetch(`${API_BASE}/api/meta`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setMeta)
      .catch(() => setMeta(null));
  }, []);

  const onStart = (ctx) => {
    setReceipt(null);
    start(ctx);
    window.scrollTo({ top: 0 });
  };

  const onReset = () => {
    reset();
    setReceipt(null);
    window.scrollTo({ top: 0 });
  };

  if (state.status === "idle") {
    return (
      <Landing
        crops={meta?.crops || FALLBACK_CROPS}
        buyers={meta?.buyers}
        location={meta?.location}
        live={meta?.live}
        onStart={onStart}
      />
    );
  }

  return <Workspace state={state} meta={meta} receipt={receipt} onApproved={setReceipt} onReset={onReset} />;
}
